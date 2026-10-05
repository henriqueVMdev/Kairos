package com.Kairos.Backend.model;
import java.time.LocalDate;

import jakarta.persistence.*;


@Entity
@Table(name = "Insights")
public class Insights {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false)
    private String tipo;

    @Column(nullable = false)
    private String descricao;

    private LocalDate dataGeracao = LocalDate.now();

    @ManyToOne 
    @JoinColumn ( name = "Cliente_id")
    private Cliente cliente;
   
    @ManyToOne
    @JoinColumn ( name = "Contrato_id")
    private Contrato contrato;

    public Insights(int id, String tipo, String descricao){
        setTipo(tipo);
        setDescricao(descricao);
        setId(id);
    }
    
    public int getId(){
        return id;
    }

    public void setId(int id){
        this.id = id;
    }

    public String getTipo(){
        return tipo;
    }
    public void setTipo(String tipo){
        this.tipo = tipo;
    }

    public String getDescricao(){
        return descricao;
    }
    public void setDescricao(String descricao){
        this.descricao = descricao;
    }
   
}

