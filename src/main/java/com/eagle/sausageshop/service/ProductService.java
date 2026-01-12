package com.eagle.sausageshop.service;

import com.eagle.sausageshop.dto.ProductDTO;
import com.eagle.sausageshop.entity.*;
import com.eagle.sausageshop.util.AppUtil;
import com.eagle.sausageshop.util.HibernateUtil;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.glassfish.jersey.media.multipart.ContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataBodyPart;
import org.hibernate.Session;
import org.hibernate.Transaction;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

public class ProductService {


    public String addNewCategory(String categoryName, String categoryDescription, FormDataBodyPart image,
                                 HttpServletRequest request, ServletContext context) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        if (categoryName == null || categoryName.isBlank()) {
            message = "Category name is required!";
        } else if (image == null) {
            message = "Category image is required!";
        } else {
            HttpSession httpSession = request.getSession(false);
            if (httpSession == null) {
                message = "Session expired! Please login";
            } else if (httpSession.getAttribute("user") == null) {
                message = "Please login first";
            } else {
                Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
                Transaction transaction = null;

                try {
                    transaction = hibernateSession.beginTransaction();

                    // Create category
                    Category category = new Category();
                    category.setName(categoryName.trim());
                    
                    if (categoryDescription != null && !categoryDescription.isBlank()) {
                        category.setDescription(categoryDescription.trim());
                    } else {
                        category.setDescription(null);
                    }

                    List<CategoryImage> imagesList = new ArrayList<>();
                    category.setImages(imagesList);

                    hibernateSession.persist(category);
                    hibernateSession.flush();
                    int categoryId = category.getId();

                    FileUploadService uploadService = new FileUploadService(context);
                    InputStream inputStream = image.getEntityAs(InputStream.class);
                    ContentDisposition cd = image.getContentDisposition();
                    
                    FileUploadService.FileItem fileItem =
                            uploadService.uploadFile("category/" + categoryId, inputStream, cd);

                    CategoryImage categoryImage = new CategoryImage(category, fileItem.getFullUrl());
                    hibernateSession.persist(categoryImage);

                    imagesList.add(categoryImage);
                    
                    transaction.commit();

                    status = true;
                    message = "Category added successfully!";
                    responseObject.addProperty("categoryId", categoryId);

                } catch (Exception e) {
                    if (transaction != null && transaction.isActive()) {
                        transaction.rollback();
                    }
                    e.printStackTrace();
                    message = "Error occurred while saving category! " + e.getMessage();
                } finally {
                    hibernateSession.close();
                }
            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }



    public String loadCategories() {
        JsonObject responseObject = new JsonObject();
        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();

        List<Category> categoriesList = hibernateSession.createQuery("FROM Category c ", Category.class).getResultList();
        responseObject.add("categories", AppUtil.GSON.toJsonTree(ProductService.categories(categoriesList)));

        hibernateSession.close();
        return AppUtil.GSON.toJson(responseObject);
    }

    static List<JsonObject> categories(List<Category> categoriesList) {
        List<JsonObject> categoriesJson = new ArrayList<>();
        for (Category c : categoriesList) {
            JsonObject obj = new JsonObject();
            obj.addProperty("id", c.getId());
            obj.addProperty("name", c.getName());
            categoriesJson.add(obj);
        }
        return categoriesJson;
    }

    public String addNewProductWithImages(ProductDTO productDTO, List<FormDataBodyPart> images, 
                                         HttpServletRequest request, ServletContext context) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        // Validate product data
        if (productDTO.getTitle() == null) {
            message = "Product title is required!";
        } else if (productDTO.getTitle().isBlank()) {
            message = "Product title can not be empty!";
        } else if (productDTO.getCategoryId() <= 0) {
            message = "Invalid category! Please select a correct category!";
        } else if (productDTO.getPrice() <= 0) {
            message = "Product price must be greater than 0!";
        } else if (productDTO.getStockQty() < 0) {
            message = "Product stock quantity cannot be negative!";
        } else if (images == null || images.isEmpty()) {
            message = "At least one product image is required!";
        } else {
            HttpSession httpSession = request.getSession(false);
            if (httpSession == null) {
                message = "Session expired! Please login";
            } else if (httpSession.getAttribute("user") == null) {
                message = "Please login first";
            } else {

                User sessionUser = (User) httpSession.getAttribute("user");
                Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
                Seller seller = hibernateSession.createQuery(
                                "FROM Seller s WHERE s.user = :user",
                                Seller.class
                        ).setParameter("user", sessionUser)
                        .getSingleResultOrNull();

                if (seller == null) {
                    message = "The requested profile is not a seller account!";
                    hibernateSession.close();
                } else {

                    if (!seller.getStatus().getValue()
                            .equals(String.valueOf(Status.Type.APPROVED))) {
                        message = "Seller account not approved yet!";
                        hibernateSession.close();
                    } else {
                        Category category = hibernateSession.find(
                                Category.class,
                                productDTO.getCategoryId()
                        );

                        if (category == null) {
                            message = "Category not found! Please contact admin.";
                            hibernateSession.close();
                        } else {

                            Transaction transaction = hibernateSession.beginTransaction();
                            Product product = null;
                            int productId = 0;

                            try {
                                // Create product first to get the ID
                                product = new Product();
                                product.setTitle(productDTO.getTitle());
                                product.setShortDescription(productDTO.getShortDescription());
                                product.setLongDescription(productDTO.getLongDescription());
                                product.setPrice(productDTO.getPrice());
                                product.setSalePrice(productDTO.getSalePrice());
                                product.setStockQuantity(productDTO.getStockQty());
                                product.setSku(productDTO.getSku());

                                product.setIngredients(productDTO.getIngredients());
                                product.setCalories(productDTO.getCalories());
                                product.setProtein(productDTO.getProtein());
                                product.setFat(productDTO.getFat());
                                product.setCarbs(productDTO.getCarbs());

                                // Initialize empty images list
                                product.setImages(new ArrayList<>());
                                product.setSeller(seller);
                                product.setCategory(category);

                                hibernateSession.persist(product);
                                
                                // Flush to get the product ID
                                hibernateSession.flush();
                                productId = product.getId();
                                
                                transaction.commit();
                                
                                // Now upload images using the product ID
                                FileUploadService uploadService = new FileUploadService(context);
                                List<String> imageUrls = new ArrayList<>();
                                
                                for (FormDataBodyPart bodyPart : images) {
                                    InputStream inputStream = bodyPart.getEntityAs(InputStream.class);
                                    ContentDisposition cd = bodyPart.getContentDisposition();
                                    
                                    FileUploadService.FileItem fileItem =
                                            uploadService.uploadFile("product/" + productId, inputStream, cd);
                                    
                                    imageUrls.add(fileItem.getFullUrl());
                                }
                                
                                // Update product with image URLs
                                transaction = hibernateSession.beginTransaction();
                                product.setImages(imageUrls);
                                hibernateSession.merge(product);
                                transaction.commit();
                                
                                status = true;
                                message = "Product added successfully with images!";
                                responseObject.addProperty("productId", productId);

                            } catch (Exception e) {
                                if (transaction != null && transaction.isActive()) {
                                    transaction.rollback();
                                }
                                e.printStackTrace();
                                message = "Error occurred while saving product! " + e.getMessage();
                            } finally {
                                hibernateSession.close();
                            }
                        }
                    }
                }
            }

        }
        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    public String updateProductWithImages(int productId, ProductDTO productDTO, List<FormDataBodyPart> images, 
                                         HttpServletRequest request, ServletContext context) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        // Validate product data
        if (productDTO.getTitle() == null) {
            message = "Product title is required!";
        } else if (productDTO.getTitle().isBlank()) {
            message = "Product title can not be empty!";
        } else if (productDTO.getCategoryId() <= 0) {
            message = "Invalid category! Please select a correct category!";
        } else if (productDTO.getPrice() <= 0) {
            message = "Product price must be greater than 0!";
        } else if (productDTO.getStockQty() < 0) {
            message = "Product stock quantity cannot be negative!";
        } else {
            HttpSession httpSession = request.getSession(false);
            if (httpSession == null) {
                message = "Session expired! Please login";
            } else if (httpSession.getAttribute("user") == null) {
                message = "Please login first";
            } else {

                User sessionUser = (User) httpSession.getAttribute("user");
                Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
                Seller seller = hibernateSession.createQuery(
                                "FROM Seller s WHERE s.user = :user",
                                Seller.class
                        ).setParameter("user", sessionUser)
                        .getSingleResultOrNull();

                if (seller == null) {
                    message = "The requested profile is not a seller account!";
                    hibernateSession.close();
                } else {

                    if (!seller.getStatus().getValue()
                            .equals(String.valueOf(Status.Type.APPROVED))) {
                        message = "Seller account not approved yet!";
                        hibernateSession.close();
                    } else {
                        Transaction transaction = null;

                        try {
                            transaction = hibernateSession.beginTransaction();

                            // Get existing product
                            Product product = hibernateSession.get(Product.class, productId);
                            if (product == null) {
                                message = "Product not found!";
                                hibernateSession.close();
                                responseObject.addProperty("status", false);
                                responseObject.addProperty("message", message);
                                return AppUtil.GSON.toJson(responseObject);
                            }

                            // Verify product belongs to the seller
                            if (product.getSeller().getId() != seller.getId()) {
                                message = "You don't have permission to update this product!";
                                hibernateSession.close();
                                responseObject.addProperty("status", false);
                                responseObject.addProperty("message", message);
                                return AppUtil.GSON.toJson(responseObject);
                            }

                            // Get category
                        Category category = hibernateSession.find(
                                Category.class,
                                productDTO.getCategoryId()
                        );

                        if (category == null) {
                            message = "Category not found! Please contact admin.";
                                transaction.rollback();
                                hibernateSession.close();
                                responseObject.addProperty("status", false);
                                responseObject.addProperty("message", message);
                                return AppUtil.GSON.toJson(responseObject);
                            }

                            // Update product fields
                                product.setTitle(productDTO.getTitle());
                                product.setShortDescription(productDTO.getShortDescription());
                                product.setLongDescription(productDTO.getLongDescription());
                                product.setPrice(productDTO.getPrice());
                                product.setSalePrice(productDTO.getSalePrice());
                                product.setStockQuantity(productDTO.getStockQty());
                                product.setSku(productDTO.getSku());
                                product.setIngredients(productDTO.getIngredients());
                                product.setCalories(productDTO.getCalories());
                                product.setProtein(productDTO.getProtein());
                                product.setFat(productDTO.getFat());
                                product.setCarbs(productDTO.getCarbs());
                            product.setCategory(category);

                            // Update images if new images are provided
                            if (images != null && !images.isEmpty()) {
                                FileUploadService uploadService = new FileUploadService(context);
                                List<String> imageUrls = new ArrayList<>();
                                
                                for (FormDataBodyPart bodyPart : images) {
                                    InputStream inputStream = bodyPart.getEntityAs(InputStream.class);
                                    ContentDisposition cd = bodyPart.getContentDisposition();
                                    
                                    FileUploadService.FileItem fileItem =
                                            uploadService.uploadFile("product/" + productId, inputStream, cd);
                                    
                                    imageUrls.add(fileItem.getFullUrl());
                                }
                                
                                product.setImages(imageUrls);
                            }

                            hibernateSession.merge(product);
                            transaction.commit();

                                status = true;
                            message = "Product updated successfully!";

                            } catch (Exception e) {
                            if (transaction != null && transaction.isActive()) {
                                transaction.rollback();
                            }
                                e.printStackTrace();
                            message = "Error occurred while updating product! " + e.getMessage();
                        } finally {
                            hibernateSession.close();
                            }
                        }
                }
            }

        }
        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

}


