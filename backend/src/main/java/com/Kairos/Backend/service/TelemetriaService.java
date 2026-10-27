package com.Kairos.Backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.Kairos.Backend.model.Telemetria;
import com.Kairos.Backend.repository.TelemetriaRepository;

@Service
public class TelemetriaService {

    private final TelemetriaRepository repository;
    public TelemetriaService(TelemetriaRepository repository){
        this.repository = repository;
    }

    public Telemetria buscaIdTelemetria(int id){
    Optional<Telemetria> busca = repository.findById(id);
        Telemetria telemetriaId = busca.orElseThrow();
        return telemetriaId;
    }

    public List<Telemetria> buscaTelemetria(){
        return repository.findAll();
    }

    public Telemetria saveTelemetria(Telemetria telemetria){
        return repository.save(telemetria);
    }
}

