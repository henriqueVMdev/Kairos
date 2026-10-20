package com.Kairos.Backend.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.ResponseEntity;
import java.util.List;
import com.Kairos.Backend.model.Telemetria;
import com.Kairos.Backend.service.TelemetriaService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

@RestController 
@RequestMapping("/Telemetria")
public class TelemetriaController {
    
    private final TelemetriaService service;
        public TelemetriaController(TelemetriaService service){
            this.service = service;
        }

    @GetMapping("/{id}")
    public Telemetria listarId(@PathVariable int id){
        return service.buscaIdTelemetria(id);
    }

    @GetMapping("/{}")
    public List<Telemetria> listarTelemetria(){
        return service.buscaTelemetria();
    }

    @PostMapping("/{id}")
    public ResponseEntity<Telemetria> criarTelemetria(@RequestBody Telemetria telemetria){
        Telemetria novaTelemetria = service.saveTelemetria(telemetria);
        return ResponseEntity.status(204).body(novaTelemetria);
    }
}
