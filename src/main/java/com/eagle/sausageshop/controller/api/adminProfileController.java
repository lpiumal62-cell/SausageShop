package com.eagle.sausageshop.controller.api;

import com.eagle.sausageshop.annotation.IsUser;
import com.eagle.sausageshop.dto.UserDTO;
import com.eagle.sausageshop.service.AdminService;
import com.eagle.sausageshop.util.AppUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/admin")
public class adminProfileController {

    @IsUser
    @Path("/logout")
    @GET
    public Response logout(@Context HttpServletRequest request) {
        HttpSession httpSession = request.getSession(false);
        if (httpSession != null && httpSession.getAttribute("user") != null) {
            httpSession.invalidate();
            return Response.status(Response.Status.OK).build();
        } else {
            System.out.println("else");
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
    }


    @Path("/admin-login")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response userLogin(String jsonData, @Context HttpServletRequest request) {
        UserDTO userDTO = AppUtil.GSON.fromJson(jsonData, UserDTO.class);
        String responseJson = new AdminService().adminLogin(userDTO, request);
        return Response.ok().entity(responseJson).build();
    }

    @IsUser
    @Path("/products")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllProducts() {
        String responseJson = new AdminService().getAllProducts();
        return Response.ok().entity(responseJson).build();
    }

    @IsUser
    @Path("/products/{productId}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getProductById(@PathParam("productId") int productId) {
        String responseJson = new AdminService().getProductById(productId);
        return Response.ok().entity(responseJson).build();
    }

    @IsUser
    @Path("/dashboard/stats")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getDashboardStats() {
        String responseJson = new AdminService().getDashboardStats();
        return Response.ok().entity(responseJson).build();
    }

    @IsUser
    @Path("/orders")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllOrders() {
        String responseJson = new AdminService().getAllOrders();
        return Response.ok().entity(responseJson).build();
    }
}
