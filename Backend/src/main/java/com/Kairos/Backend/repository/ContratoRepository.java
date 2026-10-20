package com.Kairos.Backend.repository;

import com.Kairos.Backend.model.Contrato;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContratoRepository extends JpaRepository<Contrato, Integer> {
    
}
