package com.eagle.sausageshop.controller.api;

import com.eagle.sausageshop.dto.ProductDTO;
import com.eagle.sausageshop.entity.Product;
import com.eagle.sausageshop.service.FileUploadService;
import com.eagle.sausageshop.service.ProductService;
import com.eagle.sausageshop.util.AppUtil;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.glassfish.jersey.media.multipart.ContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataBodyPart;
import org.glassfish.jersey.media.multipart.FormDataParam;

import java.io.InputStream;
import java.util.List;

@Path("/products")
public class productController {

    @PUT
    @Path("/{productId}/upload-images")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Response uploadProductImages(
            @PathParam("productId") int productId,
            @FormDataParam("images") List<FormDataBodyPart> images,
            @Context ServletContext context) {
        JsonObject response = new JsonObject();

        if (images == null || images.isEmpty()) {
            response.addProperty("status", false);
            response.addProperty("message", "At least one product image is required!");
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(response.toString())
                    .build();
        }

        ProductService productService = new ProductService();
        Product product = productService.getProductById(productId);

        if (product == null) {
            response.addProperty("status", false);
            response.addProperty("message", "Product not found!");
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(response.toString())
                    .build();
        }

        FileUploadService uploadService = new FileUploadService(context);

        for (FormDataBodyPart bodyPart : images) {
            InputStream inputStream = bodyPart.getEntityAs(InputStream.class);
            ContentDisposition cd = bodyPart.getContentDisposition();

            FileUploadService.FileItem fileItem =
                    uploadService.uploadFile("product/" + productId, inputStream, cd);

            product.getImages().add(fileItem.getFullUrl());
        }

        String result = productService.imageUpload(product);
        return Response.ok(result).build();
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
        
        // Validate images
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


}
