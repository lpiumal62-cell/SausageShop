package com.eagle.sausageshop.entity;

import java.io.Serializable;
import java.util.Objects;


public class WishlistId implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    private Integer user;
    private Integer product;
    
    public WishlistId() {
    }
    
    public WishlistId(Integer user, Integer product) {
        this.user = user;
        this.product = product;
    }
    
    public Integer getUser() {
        return user;
    }
    
    public void setUser(Integer user) {
        this.user = user;
    }
    
    public Integer getProduct() {
        return product;
    }
    
    public void setProduct(Integer product) {
        this.product = product;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        WishlistId that = (WishlistId) o;
        return Objects.equals(user, that.user) && Objects.equals(product, that.product);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(user, product);
    }
}

