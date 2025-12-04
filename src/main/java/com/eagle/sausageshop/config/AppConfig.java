package com.eagle.sausageshop.config;

import org.glassfish.jersey.server.ResourceConfig;

public class AppConfig extends ResourceConfig {
    public AppConfig(){
        packages("com.eagle.sausageShop.controller");
        packages("com.eagle.sausageShop.middleware");
        register(org.glassfish.jersey.media.multipart.MultiPartFeature.class);
    }

}
