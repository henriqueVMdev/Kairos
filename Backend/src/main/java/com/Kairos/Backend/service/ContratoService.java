package com.Kairos.Backend.service;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import com.Kairos.Backend.model.Contrato;
import com.Kairos.Backend.repository.ContratoRepository;


@Service
public class ContratoService {

    private final ContratoRepository repository;
        public ContratoService(ContratoRepository repository){
            this.repository = repository;
        }
    
    public Contrato buscaIdContrato (int id){
        Optional<Contrato> busca = repository.findById(id);
        Contrato contratoId = busca.orElseThrow();
        return contratoId;
    }
    
    public List<Contrato> buscarContrato(){
        return repository.findAll();
    }

   

}
