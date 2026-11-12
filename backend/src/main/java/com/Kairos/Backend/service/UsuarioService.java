package com.Kairos.Backend.service;


import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.Kairos.Backend.model.Role;
import com.Kairos.Backend.model.Usuario;
import com.Kairos.Backend.repository.UsuarioRepository;



@Service
public class UsuarioService {
    private final PasswordEncoder passwordEncoder;
    private final UsuarioRepository repository;
    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder){
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }
    
    public Usuario cadastrarUsuario(String email, String senha, Role role){
        if (repository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email já cadastrado");
        }
        Usuario usuario = new Usuario();
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(senha));
        usuario.setRole(role);
        return repository.save(usuario);
    }

    public Usuario loginUsuario(String email, String senha){
        Usuario usuario = repository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Email ou senha incorretos, tente novamente"));
    if (!passwordEncoder.matches(senha, usuario.getSenhaHash())){
        throw new IllegalArgumentException("Email ou senha incorretos, tente novamente");
    }
    return usuario;

    }
}

