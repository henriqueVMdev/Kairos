package com.Kairos.Backend.service;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.Kairos.Backend.model.Servico;
import com.Kairos.Backend.repository.ServicoRepository;

@Service
public class ServicoService {
    
    private final ServicoRepository repository;
        public ServicoService(ServicoRepository repository){
            this.repository = repository;
        }
    
    public Servico buscaIdServicos(int id){
        Optional<Servico> busca = repository.findById(id);
        Servico servicoId = busca.orElseThrow();
        return servicoId;
    }

    public List<Servico> buscaServico(){
        return repository.findAll();
    }

    public Servico saveService(Servico servico){
        return repository.save(servico);
    }
}
