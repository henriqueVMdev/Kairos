package com.Kairos.Backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.Kairos.Backend.model.Cliente;
import com.Kairos.Backend.repository.ClienteRepository;


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

    public Cliente salvarCliente(Cliente cliente){
        return repository.save(cliente);
    }


}
