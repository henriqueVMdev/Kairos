package com.Kairos.Backend.service;
import org.springframework.stereotype.Service;

import com.Kairos.Backend.model.Consultor;
import com.Kairos.Backend.repository.ConsultorRepository;

import java.util.Optional;
import java.util.List;

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

}
