package com.eagle.sausageshop.controller.api;


import com.eagle.sausageshop.service.indexService;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/index")
public class indexController {


    @Path("/categories")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response categories() {
        String responseJson = new indexService().loadCategoriesDetails();
        return Response.ok().entity(responseJson).build();
    }

}
