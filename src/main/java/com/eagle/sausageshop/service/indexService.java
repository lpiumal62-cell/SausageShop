package com.eagle.sausageshop.service;

import com.eagle.sausageshop.entity.Category;
import com.eagle.sausageshop.entity.CategoryImage;
import com.eagle.sausageshop.util.AppUtil;
import com.eagle.sausageshop.util.HibernateUtil;
import com.google.gson.JsonObject;
import org.hibernate.Session;

import java.util.ArrayList;
import java.util.List;

public class indexService {



    public String loadCategoriesDetails() {
        JsonObject responseObject = new JsonObject();
        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
        try {
            List<Category> categoryList = hibernateSession.createQuery(
                    "SELECT DISTINCT c FROM Category c LEFT JOIN FETCH c.images ORDER BY c.id", 
                    Category.class
            ).getResultList();
            responseObject.add("category", AppUtil.GSON.toJsonTree(indexService.category(categoryList)));
        } finally {
            hibernateSession.close();
        }
        return AppUtil.GSON.toJson(responseObject);
    }

    private static List<JsonObject> category(List<Category> categoryList) {
        List<JsonObject> categoryJson = new ArrayList<>();
        for (Category c : categoryList) {
            JsonObject obj = new JsonObject();
            obj.addProperty("id", c.getId());
            obj.addProperty("name", c.getName());

            if (c.getDescription() != null) {
                obj.addProperty("description", c.getDescription());
            } else {
                obj.addProperty("description", "");
            }
            String imageUrl = "";
            if (c.getImages() != null && !c.getImages().isEmpty()) {
                CategoryImage firstImage = c.getImages().get(0);
                if (firstImage != null && firstImage.getImage() != null) {
                    imageUrl = firstImage.getImage();
                }
            }
            obj.addProperty("image", imageUrl);
            categoryJson.add(obj);
        }
        return categoryJson;
    }
}
