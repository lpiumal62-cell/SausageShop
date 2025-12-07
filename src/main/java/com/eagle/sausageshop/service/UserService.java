package com.eagle.sausageshop.service;

import com.eagle.sausageshop.dto.UserDTO;
import com.eagle.sausageshop.entity.Status;
import com.eagle.sausageshop.entity.User;
import com.eagle.sausageshop.mail.VerificationMail;
import com.eagle.sausageshop.provider.MailProvider;
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

import static com.eagle.sausageshop.util.AppUtil.GSON;

public class UserService {


    public String Login(UserDTO userDTO, @Context HttpServletRequest request) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        if (userDTO.getEmail() == null) {
            message = "Email is required!";
        } else if (userDTO.getEmail().isBlank()) {
            message = "Email address can not be empty!";
        } else if (!userDTO.getEmail().matches(Validator.EMAIL_VALIDATION)) {
            message = "Please provide valid email address!";
        } else if (userDTO.getPassword() == null) {
            message = "Password is required!";
        } else if (userDTO.getPassword().isBlank()) {
            message = "Password can not be empty!";
        } else if (!userDTO.getPassword().matches(Validator.PASSWORD_VALIDATION)) {
            message = "Please provide valid password. \n " +
                    "The password must be at least 8 characters long and include at least one uppercase letter, " +
                    "one lowercase letter, one digit, and one special character";
        } else {
            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
            User singleUser = hibernateSession.createNamedQuery("User.getByEmail", User.class)
                    .setParameter("email", userDTO.getEmail())
                    .getSingleResultOrNull();
            if (singleUser == null) { // not found
                message = "Account not found. Please register first!";
            } else {
                if (!singleUser.getPassword().equals(userDTO.getPassword())) {
                    message = "Something went wrong. Please check your login credentials!";
                } else {
                    Status verifiedStatus = hibernateSession.createNamedQuery("Status.findByValue", Status.class)
                            .setParameter("value", String.valueOf(Status.Type.VERIFIED))
                            .getSingleResult();
                    if (!singleUser.getStatus().equals(verifiedStatus)) {
                        message = "Your account is not verified. Please verify first!";
                    } else {
                        HttpSession httpSession = request.getSession();
                        httpSession.setAttribute("user", singleUser);
                        status = true;
                        message = "Login successful";
                    }
                }
            }
            hibernateSession.close();
        }
        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
    }


    public String verifyAccount(UserDTO userDTO) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        // Extract values
        String email = userDTO.getEmail();
        String code = userDTO.getVerificationCode();

        // Validate inputs
        if (email == null || email.isBlank()) {
            message = "Email is required!";
        } else if (code == null) {
            message = "Verification code is required!";
        } else if (code.isBlank()) {
            message = "Verification code is empty!";
        } else if (!code.matches(Validator.VERIFICATION_CODE_VALIDATION)) {
            message = "Please provide a valid verification code!";
        } else {
            Session session = HibernateUtil.getSessionFactory().openSession();

            try {
                // Fetch user using email + code
                User user = session.createQuery(
                                "FROM User u WHERE u.email = :email AND u.verificationCode = :verificationCode",
                                User.class
                        )
                        .setParameter("email", email)
                        .setParameter("verificationCode", code)
                        .uniqueResult();

                if (user == null) {
                    message = "Invalid verification code or email!";
                } else {

                    // Get verified status
                    Status verifiedStatus = session.createNamedQuery("Status.findByValue", Status.class)
                            .setParameter("value", String.valueOf(Status.Type.VERIFIED))
                            .getSingleResult();

                    if (user.getStatus().equals(verifiedStatus)) {
                        message = "Account is already verified!";
                    } else {
                        Transaction tx = session.beginTransaction();
                        try {
                            user.setStatus(verifiedStatus);
                            user.setVerificationCode(""); // Clear code after success
                            session.merge(user);
                            tx.commit();

                            status = true;
                            message = "Account verification completed!";
                        } catch (Exception e) {
                            tx.rollback();
                            message = "Something went wrong. Verification failed!";
                        }
                    }
                }

            } catch (Exception e) {
                message = "Unexpected error occurred!";
            } finally {
                session.close();
            }
        }

        // Build JSON response
        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return GSON.toJson(responseObject);
    }


    public String NewUser(UserDTO userDTO) {
        JsonObject responseObject = new JsonObject();

        boolean status = false;
        String message;

        if (userDTO.getFirstName() == null) {
            message = "First name is required!";
        } else if (userDTO.getFirstName().isBlank()) {
            message = "First name can not be empty!";
        } else if (userDTO.getLastName() == null) {
            message = "Last name is required!";
        } else if (userDTO.getLastName().isBlank()) {
            message = "Last name can not be empty!";
        } else if (userDTO.getEmail() == null) {
            message = "Email is required!";
        } else if (userDTO.getEmail().isBlank()) {
            message = "Email can not be empty!";
        } else if (!userDTO.getEmail().matches(Validator.EMAIL_VALIDATION)) {
            message = "Please provide valid email address!";
        } else if (userDTO.getPassword() == null) {
            message = "Password is required!";
        } else if (userDTO.getPassword().isBlank()) {
            message = "Password can not be empty!";
        } else if (!userDTO.getPassword().matches(Validator.PASSWORD_VALIDATION)) {
            message = "Please provide valid password. \n " +
                    "The password must be at least 8 characters long and include at least one uppercase letter, " +
                    "one lowercase letter, one digit, and one special character";
        } else {
            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
            User singleUser = hibernateSession.createNamedQuery("User.getByEmail", User.class)
                    .setParameter("email", userDTO.getEmail())
                    .getSingleResultOrNull();

            if (singleUser != null) { // Already exists
                message = "This email already exists! Please use another email";
            } else {
                User u = new User();
                u.setFirstName(userDTO.getFirstName());
                u.setLastName(userDTO.getLastName());
                u.setEmail(userDTO.getEmail());
                u.setPassword(userDTO.getPassword());

                String verificationCode = AppUtil.generateCode();

                u.setVerificationCode(verificationCode);

                Status pendingStatus = hibernateSession.createNamedQuery("Status.findByValue", Status.class)
                        .setParameter("value", String.valueOf(Status.Type.PENDING)).getSingleResult();

                u.setStatus(pendingStatus);

                Transaction transaction = hibernateSession.beginTransaction();

                try {
                    hibernateSession.persist(u);
                    transaction.commit();
                    //System.out.println(u.getId());

                    /// verification-mail-sending-start
                    VerificationMail verificationMail = new VerificationMail(u.getEmail(), verificationCode);
                    MailProvider.getInstance().sendMail(verificationMail);
                    /// verification-mail-sending-end
                    status = true;
                    responseObject.addProperty("uId", u.getId());
                    message = "Account created successfully. Verification code has been sent to the your email. " +
                            "Please verify it for activate your account!";

                } catch (HibernateException e) {
                    transaction.rollback();
                    message = "Account creation failed. Please try again!";
                }


            }
            hibernateSession.close();
        }
        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return GSON.toJson(responseObject);
    }
}
