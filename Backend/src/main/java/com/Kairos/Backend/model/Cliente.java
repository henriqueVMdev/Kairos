package com.Kairos.Backend.model;

import jakarta.persistence.*;

@Entity

@Table(name = "clientes")
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column (name = "segmento", nullable = true)
    private String segmento;

    @Column ( name = "nivel", nullable = true)
    private int nivel;
    
    private double faturamento;

    public Cliente(int id, String segmento, int nivel, double faturamento){
        setId(id);
        setSegmento(segmento);
        setNivel(nivel);
        setFaturamento(faturamento);
    }

    public int getCodId(){
        return id;
    }
    public void setId(int id){
        this.id = id;
    }

    public String getSegmento(){
        return segmento;
    }
    public void setSegmento(String segmento){
        this.segmento = segmento;
    }

    public int getNivel(){
        return nivel;
    }
    public void setNivel(int nivel){
        this.nivel = nivel;
    }

    public double getFaturamento(){
        return faturamento;
    }
    public void setFaturamento(double faturamento){
        this.faturamento = faturamento;
    }
}


