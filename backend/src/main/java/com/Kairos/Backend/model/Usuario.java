package com.Kairos.Backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


@Entity 

@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    @Enumerated(EnumType.STRING)
    @Column (nullable = false)
    private Role role;

    @Column (nullable = false, unique = true)
    private String email;

    @Column ( nullable = false)
    private String senhaHash;

    public int getId(){
        return id;
    }

    public void setId(int id){
        this.id = id;
    }

    public Role getRole(){
        return role;
    }
    public void setRole(Role role){
        this.role = role;
    }

    public String getEmail(){
        return email;
    }
    public void setEmail(String email){
        this.email = email;
    }
    public String getSenhaHash(){
        return senhaHash;
    }
    public void setSenhaHash(String senhaHash){
        this.senhaHash = senhaHash;
    }
}

