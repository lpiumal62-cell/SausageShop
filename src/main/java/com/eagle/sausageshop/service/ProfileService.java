package com.eagle.sausageshop.service;

import com.eagle.sausageshop.dto.UserDTO;
import com.eagle.sausageshop.entity.Address;
import com.eagle.sausageshop.entity.User;
import com.eagle.sausageshop.util.AppUtil;
import com.eagle.sausageshop.util.HibernateUtil;
import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.ws.rs.core.Context;
import org.hibernate.Session;
import java.util.List;


public class ProfileService {

    public String loadingService(@Context HttpServletRequest request) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        HttpSession httpSession = request.getSession(false);
        User user = (User) httpSession.getAttribute("user");

        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setFirstName(user.getFirstName());
        userDTO.setLastName(user.getLastName());
        userDTO.setEmail(user.getEmail());
        userDTO.setPassword(user.getPassword());

        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
        List<Address> addressList = hibernateSession.createQuery("FROM Address a WHERE a.user=:user", Address.class)
                .setParameter("user", user).getResultList();


        Address primaryAddress = null;
        for (Address address : addressList) {
            if (address.isPrimary()) {
                primaryAddress = address;
                break;
            }
        }
        if (primaryAddress != null) {
//            System.out.println(primaryAddress.getLineOne());
            userDTO.setLineOne(primaryAddress.getLineOne());
            userDTO.setLineTwo(primaryAddress.getLineTwo());
            userDTO.setPostalCode(primaryAddress.getPostalCode());
            userDTO.setPrimary(primaryAddress.isPrimary());
            userDTO.setMobile(primaryAddress.getMobile());
            userDTO.setCityId(primaryAddress.getCity().getId());
            userDTO.setCityName(primaryAddress.getCity().getName());

        }

        responseObject.add("user", AppUtil.GSON.toJsonTree(userDTO));

        hibernateSession.close();
        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);

    }
}
