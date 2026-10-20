package com.Kairos.Backend.service;
import java.util.Optional;
import java.util.List;

import org.springframework.stereotype.Service;

import com.Kairos.Backend.model.Consultor;
import com.Kairos.Backend.repository.ConsultorRepository;

@Service
public class ConsultorService { // service ficam as regras de negocio e comunicam com o repository que comunica com o banco de dados
    
    private final ConsultorRepository repository;
        public ConsultorService(ConsultorRepository repository){
            this.repository = repository;
        }
    
    public Consultor buscaIdConsultor(int id){
        Optional <Consultor> busca = repository.findById(id);
        Consultor consultorId = busca.orElseThrow();
        return consultorId;
    }

    public List<Consultor> listarConsultor(){
        return repository.findAll();
    }

    public Consultor salvarConsultor(Consultor consultor){
        return repository.save(consultor);
    }
