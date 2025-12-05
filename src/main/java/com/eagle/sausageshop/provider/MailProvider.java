package com.eagle.sausageshop.provider;

import com.eagle.sausageshop.mail.Mailable;
import com.eagle.sausageshop.util.Env;
import jakarta.mail.Authenticator;
import jakarta.mail.PasswordAuthentication;
import org.apache.tomcat.util.threads.ThreadPoolExecutor;

import java.util.Properties;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

public class MailProvider {

    private ThreadPoolExecutor executor;
    private Authenticator authenticator;
    private final BlockingQueue<Runnable> blockingQueue = new LinkedBlockingQueue<>();
    private final Properties properties = new Properties();
    private static MailProvider mailProvider;

    private MailProvider() {
        properties.put("mail.smtp.auth", true);
        properties.put("mail.smtp.starttls.enable", true);
        properties.put("mail.smtp.host", Env.get("mail.host"));
        properties.put("mail.smtp.port", Env.get("mail.port"));
    }

    public static MailProvider getInstance() {
        if (mailProvider == null) {
            mailProvider = new MailProvider();
        }
        return mailProvider;
    }

    public void start() {
        authenticator = new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(Env.get("mail.username"), Env.get("mail.password"));
            }
        };
        executor = new ThreadPoolExecutor(2, 5, 5,
                TimeUnit.SECONDS, blockingQueue, new ThreadPoolExecutor.AbortPolicy());
        executor.prestartCoreThread();
        System.out.println("\u001B[32mEmailServiceProvider Initialized...\u001B[32m");
    }

    public Properties getProperties() {
        return properties;
    }

    public Authenticator getAuthenticator() {
        return authenticator;
    }

    public void shutdown() {
        if (executor != null) {
            executor.shutdown();
        }
    }

    public void sendMail(Mailable mailable){
        boolean offer = blockingQueue.offer(mailable);
    }
}
