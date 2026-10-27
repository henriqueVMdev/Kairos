package com.Kairos.Backend.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;



@Entity 
@Table (name = "Consultor")
public class Consultor {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column( nullable = false)
    private int area;

    @OneToMany(mappedBy="consultor")
    private List<Cliente> cliente = new ArrayList<>();

    @OneToMany(mappedBy = "consultor")
    private List<Telemetria> telemetria = new ArrayList<>();

    public Consultor(String nome, int area){
        setNome(nome);
        setArea(area);
    }

    protected Consultor(){};

    public int getId(){
        return id;
    }
    public void setId(int id){
        this.id = id;
    }
    
    public String getNome(){
        return nome;
    }
    public void setNome(String nome){
        this.nome = nome;
    }

    public int getarea(){
        return area;
    }
    public void setArea(int area){
        this.area = area;
    }
}
    
