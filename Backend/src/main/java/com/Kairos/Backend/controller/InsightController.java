package com.Kairos.Backend.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;
import com.Kairos.Backend.model.Insights;
import com.Kairos.Backend.service.InsightService;
import org.springframework.web.bind.annotation.RequestParam;


@RestController 
@RequestMapping ("/Insights")
public class InsightController {

    private final InsightService service;
        public InsightController(InsightService service){
            this.service = service;
        }
    
    @GetMapping("/{id}")
    public Insights listarId(@PathVariable int id){
        return service.buscaIdInsight(id);
    }
    
    @GetMapping("/{}")
    public List<Insights> listarinsights(@PathVariable int id){
        return service.buscaInsights();
    }
    
        
}
