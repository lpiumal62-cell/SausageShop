package com.eagle.sausageshop.controller.api;

import com.eagle.sausageshop.dto.UserDTO;
import com.eagle.sausageshop.service.UserService;
import com.eagle.sausageshop.util.AppUtil;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/users")
public class userController {

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createNewAccount(String jsonData) {
        UserDTO userDTO = AppUtil.GSON.fromJson(jsonData, UserDTO.class);
        String responseJson = new UserService().NewUser(userDTO);
        return Response.ok().entity(responseJson).build();
    }
}
