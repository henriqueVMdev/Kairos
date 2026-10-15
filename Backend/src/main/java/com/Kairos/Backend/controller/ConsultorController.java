import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Kairos.Backend.model.Consultor;
import com.Kairos.Backend.service.ConsultorService;

public class ConsultorController{   // Controller recebe as requisições HTTP

    private final ConsultorService service;
        public ConsultorController(ConsultorService service){
            this.service = service;
        }

}