package com.Kairos.Backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


import com.Kairos.Backend.service.ClienteService;

import com.Kairos.Backend.model.Cliente;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping ("/cliente")

public class ClienteController {
    
    private final ClienteService service;                       //Controler nao tem acesso ao banco
        public ClienteController(ClienteService service){
            this.service = service;  
        }
    @GetMapping ("/{id}")
    public Cliente buscarId(@PathVariable int id) {
        return service.buscaClienteId(id);
    }
}
