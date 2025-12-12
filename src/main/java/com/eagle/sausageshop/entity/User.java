package com.eagle.sausageshop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@NamedQuery(name = "User.getByEmail", query = "FROM User u WHERE u.email=:email")
public class User extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Size(max = 45)
    @Column(name = "first_name")
    private String firstName;
    @Size(max = 45)
    @Column(name = "last_name")
    private String lastName;
    @NotBlank
    @Email
    @Size(max = 45)
    @Column(name = "email", unique = true, nullable = false)
    private String email;
    @NotBlank
    @Size(max = 200)
    @Column(name = "password", nullable = false)
    private String password;



    @Size(max = 45)
    @Column(name = "verification_code")
    private String verificationCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id")
    private Status status;

    @OneToMany(mappedBy = "user")
    private Set<Address> addresses =new HashSet<>();

    // Other relationships omitted for brevity


    public Set<Address> getAddresses() {
        return addresses;
    }

    public void setAddresses(Set<Address> addresses) {
        this.addresses = addresses;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }
}
