package com.Kairos.Backend.model;

import java.time.LocalDate;
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
@Table(name = "Contrato")
public class Contrato {
    
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private int id;

    private LocalDate dataInicio = LocalDate.now(); 

    // colocar data fim depois **

    @Column(nullable = false)
    private double value;


    @Column( nullable = false)
    private int status;

    @ManyToOne 
    @JoinColumn  (name = "Cliente_id")
    private Cliente cliente;

    @OneToMany (mappedBy = "Serviço_id")
    private List <Servico> servicos = new ArrayList<>();

    public Contrato(int status){
        setStatus(status);
    }

    protected Contrato(){};
    
    public int getId(){
        return id;
    }
    public void setId ( int id ){
        this.id = id;
    }

    public double getValue(){
        return value;
    }
    public void setValue(double value){
        this.value = value;
    }

    public int getStatus(){
        return status;
    }
    public void setStatus(int status){
        this.status = status;
    }
    
}
