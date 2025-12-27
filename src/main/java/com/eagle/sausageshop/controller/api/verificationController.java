package com.eagle.sausageshop.controller.api;


import com.eagle.sausageshop.dto.UserDTO;
import com.eagle.sausageshop.service.UserService;
import com.google.gson.Gson;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;


@Path("/verify-accounts")
public class verificationController {
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response verifyAccount(String jsonData) {
        Gson gson = new Gson();
        UserDTO userDTO = gson.fromJson(jsonData, UserDTO.class);
        String responseJson = new UserService().verifyAccount(userDTO);
        return Response.ok().entity(responseJson).build();
    }
}
