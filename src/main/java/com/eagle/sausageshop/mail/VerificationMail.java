package com.eagle.sausageshop.mail;

import com.eagle.sausageshop.util.Env;
import io.rocketbase.mail.model.HtmlTextEmail;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;

public class VerificationMail extends Mailable {
    private final String to;
    private final String verificationCode;

    public VerificationMail(String to, String verificationCode) {
        this.to = to;
        this.verificationCode = verificationCode;
    }

    @Override
    public void build(Message message) throws MessagingException {
        message.setRecipient(Message.RecipientType.TO, new InternetAddress(to));
        message.setSubject("Email Verification code - " + Env.get("app.name"));

//        String verifyURL=appURL+"/api/verify-accounts?verificationCode="+verificationCode;
        String appURL = Env.get("app.url");
        String verifyURL = appURL + "/verify-account.html?email=" + to + "&verificationCode=" + verificationCode;

        HtmlTextEmail htmlTextEmail = getEmailTemplateBuilder()
                .header()
                .logo("https://upload.wikimedia.org/wikipedia/commons/e/eb/sausageShopPI.png").logoHeight(40).and()
                .text("WELCOME " + to).h1().center().and()
                .text("Thanks for register in our website").and()
                .text("To verify your email please click on the button below..").and()
                .text("You Verifycation Code: " + verificationCode).center().and()
                .button("Verify Your Email", verifyURL).blue().center().and()
                .text("If you have a any trouble please this link in your browser.").center().and()
//                .text("<a>href=\"" + verifyURL + "\">" + verifyURL + "</a>").center().and()
                .html("<a href=\"" + verifyURL + "\">" + verifyURL + "</a>").and()
                .copyright(Env.get("app.name")).url(appURL).suffix(". All Right Reserved").and()
                .build();

        message.setContent(htmlTextEmail.getHtml(), "text/html;charset=utf-8");
    }
}
