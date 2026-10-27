package com.Kairos.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Kairos.Backend.model.Insights;

public interface InsightsRepository extends JpaRepository<Insights, Integer> {
    
}
