package com.Kairos.Backend.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;

import java.util.List;
import com.Kairos.Backend.model.Servico;
import com.Kairos.Backend.service.ServicoService;


@RestController 
@RequestMapping("/Service")
public class ServicoController {

    private final ServicoService service;
        public ServicoController(ServicoService service){
            this.service = service;
        }
    
    @GetMapping("/{id}")
    public Servico listarId(@PathVariable int id){
        return service.buscaIdServicos(id);
    }

    @GetMapping("/{}")
    public List<Servico> listarServico(){
        return service.buscaServico();
    }

    @PostMapping("/{Id")
    public ResponseEntity<Servico> criarServico(@RequestBody Servico servico){
        Servico novoServico = service.saveService(servico);
        return ResponseEntity.status(204).body(novoServico);
    }
    
}
