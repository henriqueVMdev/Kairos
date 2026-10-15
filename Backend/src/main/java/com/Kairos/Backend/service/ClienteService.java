package com.Kairos.Backend.service;

import org.springframework.stereotype.Service;

import com.Kairos.Backend.model.Cliente;
import com.Kairos.Backend.repository.ClienteRepository;

import java.util.Optional;
import java.util.List;


@Service  // service são onde ficam as regras do negocio 

public class ClienteService {

    private final ClienteRepository repository;
        public ClienteService(ClienteRepository repository){
            this.repository = repository;
        }

    public List<Cliente> listarCliente(){
    return repository.findAll();
    }

    public Cliente buscaClienteId(int id){
        Optional<Cliente> busca = repository.findById(id);
        Cliente clienteId = busca.orElseThrow();
        return clienteId;
    }

}
