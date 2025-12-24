package com.eagle.sausageshop.service;

import com.eagle.sausageshop.dto.UserDTO;
import com.eagle.sausageshop.entity.Seller;
import com.eagle.sausageshop.entity.Status;
import com.eagle.sausageshop.entity.User;
import com.eagle.sausageshop.util.AppUtil;
import com.eagle.sausageshop.util.HibernateUtil;
import com.eagle.sausageshop.validation.Validator;
import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.ws.rs.core.Context;
import org.hibernate.Session;
import org.hibernate.Transaction;

public class AdminService {

    public String adminLogin(UserDTO userDTO, @Context HttpServletRequest request) {

        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        if (userDTO.getEmail() == null || userDTO.getEmail().isBlank()) {
            message = "Email is required!";
        } else if (!userDTO.getEmail().matches(Validator.EMAIL_VALIDATION)) {
            message = "Please provide a valid email address!";
        } else if (userDTO.getPassword() == null || userDTO.getPassword().isBlank()) {
            message = "Password is required!";
        } else {

            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
            Transaction transaction = null;

            try {
                transaction = hibernateSession.beginTransaction();

                User user = hibernateSession.createQuery(
                                "FROM User u WHERE u.email = :email",
                                User.class
                        ).setParameter("email", userDTO.getEmail())
                        .uniqueResult();

//                System.out.println("=== DEBUG LOGIN ===");
//                System.out.println("Input Email   : " + userDTO.getEmail());
//                System.out.println("Input Password: " + userDTO.getPassword());
//
//                if (user != null) {
//                    System.out.println("DB Email      : " + user.getEmail());
//                    System.out.println("DB Password   : " + user.getPassword());
//                    System.out.println("DB Role Name  : " + (user.getRole() != null ? user.getRole().getName() : "NULL"));
//                } else {
//                    System.out.println("DB User not found");
//                }

                if (user == null) {
                    message = "Invalid email or password!";
                } else if (!userDTO.getPassword().equals(user.getPassword())) {
                    message = "Invalid email or password!";
                } else if (user.getRole() == null || !"ADMIN".equals(user.getRole().getName())) {
                    message = "Access denied! Admins only.";
                } else {
                    Seller seller = hibernateSession.createQuery(
                                    "FROM Seller s WHERE s.user = :user",
                                    Seller.class
                            ).setParameter("user", user)
                            .uniqueResult();

                    if (seller == null) {
                        message = "Seller account not found!";
                    } else if (!Status.Type.APPROVED.name().equals(seller.getStatus().getValue())) {
                        message = "Account not approved yet!";
                    } else {

                        HttpSession session = request.getSession(true);
                        session.setAttribute("user", user);
                        session.setAttribute("role", "ADMIN");

                        status = true;
                        message = "Admin login successful!";
                    }
                }
                transaction.commit();
            } catch (Exception e) {
                if (transaction != null) transaction.rollback();
                e.printStackTrace();
                message = "Server error! Please try again later.";
            } finally {
                hibernateSession.close();
            }
        }
        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }
}
