package com.Kairos.Backend.service;

import java.util.Optional;
import java.util.List;
import com.Kairos.Backend.model.Insights;
import com.Kairos.Backend.repository.InsightsRepository;

public class InsightService {
    
    private final InsightsRepository repository;
        public InsightService(InsightsRepository repository){
            this.repository = repository;
        }

    public Insights buscaIdInsight(int id){
        Optional<Insights> busca = repository.findById(id);
        Insights insightId = busca.orElseThrow();
        return insightId;
    }

    public List<Insights> buscaInsights(){
        return repository.findAll();
    }
}
