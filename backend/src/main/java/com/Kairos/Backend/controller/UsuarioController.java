package com.Kairos.Backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Kairos.Backend.service.UsuarioService;

@RestController
@RequestMapping("/")
public class UsuarioController {
    private final UsuarioService service;
    public UsuarioControler(UsuarioService service){
        this.service=service;
    }

    
}
