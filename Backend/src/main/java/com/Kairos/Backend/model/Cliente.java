package com.Kairos.Backend.model;

import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity

@Table(name = "clientes")
public class Cliente {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column (nullable = false)
    private String nome;

    @Column (nullable = false)
    private String segmento;

    @Column (length = 1)
    private Character nivel;
    
    @Column ( precision = 15, scale = 2)
    private BigDecimal faturamento;

    private LocalDate dataCadastro = LocalDate.now();

    @OneToMany (mappedBy="Contrato")
    private List <Contrato> contratos = new ArrayList<>();

    @ManyToOne
    @JoinColumn (name = "consultor_id")
    private Consultor consultor;

    public Cliente(int id, String nome, String segmento, Character nivel, BigDecimal faturamento){
        setId(id);
        setNome(nome);
        setSegmento(segmento);
        setNivel(nivel);
        setFaturamento(faturamento);
    }

    protected Cliente() {}; // construtor vazio para o jpa

    public int getCodId(){
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

    public String getSegmento(){
        return segmento;
    }
    public void setSegmento(String segmento){
        this.segmento = segmento;
    }

    public Character getNivel(){
        return nivel;
    }
    public void setNivel(Character nivel){
        this.nivel = nivel;
    }

    public BigDecimal getFaturamento(){
        return faturamento;
    }
    public void setFaturamento(BigDecimal faturamento){
        this.faturamento = faturamento;
    }
}


