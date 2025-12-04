package com.eagle.sausageshop.entity;

import jakarta.persistence.*;

import java.io.Serializable;
import java.time.LocalDateTime;


@Entity
@Table(name = "wishlist")
@IdClass(WishlistId.class)
public class Wishlist implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @Id
    @Column(name = "users_id", nullable = false)
    private Integer userId;
    
    @Id
    @Column(name = "product_id", nullable = false)
    private Integer productId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "users_id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;
    
    @Column(name = "added_at")
    private LocalDateTime addedAt;
    
    public Wishlist() {
    }
    
    public Wishlist(Integer userId, Integer productId) {
        this.userId = userId;
        this.productId = productId;
        this.addedAt = LocalDateTime.now();
    }
    
    public Wishlist(User user, Product product) {
        this.userId = user.getId();
        this.productId = product.getId();
        this.user = user;
        this.product = product;
        this.addedAt = LocalDateTime.now();
    }
    
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    
    public Integer getProductId() {
        return productId;
    }
    
    public void setProductId(Integer productId) {
        this.productId = productId;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
        if (user != null) {
            this.userId = user.getId();
        }
    }
    
    public Product getProduct() {
        return product;
    }
    
    public void setProduct(Product product) {
        this.product = product;
        if (product != null) {
            this.productId = product.getId();
        }
    }
    
    public LocalDateTime getAddedAt() {
        return addedAt;
    }
    
    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}

