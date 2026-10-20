package com.Kairos.Backend.service;

import com.Kairos.Backend.repository.TelemetriaRepository;

import java.util.Optional;
import java.util.List;
import com.Kairos.Backend.model.Telemetria;

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

