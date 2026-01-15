package com.eagle.sausageshop.service;

import com.eagle.sausageshop.dto.UserDTO;
import com.eagle.sausageshop.entity.Address;
import com.eagle.sausageshop.entity.City;
import com.eagle.sausageshop.entity.User;
import com.eagle.sausageshop.util.AppUtil;
import com.eagle.sausageshop.util.HibernateUtil;
import com.eagle.sausageshop.validation.Validator;
import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.ws.rs.core.Context;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.Transaction;

import java.util.List;


public class ProfileService {


    public String updateProfilePassword(UserDTO userDTO, @Context HttpServletRequest request) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        // 1️⃣ Basic validations
        if (userDTO.getPassword() == null || userDTO.getPassword().isBlank()) {
            message = "Current password is required!";
        } else if (!userDTO.getPassword().matches(Validator.PASSWORD_VALIDATION)) {
            message = "Invalid current password format!";
        } else if (userDTO.getNewPassword() == null || userDTO.getNewPassword().isBlank()) {
            message = "New password is required!";
        } else if (!userDTO.getNewPassword().matches(Validator.PASSWORD_VALIDATION)) {
            message = "Invalid new password format!";
        } else if (userDTO.getConformPassword() == null || userDTO.getConformPassword().isBlank()) {
            message = "Confirm password is required!";
        } else if (!userDTO.getConformPassword().matches(Validator.PASSWORD_VALIDATION)) {
            message = "Invalid confirm password format!";
        } else if (!userDTO.getConformPassword().equals(userDTO.getNewPassword())) {
            message = "New password and confirm password do not match!";
        } else {
            // 2️⃣ Session check
            HttpSession httpSession = request.getSession(false);
            if (httpSession == null || httpSession.getAttribute("user") == null) {
                message = "Please login first";
            } else {
                Session hibernateSession = null;
                Transaction transaction = null;
                try {
                    User sessionUser = (User) httpSession.getAttribute("user");
                    hibernateSession = HibernateUtil.getSessionFactory().openSession();
                    User dbUser = hibernateSession
                            .createNamedQuery("User.getByEmail", User.class)
                            .setParameter("email", sessionUser.getEmail())
                            .getSingleResult();

                    transaction = hibernateSession.beginTransaction();
                    hibernateSession.merge(dbUser);
                    transaction.commit();

                    httpSession.setAttribute("user", dbUser);

                    status = true;
                    message = "Password updated successfully";


                } catch (Exception e) {
                    if (transaction != null) transaction.rollback();
                    e.printStackTrace();
                    message = "Password update failed!";
                } finally {
                    if (hibernateSession != null) hibernateSession.close();
                }
            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }


    public String updateProfileAddress(UserDTO userDTO, @Context HttpServletRequest request) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        if (userDTO.getLineOne() == null) {
            message = "Address line one is required!";
        } else if (userDTO.getLineOne().isBlank()) {
            message = "Address line one can not be empty!";
        } else if (userDTO.getPostalCode() != null &&
                !userDTO.getPostalCode().isBlank() &&
                !userDTO.getPostalCode().matches(Validator.POSTAL_CODE_VALIDATION)) {
            message = "Enter a valid postal code!";
        } else if (userDTO.getCityId() == 0) {
            message = "Please select a city!";
        } else if (userDTO.getMobile() == null || userDTO.getMobile().isBlank()) {
            message = "Mobile is required!";
        } else if (!userDTO.getMobile().matches(Validator.MOBILE_VALIDATION)) {
            message = "Enter valid mobile number!";
        } else {
            HttpSession httpSession = request.getSession(false);
            if (httpSession == null) {
                message = "Please login first";
            } else if (httpSession.getAttribute("user") == null) {
                message = "Please login first";
            } else {
                User sessionUser = (User) httpSession.getAttribute("user");
                Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
                User dbUser = hibernateSession.createNamedQuery("User.getByEmail", User.class)
                        .setParameter("email", sessionUser.getEmail())
                        .getSingleResult();

                List<Address> addressList = hibernateSession.createQuery("FROM Address a WHERE a.user=:user", Address.class)
                        .setParameter("user", dbUser)
                        .getResultList();


                Address currentAddress = null;
                for (Address address : addressList) {
                    if (address.getLineOne().equals(userDTO.getLineOne()) &&
                            address.getLineTwo().equals(userDTO.getLineTwo() != null ? userDTO.getLineTwo() : "") &&
                            address.getPostalCode().equals(userDTO.getPostalCode() != null ? userDTO.getPostalCode() : "") &&
                            address.getCity().getId() == userDTO.getCityId()) {
                        currentAddress = address;
                        break;
                    }
                }

                if (currentAddress == null) {
                    currentAddress = new Address();
                }

                currentAddress.setLineOne(userDTO.getLineOne());
                currentAddress.setLineTwo(userDTO.getLineTwo());
                currentAddress.setPostalCode(userDTO.getPostalCode());
                currentAddress.setMobile(userDTO.getMobile());
                currentAddress.setUser(dbUser);

                City city = hibernateSession.find(City.class, userDTO.getCityId());

                currentAddress.setCity(city);
                Transaction transaction = hibernateSession.beginTransaction();
                try {
                    hibernateSession.merge(dbUser);
                    hibernateSession.merge(currentAddress);
                    transaction.commit();
                    httpSession.setAttribute("user", dbUser); /// update session user
                    status = true;
                    message = "Profile Address update successful...";
                } catch (HibernateException e) {
                    transaction.rollback();
                    message = "Profile details update failed!";
                }

                hibernateSession.close();
            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }

    public String updateProfile(UserDTO userDTO, @Context HttpServletRequest request) {

        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        if (userDTO.getFirstName() == null || userDTO.getFirstName().isBlank()) {
            message = "First name is required!";
        } else if (userDTO.getLastName() == null || userDTO.getLastName().isBlank()) {
            message = "Last name is required!";
        } else {

            HttpSession httpSession = request.getSession(false);

            if (httpSession == null || httpSession.getAttribute("user") == null) {
                message = "Please login first";
            } else {
                User sessionUser = (User) httpSession.getAttribute("user");
                Session hSession = HibernateUtil.getSessionFactory().openSession();
                User dbUser = hSession.createNamedQuery("User.getByEmail", User.class)
                        .setParameter("email", sessionUser.getEmail())
                        .getSingleResult();

                dbUser.setFirstName(userDTO.getFirstName());
                dbUser.setLastName(userDTO.getLastName());


                Transaction transaction = hSession.beginTransaction();
                try {
                    hSession.merge(dbUser);
                    transaction.commit();
                    httpSession.setAttribute("user", dbUser); /// update session user
                    status = true;
                    message = "Profile details update successful...";
                } catch (HibernateException e) {
                    transaction.rollback();
                    message = "Profile details update failed!";
                }

                hSession.close();
            }
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }


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
