package com.eagle.sausageshop.listener;

import com.eagle.sausageshop.provider.MailProvider;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

@WebListener
public class ContextPathListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        MailProvider.getInstance().start();
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        MailProvider.getInstance().shutdown();
    }
}
