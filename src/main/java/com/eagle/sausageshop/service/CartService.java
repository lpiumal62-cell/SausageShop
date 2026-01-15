package com.eagle.sausageshop.service;

import com.eagle.sausageshop.entity.Cart;
import com.eagle.sausageshop.entity.Product;
import com.eagle.sausageshop.entity.Stock;
import com.eagle.sausageshop.entity.User;
import com.eagle.sausageshop.util.AppUtil;
import com.eagle.sausageshop.util.HibernateUtil;
import com.eagle.sausageshop.validation.Validator;
import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.hibernate.Session;
import org.hibernate.Transaction;

import java.util.ArrayList;
import java.util.List;

public class CartService {

    public String addToCart(String pid, String qty, HttpServletRequest request) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        if (pid == null || pid.isBlank()) {
            message = "Product ID not found!";
        } else if (!pid.matches(Validator.IS_INTEGER)) {
            message = "Invalid product Id!";
        } else if (qty == null || qty.isBlank()) {
            message = "Product quantity not found!";
        } else if (!qty.matches(Validator.IS_INTEGER)) {
            message = "Invalid quantity value!";
        } else {
            int productId = Integer.parseInt(pid);
            int requestQty = Integer.parseInt(qty);
            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
            try {
            Product product = hibernateSession.find(Product.class, productId);
            if (product == null) {
                message = "Product not found!";
                } else if (requestQty <= 0) {
                    message = "Quantity must be at least 1!";
                } else {
                    // Resolve stock for the product
                    Stock stock = product.getStock();
                    if (stock == null) {
                        List<Stock> stockList = hibernateSession.createQuery(
                                        "FROM Stock s WHERE s.product.id = :pid", Stock.class)
                                .setParameter("pid", productId)
                                .setMaxResults(1)
                                .getResultList();
                        stock = stockList.isEmpty() ? null : stockList.get(0);
                    }

                    if (stock == null) {
                        message = "Stock information not found for this product!";
            } else {
                HttpSession httpSession = request.getSession();
                User user = (User) httpSession.getAttribute("user");
                List<Cart> sessionCart = getSessionAttribute(httpSession);
                if (user == null) {
                    if (sessionCart == null) {
                                return guestUserFirstTime(stock, requestQty, httpSession);
                            } else {
                                return guestUserSecondTime(stock, requestQty, httpSession);
                            }
                    } else {
                            return loggedUserCart(user, stock, requestQty, hibernateSession);
                        }
                    }
                }
            } finally {
                hibernateSession.close();
            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    public String getCartItems(HttpServletRequest request) {
        JsonObject responseObject = new JsonObject();
        HttpSession httpSession = request.getSession();
        User user = (User) httpSession.getAttribute("user");

        List<Cart> cartItems;
        Session hibernateSession = null;
        try {
            if (user == null) {
                // Guest cart from session
                cartItems = getSessionAttribute(httpSession);
                if (cartItems == null) {
                    cartItems = new ArrayList<>();
                }
            } else {
                // Logged-in user cart from DB
                hibernateSession = HibernateUtil.getSessionFactory().openSession();
                cartItems = hibernateSession.createQuery(
                                "SELECT c FROM Cart c " +
                                        "JOIN FETCH c.stock s " +
                                        "JOIN FETCH s.product p " +
                                        "WHERE c.user.id = :uid", Cart.class)
                        .setParameter("uid", user.getId())
                        .getResultList();
            }

            double subtotal = 0.0;
            int itemCount = 0;
            List<JsonObject> itemsJson = new ArrayList<>();

            if (cartItems != null) {
                for (Cart cart : cartItems) {
                    Stock stock = cart.getStock();
                    if (stock == null) continue;
                    Product product = stock.getProduct();
                    if (product == null) continue;

                    int qty = cart.getQty() != null ? cart.getQty() : 0;
                    double unitPrice = stock.getPrice() != null ? stock.getPrice() : 0.0;
                    double lineTotal = unitPrice * qty;

                    subtotal += lineTotal;
                    itemCount += qty;

                    JsonObject obj = new JsonObject();
                    obj.addProperty("productId", product.getId());
                    obj.addProperty("title", product.getTitle());
                    obj.addProperty("shortDescription", product.getShortDescription() != null ? product.getShortDescription() : "");
                    obj.addProperty("quantity", qty);
                    obj.addProperty("unitPrice", unitPrice);
                    obj.addProperty("lineTotal", lineTotal);

                    // Basic image support similar to ShopService
                    String imageUrl = "";
                    if (product.getImages() != null && !product.getImages().isEmpty()) {
                        imageUrl = product.getImages().get(0);
                    }
                    obj.addProperty("image", imageUrl);

                    itemsJson.add(obj);
                }
            }

            JsonObject summary = new JsonObject();
            summary.addProperty("itemCount", itemCount);
            summary.addProperty("subtotal", subtotal);
            summary.addProperty("total", subtotal); // extend later with shipping/discounts

            responseObject.addProperty("status", true);
            responseObject.add("items", AppUtil.GSON.toJsonTree(itemsJson));
            responseObject.add("summary", summary);
        } catch (Exception e) {
            e.printStackTrace();
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Error loading cart items!");
        } finally {
            if (hibernateSession != null) {
                hibernateSession.close();
            }
        }

        return AppUtil.GSON.toJson(responseObject);
    }

    public String updateQuantity(String pid, String qty, HttpServletRequest request) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        if (pid == null || pid.isBlank()) {
            message = "Product ID not found!";
        } else if (!pid.matches(Validator.IS_INTEGER)) {
            message = "Invalid product Id!";
        } else if (qty == null || qty.isBlank()) {
            message = "Product quantity not found!";
        } else if (!qty.matches(Validator.IS_INTEGER)) {
            message = "Invalid quantity value!";
        } else {
            int productId = Integer.parseInt(pid);
            int requestQty = Integer.parseInt(qty);

            HttpSession httpSession = request.getSession();
            User user = (User) httpSession.getAttribute("user");

            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
            try {
                Product product = hibernateSession.find(Product.class, productId);
                if (product == null) {
                    message = "Product not found!";
                } else {
                    Stock stock = product.getStock();
                    if (stock == null) {
                        List<Stock> stockList = hibernateSession.createQuery(
                                        "FROM Stock s WHERE s.product.id = :pid", Stock.class)
                                .setParameter("pid", productId)
                                .setMaxResults(1)
                                .getResultList();
                        stock = stockList.isEmpty() ? null : stockList.get(0);
                    }

                    if (stock == null) {
                        message = "Stock information not found for this product!";
                    } else if (requestQty < 0) {
                        message = "Quantity cannot be negative!";
                    } else if (requestQty > stock.getQty()) {
                        message = "Product quantity exceeded!";
                    } else {
                        if (user == null) {
                            // Guest cart in session
                            List<Cart> cartList = getSessionAttribute(httpSession);
                            if (cartList != null) {
                                Cart target = null;
                                for (Cart c : cartList) {
                                    if (c.getStock() != null && c.getStock().getId() != null &&
                                            c.getStock().getId().equals(stock.getId())) {
                                        target = c;
                                        break;
                                    }
                                }
                                if (target != null) {
                                    if (requestQty == 0) {
                                        cartList.remove(target);
                                    } else {
                                        target.setQty(requestQty);
                                    }
                                    httpSession.setAttribute("sessionCart", cartList);
                                    status = true;
                                    message = "Cart updated";
                                } else {
                                    message = "Item not found in cart!";
                                }
                            } else {
                                message = "Cart is empty!";
                            }
                        } else {
                            // Logged-in, update DB cart
                            Transaction tx = null;
                            try {
                                tx = hibernateSession.beginTransaction();
                                Cart existingCart = hibernateSession.createQuery(
                                                "FROM Cart c WHERE c.user.id = :uid AND c.stock.id = :sid", Cart.class)
                                        .setParameter("uid", user.getId())
                                        .setParameter("sid", stock.getId())
                                        .uniqueResult();

                                if (existingCart != null) {
                                    if (requestQty == 0) {
                                        hibernateSession.remove(existingCart);
                                    } else {
                                        existingCart.setQty(requestQty);
                                        hibernateSession.merge(existingCart);
                                    }
                                    tx.commit();
                                    status = true;
                                    message = "Cart updated";
                                } else {
                                    message = "Item not found in cart!";
                                }
                            } catch (Exception e) {
                                if (tx != null) tx.rollback();
                                e.printStackTrace();
                                message = "Error while updating cart!";
                            }
                        }
                    }
                }
            } finally {
                hibernateSession.close();
            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    public String removeItem(String pid, HttpServletRequest request) {
        // Convenience: treat as updateQuantity to 0
        return updateQuantity(pid, "0", request);
    }

    public String clearCart(HttpServletRequest request) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message;

        HttpSession httpSession = request.getSession();
        User user = (User) httpSession.getAttribute("user");

        if (user == null) {
            // Guest: clear session cart
            httpSession.removeAttribute("sessionCart");
            status = true;
            message = "Cart cleared";
        } else {
            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
            Transaction tx = null;
            try {
                tx = hibernateSession.beginTransaction();
                hibernateSession.createQuery("DELETE FROM Cart c WHERE c.user.id = :uid")
                        .setParameter("uid", user.getId())
                        .executeUpdate();
                tx.commit();
                status = true;
                message = "Cart cleared";
            } catch (Exception e) {
                if (tx != null) tx.rollback();
                e.printStackTrace();
                message = "Error while clearing cart!";
            } finally {
                hibernateSession.close();
            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    private String guestUserFirstTime(Stock stock, int requestQty, HttpSession httpSession) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message;

        if (requestQty > stock.getQty()) {
            message = "Product quantity exceeded!";
        } else {
            List<Cart> cartList = new ArrayList<>();
            Cart cart = new Cart();
            cart.setStock(stock);
            cart.setQty(requestQty);
            cart.setUser(null);
            cartList.add(cart);
            httpSession.setAttribute("sessionCart", cartList);
            status = true;
            message = "Product added to cart";
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    private String guestUserSecondTime(Stock stock, int requestQty, HttpSession httpSession) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message;

        List<Cart> cartList = getSessionAttribute(httpSession);
        if (cartList == null) {
            return guestUserFirstTime(stock, requestQty, httpSession);
        }

        Cart existingItem = null;
        for (Cart c : cartList) {
            if (c.getStock() != null && c.getStock().getId() != null &&
                    c.getStock().getId().equals(stock.getId())) {
                existingItem = c;
                break;
            }
        }

        if (existingItem == null) {
            if (requestQty > stock.getQty()) {
                message = "Product quantity exceeded!";
            } else {
                Cart cart = new Cart();
                cart.setStock(stock);
                cart.setQty(requestQty);
                cart.setUser(null);
                cartList.add(cart);
                httpSession.setAttribute("sessionCart", cartList);
                status = true;
                message = "Product added to cart";
            }
        } else {
            int newQty = existingItem.getQty() + requestQty;
            if (newQty > stock.getQty()) {
                message = "Product quantity exceeded!";
            } else {
                existingItem.setQty(newQty);
                httpSession.setAttribute("sessionCart", cartList);
                status = true;
                message = "Cart updated";
            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    private String loggedUserCart(User user, Stock stock, int requestQty, Session hibernateSession) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message;

        if (requestQty > stock.getQty()) {
            message = "Product quantity exceeded!";
        } else {
            Transaction transaction = null;
            try {
                transaction = hibernateSession.beginTransaction();

                Cart existingCart = hibernateSession.createQuery(
                                "FROM Cart c WHERE c.user.id = :uid AND c.stock.id = :sid", Cart.class)
                        .setParameter("uid", user.getId())
                        .setParameter("sid", stock.getId())
                        .uniqueResult();

                if (existingCart == null) {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    cart.setStock(stock);
                    cart.setQty(requestQty);
                    hibernateSession.persist(cart);
                    message = "Product added to cart";
                } else {
                    int newQty = existingCart.getQty() + requestQty;
                    if (newQty > stock.getQty()) {
                        message = "Product quantity exceeded!";
                    } else {
                        existingCart.setQty(newQty);
                        hibernateSession.merge(existingCart);
                        message = "Cart updated";
                    }
                }

                transaction.commit();
                status = true;
            } catch (Exception e) {
                if (transaction != null) {
                    transaction.rollback();
                }
                e.printStackTrace();
                message = "Error while updating cart!";
            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    @SuppressWarnings("unchecked")
    private <U> U getSessionAttribute(HttpSession httpSession) {
        return (U) httpSession.getAttribute("sessionCart");
    }
}

