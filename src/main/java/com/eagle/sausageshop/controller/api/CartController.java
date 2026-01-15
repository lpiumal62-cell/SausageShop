package com.eagle.sausageshop.controller.api;

import com.eagle.sausageshop.service.CartService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/carts")
public class CartController {
    private final CartService cartService = new CartService();

    @Path("/add-to-cart")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response addToCart(@QueryParam("pid") String pid,
                              @QueryParam("qty") String qty,
                              @Context HttpServletRequest request) {
        String responseJson = cartService.addToCart(pid, qty, request);
        return Response.ok().entity(responseJson).build();
    }

    @Path("/items")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getCartItems(@Context HttpServletRequest request) {
        String responseJson = cartService.getCartItems(request);
        return Response.ok().entity(responseJson).build();
    }

    @Path("/update-qty")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateQuantity(@QueryParam("pid") String pid,
                                   @QueryParam("qty") String qty,
                                   @Context HttpServletRequest request) {
        String responseJson = cartService.updateQuantity(pid, qty, request);
        return Response.ok().entity(responseJson).build();
    }

    @Path("/remove-item")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response removeItem(@QueryParam("pid") String pid,
                               @Context HttpServletRequest request) {
        String responseJson = cartService.removeItem(pid, request);
        return Response.ok().entity(responseJson).build();
    }

    @Path("/clear")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response clearCart(@Context HttpServletRequest request) {
        String responseJson = cartService.clearCart(request);
        return Response.ok().entity(responseJson).build();
    }
}
