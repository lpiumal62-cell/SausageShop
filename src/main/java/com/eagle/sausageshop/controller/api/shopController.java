package com.eagle.sausageshop.controller.api;

import com.eagle.sausageshop.service.ShopService;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/shops")
public class shopController {

    @Path("/categories")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response loadCategory() {
        String responseJson = new ShopService().loadCategories();
        return Response.ok().entity(responseJson).build();
    }

    @Path("/products")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response loadProducts() {
        String responseJson = new ShopService().loadProducts();
        return Response.ok().entity(responseJson).build();
    }

}
