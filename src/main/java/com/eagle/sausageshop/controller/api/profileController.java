package com.eagle.sausageshop.controller.api;


import com.eagle.sausageshop.annotation.IsUser;
import com.eagle.sausageshop.service.CityService;
import com.eagle.sausageshop.service.ProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/user-Profiles")
public class profileController {

    @Path("/cities")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response loadCities() {
        String loadAllCities = new CityService().loadAllCities();
        return Response.ok().entity(loadAllCities).build();
    }
    @IsUser
    @GET
    @Path("/profileLoading")
    public Response loadUserProfile(@Context HttpServletRequest request) {
        String responseJson = new ProfileService().loadingService(request);
        return Response.ok().entity(responseJson).build();
    }
}
