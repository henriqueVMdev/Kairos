package com.Kairos.Backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.Kairos.Backend.model.Insights;
import com.Kairos.Backend.repository.InsightsRepository;

@Service
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

    public Insights saveInsight(Insights insight){
        return repository.save(insight);
    }

}
