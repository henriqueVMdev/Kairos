package com.Kairos.Backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Kairos.Backend.model.Cliente;
import com.Kairos.Backend.service.ClienteService;

@RestController
@RequestMapping ("/cliente")        //controller e quem e recebe as requisições HTTP (JSON, URL, Verbo) repassa para o service

public class ClienteController {
    
    private final ClienteService service;                       //Controler nao tem acesso ao banco entao aqui conecta ao service para comunicar com o banco
        public ClienteController(ClienteService service){
            this.service = service;  
        }
    @GetMapping ("/{id}")
    public Cliente buscarId(@PathVariable int id) {
        return service.buscaClienteId(id);
    }

    @GetMapping ("/{}")
    public List<Cliente> buscarClientes(){
        return service.listarCliente();
    }
}
