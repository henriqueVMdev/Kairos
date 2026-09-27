package com.Kairos.Backend.model;

import jakarta.persistence.*;


@Entity 
@Table (name = "Consultor")
public class Consultor {

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "matricula", nullable = false)
    private int matricula;

    @OneToMany(mappedBy="Cliente")
    private Cliente cliente;

    public Consultor(String nome, int matricula){
        setNome(nome);
        setMatricula(matricula);
    }

    protected Consultor(){};

    public String getNome(){
        return nome;
    }
    public void setNome(String nome){
        this.nome = nome;
    }

    public int getMatricula(){
        return matricula;
    }
    public void setMatricula(int matricula){
        this.matricula = matricula;
    }
}
