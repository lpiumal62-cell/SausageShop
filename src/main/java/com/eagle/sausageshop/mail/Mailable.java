package com.eagle.sausageshop.mail;

import com.eagle.sausageshop.provider.MailProvider;
import com.eagle.sausageshop.util.Env;
import io.rocketbase.mail.EmailTemplateBuilder;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;


public abstract class Mailable implements Runnable {
    private final MailProvider mailProvider;
    private final EmailTemplateBuilder.EmailTemplateConfigBuilder emailTemplateConfigBuilder;

    public Mailable() {
        this.mailProvider = MailProvider.getInstance();
        this.emailTemplateConfigBuilder = EmailTemplateBuilder.builder();
    }

    @Override
    public void run() {
        try {
            Session mailSession = Session.getInstance(mailProvider.getProperties(), mailProvider.getAuthenticator());
            MimeMessage mimeMessage = new MimeMessage(mailSession);
            mimeMessage.setFrom(new InternetAddress(Env.get("app.mail")));
            build(mimeMessage);
            if (mimeMessage.getRecipients(Message.RecipientType.TO) != null
                    && mimeMessage.getRecipients(Message.RecipientType.TO).length > 0) {
                Transport.send(mimeMessage);
                System.out.println("\u001B[32mEmail sent successfully\u001B[0m");
            } else {
                throw new RuntimeException("Email recipient is required!");
            }
        } catch (Exception me) {
            throw new RuntimeException(me);
        }
    }


    public abstract void build(Message message) throws MessagingException;

    public EmailTemplateBuilder.EmailTemplateConfigBuilder getEmailTemplateBuilder() {
        return emailTemplateConfigBuilder;
    }
}
