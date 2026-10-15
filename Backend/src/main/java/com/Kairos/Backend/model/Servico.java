package com.Kairos.Backend.model;

import jakarta.persistence.*;


@Entity
@Table(name = "Servico")
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String categoria;
   
    @Column(nullable = false)
    private String descricao;

    @ManyToOne
    @JoinColumn (name ="Cliente_id")
    private Cliente cliente;
    
    public Servico(String categoria, String nome, String descricao){
        setCategoria(categoria);
        setNome(nome);
        setDescricao(descricao);
    }

    protected Servico(){};


   public int getId(){
    return id;
   }
   public void setId(int id){
    this.id = id;
   }

    public String getCategoria(){
        return categoria;
    }
    public void setCategoria(String categoria){
        this.categoria = categoria;
    }

    public String getNome(){
        return nome;
    }
    public void setNome(String nome){
        this.nome = nome;
    }

    public String getDescricao(){
        return descricao;
    }
    public void setDescricao(String descricao){
        this.descricao = descricao;
    }

}
