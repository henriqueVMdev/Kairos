package com.Kairos.Backend.model;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;


@Entity
@Table(name = "Telemetria")
public class Telemetria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    private LocalDate dataUpload = LocalDate.now();

    @Column(nullable = false)
    private String nomeArquivo;

    @Column(nullable = false)
    private int registrosProcessados;

    @ManyToOne
    @JoinColumn(name = "Consultor_id")
    private Consultor consultor;

    private String Status;

    public Telemetria(){ }

    public int getId(){
        return id;
    }
    public void setId(int id){
        this.id = id;
    }

    public String getNomeArquivo(){
        return nomeArquivo;
    }   
    public void setNomeArquivo(String nomeArquivo){
        this.nomeArquivo = nomeArquivo;
    }    
    
}
