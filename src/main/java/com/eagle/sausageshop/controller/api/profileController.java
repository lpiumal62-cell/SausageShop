package com.eagle.sausageshop.controller.api;


import com.eagle.sausageshop.annotation.IsUser;
import com.eagle.sausageshop.service.ProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;

@Path("/user-Profiles")
public class profileController {

    @IsUser
    @GET
    @Path("/profileLoading")
    public Response loadUserProfile(@Context HttpServletRequest request) {
        String responseJson = new ProfileService().loadingService(request);
        return Response.ok().entity(responseJson).build();
    }
}
