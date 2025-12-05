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
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.Transaction;

public class UserService {

    public String verifyAccount(UserDTO userDTO) {
        JsonObject responseObject = new JsonObject();
        boolean status = false;
        String message = "";

        ///  logic handling part
        if (userDTO.getEmail() == null) {
            message = "Email is required!";
        } else if (userDTO.getEmail().isBlank()) {
            message = "Email address can not be empty!";
        } else if (!userDTO.getEmail().matches(Validator.EMAIL_VALIDATION)) {
            message = "Please provide valid email address!";
        } else if (userDTO.getVerificationCode() == null) {
            message = "Verification is required!";
        } else if (userDTO.getVerificationCode().isBlank()) {
            message = "Verification code can not be empty!";
        } else if (!userDTO.getVerificationCode().matches(Validator.VERIFICATION_CODE_VALIDATION)) {
            message = "Please provide valid verification code!. Verification code must have 6 digits";
        } else {
            Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
            User user = hibernateSession.createQuery("FROM User u WHERE u.email=:email AND u.verificationCode=:verificationCode", User.class)
                    .setParameter("email", userDTO.getEmail())
                    .setParameter("verificationCode", userDTO.getVerificationCode())
                    .getSingleResultOrNull();
            if (user == null) {
                message = "Account not found. Please register first!";
            } else {
                Status verifiedStatus = hibernateSession.createNamedQuery("Status.findByValue", Status.class)
                        .setParameter("value", String.valueOf(Status.Type.VERIFIED))
                        .getSingleResult();

                if (user.getStatus().equals(verifiedStatus)) {
                    message = "Account already verified!";
                } else {
                    user.setStatus(verifiedStatus);
                    user.setVerificationCode("");
                    Transaction transaction = hibernateSession.beginTransaction();
                    try {
                        hibernateSession.merge(user);
                        transaction.commit();
                        status = true;
                        message = "Account verification completed!";
                    } catch (HibernateException e) {
                        transaction.rollback();
                        message = "Something went wrong. Verification process failed!";
                    }
                }
            }
            hibernateSession.close();
        }

        responseObject.addProperty("status", status);
        responseObject.addProperty("message", message);
        return AppUtil.GSON.toJson(responseObject);
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

                    /// verification-mail-sending-start
                    VerificationMail verificationMail = new VerificationMail(u.getEmail(), verificationCode);
                    MailProvider.getInstance().sendMail(verificationMail);
                    /// verification-mail-sending-end
                    status = true;
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
        return AppUtil.GSON.toJson(responseObject);
    }
}
