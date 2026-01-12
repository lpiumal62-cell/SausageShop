package com.eagle.sausageshop.controller.api;

import com.eagle.sausageshop.dto.ProductDTO;
import com.eagle.sausageshop.service.ProductService;
import com.eagle.sausageshop.util.AppUtil;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.glassfish.jersey.media.multipart.FormDataBodyPart;
import org.glassfish.jersey.media.multipart.FormDataParam;


import java.util.List;

@Path("/products")
public class productController {

    @Path("/save-category")
    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Response saveCategory(
            @FormDataParam("categoryName") String categoryName,
            @FormDataParam("categoryDescription") String categoryDescription,
            @FormDataParam("categoryImage") FormDataBodyPart image,
            @Context HttpServletRequest request,
            @Context ServletContext context) {

        JsonObject response = new JsonObject();

        if (categoryName == null || categoryName.isBlank()) {
            response.addProperty("status", false);
            response.addProperty("message", "Category name is required!");
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(response.toString())
                    .build();
        }

        if (image == null) {
            response.addProperty("status", false);
            response.addProperty("message", "Category image is required!");
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(response.toString())
                    .build();
        }

        // Call service to add category
        ProductService productService = new ProductService();
        String responseJson = productService.addNewCategory(categoryName, categoryDescription, image, request, context);
        return Response.ok().entity(responseJson).build();
    }



    @Path("/save-product")
    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Response saveProduct(
            @FormDataParam("product") String productJson,
            @FormDataParam("images") List<FormDataBodyPart> images,
            @Context HttpServletRequest request,
            @Context ServletContext context) {
        
        JsonObject response = new JsonObject();

        if (images == null || images.isEmpty()) {
            response.addProperty("status", false);
            response.addProperty("message", "At least one product image is required!");
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(response.toString())
                    .build();
        }
        
        // Parse product JSON
        ProductDTO productDTO;
        try {
            productDTO = AppUtil.GSON.fromJson(productJson, ProductDTO.class);
        } catch (Exception e) {
            response.addProperty("status", false);
            response.addProperty("message", "Invalid product data format!");
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(response.toString())
                    .build();
        }
        
        // Call service to add product with images
        ProductService productService = new ProductService();
        String responseJson = productService.addNewProductWithImages(productDTO, images, request, context);
        return Response.ok().entity(responseJson).build();
    }


    @Path("/categories")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response loadCategory() {
        String responseJson = new ProductService().loadCategories();
        return Response.ok().entity(responseJson).build();
    }

    @Path("/update-product/{productId}")
    @PUT
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateProduct(
            @PathParam("productId") int productId,
            @FormDataParam("product") String productJson,
            @FormDataParam("images") List<FormDataBodyPart> images,
            @Context HttpServletRequest request,
            @Context ServletContext context) {
        
        JsonObject response = new JsonObject();
        
        // Parse product JSON
        ProductDTO productDTO;
        try {
            productDTO = AppUtil.GSON.fromJson(productJson, ProductDTO.class);
        } catch (Exception e) {
            response.addProperty("status", false);
            response.addProperty("message", "Invalid product data format!");
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(response.toString())
                    .build();
        }
        
        // Call service to update product with optional images
        ProductService productService = new ProductService();
        String responseJson = productService.updateProductWithImages(productId, productDTO, images, request, context);
        return Response.ok().entity(responseJson).build();
    }


}
