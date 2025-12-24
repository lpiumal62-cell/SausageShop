package com.eagle.sausageshop.controller.api;

import com.eagle.sausageshop.dto.UserDTO;
import com.eagle.sausageshop.service.AdminService;
import com.eagle.sausageshop.util.AppUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/admin")
public class adminController {
    @Path("/admin-login")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response userLogin(String jsonData, @Context HttpServletRequest request) {
        UserDTO userDTO = AppUtil.GSON.fromJson(jsonData, UserDTO.class);
        String responseJson = new AdminService().adminLogin(userDTO, request);
        return Response.ok().entity(responseJson).build();
    }
}
