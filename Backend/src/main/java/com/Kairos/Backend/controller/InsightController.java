package com.Kairos.Backend.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;
import com.Kairos.Backend.model.Insights;
import com.Kairos.Backend.service.InsightService;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController 
@RequestMapping ("/Insights")
public class InsightController {

    private final InsightService service;                  
        public InsightController(InsightService service){
            this.service = service;
        }
    
    @GetMapping("/{id}")                            //buscando id 
    public Insights listarId(@PathVariable int id){ //criando fução para listar o id de acordo com os ids buscados
        return service.buscaIdInsight(id);          //usando função do service para busca de ids
    }
    
    @GetMapping("/{}")                                          //buscando no geral sem path declarado
    public List<Insights> listarinsights(){                      //criando lista contendo os Insights encontrados em uma lsta
        return service.buscaInsights();                         //ultilizando a função do services para encontrar os insights do repositorio
    }
    
    @PostMapping("/{id")                                                            //ultilizando a requisição tipo post para criar um item novo no banco
    public ResponseEntity<Insights> criarInsight(@RequestBody Insights insight){    // criando uma função ultilizando ResponseEntity para ter o retorno HTTP referente a este objeto
        Insights novoInsight = service.saveInsight(insight);                        //colocando a função de criar um insight ultilizando a função do services
        return ResponseEntity.status(204).body(novoInsight);                        //o retorno que o usuario tera, onde mostra o status da requisição 204 sucesso e o novoInsight
    }         
}
