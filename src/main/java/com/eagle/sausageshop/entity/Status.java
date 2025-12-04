package com.eagle.sausageshop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.util.List;

@Entity
@NamedQuery(name = "Status.findByValue", query = "FROM Status s WHERE s.value=:value")
public class Status implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @NotBlank
    @Size(max = 45)
    @Column(name = "value", unique = true, nullable = false)
    private String value;

    @OneToMany(mappedBy = "status")
    private List<User> users;


    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public enum Type {
        ACTIVE,
        PENDING,
        INACTIVE,
        BLOCKED,
        DELIVERED,
        PACKING,
        APPROVED,
        REJECTED,
        CANCELED,
        VERIFIED,
        RECEIVED,
        COMPLETED
    }
}
