package com.eagle.sausageshop.service;

import com.eagle.sausageshop.entity.City;
import com.eagle.sausageshop.util.AppUtil;
import com.eagle.sausageshop.util.HibernateUtil;
import com.google.gson.JsonObject;
import org.hibernate.Session;

import java.util.List;

public class CityService {
    public String loadAllCities() {
        JsonObject responseObject = new JsonObject();

        Session hibernateSession = HibernateUtil.getSessionFactory().openSession();
        List<City> cityList = hibernateSession.createQuery("FROM City c", City.class).getResultList();
        responseObject.add("cities", AppUtil.GSON.toJsonTree(cityList));
        hibernateSession.close();

        return AppUtil.GSON.toJson(responseObject);
    }
}
