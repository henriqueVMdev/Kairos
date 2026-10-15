package com.Kairos.Backend.repository;

import com.Kairos.Backend.model.Cliente;

import org.springframework.data.jpa.repository.JpaRepository;

//repository conversa como banco de dados

// faz a busca no banco vem por padrao do pring com findAll() findById(id) save(cliente) deleteById(id)  

public interface ClienteRepository extends JpaRepository<Cliente, Integer>{

    
}
