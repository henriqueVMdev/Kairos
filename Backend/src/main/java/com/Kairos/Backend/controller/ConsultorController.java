import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


import java.util.List;

import com.Kairos.Backend.model.Consultor;
import com.Kairos.Backend.service.ConsultorService;

@RestController
@RequestMapping("/Consultor")

public class ConsultorController{   // Controller recebe as requisições HTTP

    private final ConsultorService service;
        public ConsultorController(ConsultorService service){
            this.service = service;
        }

    @GetMapping("/{id}")
    public Consultor buscarId(@PathVariable int id){
        return service.buscaIdConsultor(id);
    }

    @GetMapping ("/{}")
    public List<Consultor> buscarConsultor(){
        return service.listarConsultor();
    }
}