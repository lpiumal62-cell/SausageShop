package com.eagle.sausageshop.service;

import com.eagle.sausageshop.entity.Product;
import com.eagle.sausageshop.util.AppUtil;
import com.eagle.sausageshop.util.HibernateUtil;
import com.eagle.sausageshop.validation.Validator;
import com.google.gson.JsonObject;
import org.hibernate.Session;

import java.util.ArrayList;
import java.util.List;

public class SingleProductService {
    public static String getSingleProduct(String productId) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        if (productId == null || productId.isBlank()) {
            message = "Product ID not found!";
        } else if (!productId.matches(Validator.IS_INTEGER)) {
            message = "Invalid product ID!";
        } else {
            try {
                int id = Integer.parseInt(productId);
                Session hibernateSession = HibernateUtil.getSessionFactory().openSession();

                Product product = hibernateSession.createQuery(
                    "SELECT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.seller WHERE p.id = :id",
                    Product.class
                ).setParameter("id", id).uniqueResult();

                if (product != null) {
                    JsonObject productObj = new JsonObject();
                    productObj.addProperty("id", product.getId());
                    productObj.addProperty("title", product.getTitle());
                    productObj.addProperty("shortDescription", product.getShortDescription() != null ? product.getShortDescription() : "");
                    productObj.addProperty("longDescription", product.getLongDescription() != null ? product.getLongDescription() : "");
                    productObj.addProperty("price", product.getPrice());
                    productObj.addProperty("salePrice", product.getSalePrice() != null ? product.getSalePrice() : 0);
                    productObj.addProperty("stockQty", product.getStockQuantity());
                    productObj.addProperty("sku", product.getSku() != null ? product.getSku() : "");
                    productObj.addProperty("calories", product.getCalories() != null ? product.getCalories() : 0);
                    productObj.addProperty("protein", product.getProtein() != null ? product.getProtein() : 0);
                    productObj.addProperty("fat", product.getFat() != null ? product.getFat() : 0);
                    productObj.addProperty("carbs", product.getCarbs() != null ? product.getCarbs() : 0);
                    productObj.addProperty("ingredients", product.getIngredients() != null ? product.getIngredients() : "");

                    // Images
                    List<String> images = product.getImages() != null ? product.getImages() : new ArrayList<>();
                    productObj.add("images", AppUtil.GSON.toJsonTree(images));

                    // Category
                    if (product.getCategory() != null) {
                        productObj.addProperty("categoryId", product.getCategory().getId());
                        productObj.addProperty("categoryName", product.getCategory().getName());
                    }

                    responseObject.add("product", productObj);
                    status = true;
                } else {
                    message = "Product not found!";
                }

                hibernateSession.close();
            } catch (Exception e) {
                e.printStackTrace();
                message = "Error loading product: " + e.getMessage();
            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    public static String getRelatedProducts(String productId, String categoryId) {
        JsonObject responseObject = new JsonObject();
        List<JsonObject> relatedProducts = new ArrayList<>();

        if (productId != null && !productId.isBlank() && productId.matches(Validator.IS_INTEGER)) {
            try {
                int currentProductId = Integer.parseInt(productId);
                int catId = categoryId != null && categoryId.matches(Validator.IS_INTEGER) ? Integer.parseInt(categoryId) : 0;

                Session hibernateSession = HibernateUtil.getSessionFactory().openSession();

                String query = "SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category WHERE p.id != :currentId";
                if (catId > 0) {
                    query += " AND p.category.id = :categoryId";
                }
                query += " ORDER BY p.id DESC";

                var queryObj = hibernateSession.createQuery(query, Product.class)
                    .setParameter("currentId", currentProductId)
                    .setMaxResults(4);

                if (catId > 0) {
                    queryObj.setParameter("categoryId", catId);
                }

                List<Product> products = queryObj.getResultList();

                for (Product p : products) {
                    JsonObject obj = new JsonObject();
                    obj.addProperty("id", p.getId());
                    obj.addProperty("title", p.getTitle());
                    obj.addProperty("shortDescription", p.getShortDescription() != null ? p.getShortDescription() : "");
                    obj.addProperty("price", p.getPrice());
                    obj.addProperty("salePrice", p.getSalePrice() != null ? p.getSalePrice() : 0);
                    obj.addProperty("stockQty", p.getStockQuantity());

                    String imageUrl = "";
                    if (p.getImages() != null && !p.getImages().isEmpty()) {
                        imageUrl = p.getImages().get(0);
                    }
                    obj.addProperty("image", imageUrl);

                    if (p.getCategory() != null) {
                        obj.addProperty("categoryId", p.getCategory().getId());
                        obj.addProperty("categoryName", p.getCategory().getName());
                    }

                    relatedProducts.add(obj);
                }

                hibernateSession.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        responseObject.add("products", AppUtil.GSON.toJsonTree(relatedProducts));
        responseObject.addProperty("status", true);
        return AppUtil.GSON.toJson(responseObject);
    }
}
