package com.eagle.sausageshop.service;


import com.eagle.sausageshop.entity.Category;
import com.eagle.sausageshop.entity.Product;
import com.eagle.sausageshop.util.AppUtil;
import com.eagle.sausageshop.util.HibernateUtil;
import com.google.gson.JsonObject;
import org.hibernate.Session;

import java.util.ArrayList;
import java.util.List;

public class ShopService {


    public String loadCategories() {
        JsonObject responseObject = new JsonObject();
        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();

        List<Category> categoriesList = hibernateSession.createQuery("FROM Category c ", Category.class).getResultList();
        responseObject.add("categories", AppUtil.GSON.toJsonTree(ProductService.categories(categoriesList)));
        hibernateSession.close();
        return AppUtil.GSON.toJson(responseObject);
    }

    public String loadProducts() {
        JsonObject responseObject = new JsonObject();
        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
        try {
            List<Product> productsList = hibernateSession.createQuery(
                "SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category ORDER BY p.id DESC",
                Product.class
            ).getResultList();
            responseObject.add("products", AppUtil.GSON.toJsonTree(products(productsList)));
        } catch (Exception e) {
            e.printStackTrace();
            responseObject.addProperty("error", e.getMessage());
            responseObject.add("products", AppUtil.GSON.toJsonTree(new ArrayList<>()));
        } finally {
            hibernateSession.close();
        }
        return AppUtil.GSON.toJson(responseObject);
    }

    private static List<JsonObject> products(List<Product> productsList) {
        List<JsonObject> productsJson = new ArrayList<>();
        for (Product p : productsList) {
            JsonObject obj = new JsonObject();
            obj.addProperty("id", p.getId());
            obj.addProperty("title", p.getTitle());
            obj.addProperty("shortDescription", p.getShortDescription() != null ? p.getShortDescription() : "");
            obj.addProperty("price", p.getPrice());
            obj.addProperty("salePrice", p.getSalePrice() != null ? p.getSalePrice() : 0);
            obj.addProperty("stockQty", p.getStockQuantity());
            obj.addProperty("sku", p.getSku() != null ? p.getSku() : "");

            String imageUrl = "";
            if (p.getImages() != null && !p.getImages().isEmpty()) {
                imageUrl = p.getImages().get(0);
            }
            obj.addProperty("image", imageUrl);

            if (p.getCategory() != null) {
                obj.addProperty("categoryId", p.getCategory().getId());
                obj.addProperty("categoryName", p.getCategory().getName());
            }
            
            productsJson.add(obj);
        }
        return productsJson;
    }

}

