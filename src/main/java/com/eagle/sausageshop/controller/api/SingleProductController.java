package com.eagle.sausageshop.controller.api;


import com.eagle.sausageshop.service.SingleProductService;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/single-products")
public class SingleProductController {

    @Path("/product")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response loadSingleProduct(@QueryParam("productId") String productId) {
        String responseJson = SingleProductService.getSingleProduct(productId);
        return Response.ok().entity(responseJson).build();
    }

    @Path("/related-products")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getRelatedProducts(@QueryParam("productId") String productId, @QueryParam("categoryId") String categoryId) {
        String responseJson = SingleProductService.getRelatedProducts(productId, categoryId);
        return Response.ok().entity(responseJson).build();
    }

}
