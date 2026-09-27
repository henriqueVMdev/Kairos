package com.Kairos.Backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity 
@Table(name = "Contrato")
public class Contrato {

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "matricula", nullable = false)
    private int matricula;

    @ManyToOne 
    @JoinColumn  (name = "cliente_id")
    private Cliente cliente;

    public Contrato(String nome, int matricula){
        setNome(nome);
        setMatricula(matricula);
    }

    protected Contrato(){};
    
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
