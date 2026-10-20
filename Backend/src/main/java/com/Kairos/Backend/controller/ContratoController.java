package com.Kairos.Backend.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import com.Kairos.Backend.service.ContratoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import com.Kairos.Backend.model.Contrato;


@RestController
@RequestMapping("/Contrato")

public class ContratoController {
    
    private final ContratoService service;
        public ContratoController(ContratoService service){
            this.service = service;
        }

    @GetMapping("/{id}")
    public Contrato buscarId(@PathVariable int id ){
        return service.buscaIdContrato(id);
    }

    @GetMapping("/{}")
    public List<Contrato> buscaContrato(){
        return service.buscarContrato();
    }
}
