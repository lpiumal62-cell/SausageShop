package com.eagle.sausageshop.service;

import com.eagle.sausageshop.dto.UserDTO;
import com.eagle.sausageshop.entity.*;
import com.eagle.sausageshop.util.AppUtil;
import com.eagle.sausageshop.util.HibernateUtil;
import com.eagle.sausageshop.validation.Validator;
import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.ws.rs.core.Context;
import org.hibernate.Session;
import org.hibernate.Transaction;

import java.util.List;

public class AdminService {

    public String adminLogin(UserDTO userDTO, @Context HttpServletRequest request) {

        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        if (userDTO.getEmail() == null || userDTO.getEmail().isBlank()) {
            message = "Email is required!";
        } else if (!userDTO.getEmail().matches(Validator.EMAIL_VALIDATION)) {
            message = "Please provide a valid email address!";
        } else if (userDTO.getPassword() == null || userDTO.getPassword().isBlank()) {
            message = "Password is required!";
        } else {

            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
            Transaction transaction = null;

            try {
                transaction = hibernateSession.beginTransaction();

                User user = hibernateSession.createQuery(
                                "FROM User u WHERE u.email = :email",
                                User.class
                        ).setParameter("email", userDTO.getEmail())
                        .uniqueResult();

//                System.out.println("=== DEBUG LOGIN ===");
//                System.out.println("Input Email   : " + userDTO.getEmail());
//                System.out.println("Input Password: " + userDTO.getPassword());
//
//                if (user != null) {
//                    System.out.println("DB Email      : " + user.getEmail());
//                    System.out.println("DB Password   : " + user.getPassword());
//                    System.out.println("DB Role Name  : " + (user.getRole() != null ? user.getRole().getName() : "NULL"));
//                } else {
//                    System.out.println("DB User not found");
//                }

                if (user == null) {
                    message = "Invalid email or password!";
                } else if (!userDTO.getPassword().equals(user.getPassword())) {
                    message = "Invalid email or password!";
                } else if (user.getRole() == null || !"ADMIN".equals(user.getRole().getName())) {
                    message = "Access denied! Admins only.";
                } else {
                    Seller seller = hibernateSession.createQuery(
                                    "FROM Seller s WHERE s.user = :user",
                                    Seller.class
                            ).setParameter("user", user)
                            .uniqueResult();

                    if (seller == null) {
                        message = "Seller account not found!";
                    } else if (!Status.Type.APPROVED.name().equals(seller.getStatus().getValue())) {
                        message = "Account not approved yet!";
                    } else {

                        HttpSession session = request.getSession(true);
                        session.setAttribute("user", user);
                        session.setAttribute("role", "ADMIN");

                        status = true;
                        message = "Admin login successful!";
                    }
                }
                transaction.commit();
            } catch (Exception e) {
                if (transaction != null) transaction.rollback();
                e.printStackTrace();
                message = "Server error! Please try again later.";
            } finally {
                hibernateSession.close();
            }
        }
        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    public String getDashboardStats() {
        JsonObject responseObject = new JsonObject();
        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();

        try {
            // Total Orders
            Long totalOrders = hibernateSession.createQuery(
                "SELECT COUNT(o) FROM Order o", Long.class
            ).uniqueResult();

            // Total Sales
            Double totalSales = hibernateSession.createQuery(
                "SELECT SUM(oi.qty * s.price) FROM OrderItem oi JOIN oi.stock s", Double.class
            ).uniqueResult();

            // Total Customers
            Long totalCustomers = hibernateSession.createQuery(
                "SELECT COUNT(u) FROM User u WHERE u.role.name = 'USER'", Long.class
            ).uniqueResult();

            // Total Products
            Long totalProducts = hibernateSession.createQuery(
                "SELECT COUNT(p) FROM Product p", Long.class
            ).uniqueResult();

            responseObject.addProperty("totalOrders", totalOrders != null ? totalOrders : 0);
            responseObject.addProperty("totalSales", totalSales != null ? totalSales : 0.0);
            responseObject.addProperty("totalCustomers", totalCustomers != null ? totalCustomers : 0);
            responseObject.addProperty("totalProducts", totalProducts != null ? totalProducts : 0);
            responseObject.addProperty("status", true);
        } catch (Exception e) {
            e.printStackTrace();
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Error loading stats: " + e.getMessage());
        } finally {
            hibernateSession.close();
        }

        return AppUtil.GSON.toJson(responseObject);
    }

    public String getAllProducts() {
        JsonObject responseObject = new JsonObject();
        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();

        try {
            List<Product> products = hibernateSession.createQuery(
                "FROM Product p LEFT JOIN FETCH p.category ORDER BY p.id DESC",Product.class
            ).getResultList();

            responseObject.add("products", AppUtil.GSON.toJsonTree(products(products)));
            responseObject.addProperty("status", true);
        } catch (Exception e) {
            e.printStackTrace();
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Error loading products: " + e.getMessage());
        } finally {
            hibernateSession.close();
        }

        return AppUtil.GSON.toJson(responseObject);
    }

    public String updateProduct(int productId, String jsonData) {
        JsonObject responseObject = new JsonObject();
        JsonObject requestObject = AppUtil.GSON.fromJson(jsonData, JsonObject.class);
        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
        Transaction transaction = null;

        try {
            transaction = hibernateSession.beginTransaction();

            Product product = hibernateSession.get(Product.class, productId);
            if (product == null) {
                responseObject.addProperty("status", false);
                responseObject.addProperty("message", "Product not found");
                return AppUtil.GSON.toJson(responseObject);
            }

            if (requestObject.has("title")) product.setTitle(requestObject.get("title").getAsString());
            if (requestObject.has("price")) product.setPrice(requestObject.get("price").getAsDouble());
            if (requestObject.has("salePrice")) {
                if (requestObject.get("salePrice").isJsonNull()) {
                    product.setSalePrice(null);
                } else {
                    product.setSalePrice(requestObject.get("salePrice").getAsDouble());
                }
            }
            if (requestObject.has("stockQuantity")) product.setStockQuantity(requestObject.get("stockQuantity").getAsInt());

            hibernateSession.merge(product);
            transaction.commit();
            responseObject.addProperty("status", true);
            responseObject.addProperty("message", "Product updated successfully");
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            e.printStackTrace();
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Error updating product: " + e.getMessage());
        } finally {
            hibernateSession.close();
        }

        return AppUtil.GSON.toJson(responseObject);
    }

    public String deleteProduct(int productId) {
        JsonObject responseObject = new JsonObject();
        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
        Transaction transaction = null;

        try {
            transaction = hibernateSession.beginTransaction();

            Product product = hibernateSession.get(Product.class, productId);
            if (product != null) {
                hibernateSession.remove(product);
                transaction.commit();
                responseObject.addProperty("status", true);
                responseObject.addProperty("message", "Product deleted successfully");
            } else {
                responseObject.addProperty("status", false);
                responseObject.addProperty("message", "Product not found");
            }
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            e.printStackTrace();
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Error deleting product: " + e.getMessage());
        } finally {
            hibernateSession.close();
        }

        return AppUtil.GSON.toJson(responseObject);
    }

    public String getAllOrders() {
        JsonObject responseObject = new JsonObject();
        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();

        try {
            List<Order> orders = hibernateSession.createQuery(
                "FROM Order o LEFT JOIN FETCH o.user LEFT JOIN FETCH o.status LEFT JOIN FETCH o.deliveryType ORDER BY o.createdAt DESC",Order.class
            ).getResultList();

            responseObject.add("orders", AppUtil.GSON.toJsonTree(adminOrders(orders)));
            responseObject.addProperty("status", true);
        } catch (Exception e) {
            e.printStackTrace();
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Error loading orders: " + e.getMessage());
        } finally {
            hibernateSession.close();
        }

        return AppUtil.GSON.toJson(responseObject);
    }

    public String updateOrderStatus(int orderId, String jsonData) {
        JsonObject responseObject = new JsonObject();
        JsonObject requestObject = AppUtil.GSON.fromJson(jsonData, JsonObject.class);
        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
        Transaction transaction = null;

        try {
            transaction = hibernateSession.beginTransaction();

            Order order = hibernateSession.get(Order.class, orderId);
            if (order == null) {
                responseObject.addProperty("status", false);
                responseObject.addProperty("message", "Order not found");
                return AppUtil.GSON.toJson(responseObject);
            }

            if (requestObject.has("status")) {
                String statusValue = requestObject.get("status").getAsString();
                Status status = hibernateSession.createQuery(
                    "FROM Status s WHERE s.value = :value", Status.class
                ).setParameter("value", statusValue).uniqueResult();

                if (status != null) {
                    order.setStatus(status);
                    hibernateSession.merge(order);
                    transaction.commit();
                    responseObject.addProperty("status", true);
                    responseObject.addProperty("message", "Order status updated successfully");
                } else {
                    responseObject.addProperty("status", false);
                    responseObject.addProperty("message", "Invalid status");
                }
            } else {
                responseObject.addProperty("status", false);
                responseObject.addProperty("message", "Status is required");
            }
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            e.printStackTrace();
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Error updating order: " + e.getMessage());
        } finally {
            hibernateSession.close();
        }

        return AppUtil.GSON.toJson(responseObject);
    }

    public String getAllCustomers() {
        JsonObject responseObject = new JsonObject();
        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();

        try {
            List<User> customers = hibernateSession.createQuery(
                "FROM User u LEFT JOIN FETCH u.role WHERE u.role.name = 'USER' ORDER BY u.createdAt DESC", User.class
            ).getResultList();

            responseObject.add("customers", AppUtil.GSON.toJsonTree(customers(customers)));
            responseObject.addProperty("status", true);
        } catch (Exception e) {
            e.printStackTrace();
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Error loading customers: " + e.getMessage());
        } finally {
            hibernateSession.close();
        }

        return AppUtil.GSON.toJson(responseObject);
    }

    public String getProductById(int productId) {
        JsonObject responseObject = new JsonObject();
        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();

        try {
            Product product = hibernateSession.get(Product.class, productId);
            
            if (product == null) {
                responseObject.addProperty("status", false);
                responseObject.addProperty("message", "Product not found");
            } else {
                JsonObject productObj = new JsonObject();
                productObj.addProperty("id", product.getId());
                productObj.addProperty("title", product.getTitle());
                productObj.addProperty("shortDescription", product.getShortDescription() != null ? product.getShortDescription() : "");
                productObj.addProperty("longDescription", product.getLongDescription() != null ? product.getLongDescription() : "");
                productObj.addProperty("price", product.getPrice());
                productObj.addProperty("salePrice", product.getSalePrice() != null ? product.getSalePrice() : 0);
                productObj.addProperty("stockQuantity", product.getStockQuantity());
                productObj.addProperty("sku", product.getSku() != null ? product.getSku() : "");
                productObj.addProperty("categoryId", product.getCategory() != null ? product.getCategory().getId() : 0);
                productObj.addProperty("categoryName", product.getCategory() != null ? product.getCategory().getName() : "");
                productObj.addProperty("ingredients", product.getIngredients() != null ? product.getIngredients() : "");
                productObj.addProperty("calories", product.getCalories() != null ? product.getCalories() : 0);
                productObj.addProperty("protein", product.getProtein() != null ? product.getProtein() : 0);
                productObj.addProperty("fat", product.getFat() != null ? product.getFat() : 0);
                productObj.addProperty("carbs", product.getCarbs() != null ? product.getCarbs() : 0);
                
                // Add images array
                if (product.getImages() != null && !product.getImages().isEmpty()) {
                    com.google.gson.JsonArray imagesArray = new com.google.gson.JsonArray();
                    for (String imageUrl : product.getImages()) {
                        imagesArray.add(imageUrl);
                    }
                    productObj.add("images", imagesArray);
                } else {
                    productObj.add("images", new com.google.gson.JsonArray());
                }
                
                responseObject.add("product", productObj);
                responseObject.addProperty("status", true);
            }
        } catch (Exception e) {
            e.printStackTrace();
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Error loading product: " + e.getMessage());
        } finally {
            hibernateSession.close();
        }

        return AppUtil.GSON.toJson(responseObject);
    }

    private static java.util.List<JsonObject> products(List<Product> products) {
        java.util.List<JsonObject> productList = new java.util.ArrayList<>();
        for (Product product : products) {
            JsonObject obj = new JsonObject();
            obj.addProperty("id", product.getId());
            obj.addProperty("title", product.getTitle());
            obj.addProperty("price", product.getPrice());
            obj.addProperty("salePrice", product.getSalePrice() != null ? product.getSalePrice() : 0);
            obj.addProperty("stockQuantity", product.getStockQuantity());
            obj.addProperty("category", product.getCategory() != null ? product.getCategory().getName() : "");
            obj.addProperty("image", product.getImages() != null && !product.getImages().isEmpty() 
                ? product.getImages().get(0) : "");
            productList.add(obj);
        }
        return productList;
    }

    private static java.util.List<JsonObject> adminOrders(List<Order> orders) {
        java.util.List<JsonObject> orderList = new java.util.ArrayList<>();
        for (Order order : orders) {
            JsonObject obj = new JsonObject();
            obj.addProperty("id", order.getId());
            obj.addProperty("status", order.getStatus() != null ? order.getStatus().getValue() : "");
            obj.addProperty("deliveryType", order.getDeliveryType() != null ? order.getDeliveryType().getName() : "");
            obj.addProperty("createdAt", order.getCreatedAt() != null ? order.getCreatedAt().toString() : "");
            
            if (order.getUser() != null) {
                obj.addProperty("customerName", (order.getUser().getFirstName() != null ? order.getUser().getFirstName() : "") + 
                    " " + (order.getUser().getLastName() != null ? order.getUser().getLastName() : ""));
                obj.addProperty("customerEmail", order.getUser().getEmail());
            }
            
            // Calculate total
            if (order.getOrderItems() != null) {
                double total = 0;
                for (OrderItem item : order.getOrderItems()) {
                    total += item.getStock().getPrice() * item.getQty();
                }
                obj.addProperty("total", total);
            }
            
            orderList.add(obj);
        }
        return orderList;
    }

    private static java.util.List<JsonObject> customers(List<User> customers) {
        java.util.List<JsonObject> customerList = new java.util.ArrayList<>();
        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
        
        for (User customer : customers) {
            JsonObject obj = new JsonObject();
            obj.addProperty("id", customer.getId());
            obj.addProperty("firstName", customer.getFirstName() != null ? customer.getFirstName() : "");
            obj.addProperty("lastName", customer.getLastName() != null ? customer.getLastName() : "");
            obj.addProperty("email", customer.getEmail());
            
            // Count orders
            Long orderCount = hibernateSession.createQuery(
                "SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId", Long.class
            ).setParameter("userId", customer.getId()).uniqueResult();
            obj.addProperty("orderCount", orderCount != null ? orderCount : 0);
            
            // Calculate total spent
            Double totalSpent = hibernateSession.createQuery(
                "SELECT SUM(oi.qty * s.price) FROM OrderItem oi JOIN oi.order o JOIN oi.stock s WHERE o.user.id = :userId", Double.class
            ).setParameter("userId", customer.getId()).uniqueResult();
            obj.addProperty("totalSpent", totalSpent != null ? totalSpent : 0.0);
            
            obj.addProperty("createdAt", customer.getCreatedAt() != null ? customer.getCreatedAt().toString() : "");
            customerList.add(obj);
        }
        
        hibernateSession.close();
        return customerList;
    }
}
