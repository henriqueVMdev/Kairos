package com.Kairos.Backend.service;


import java.util.Optional;

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

    public Usuario buscaEmailUsuario(String email){
        Optional<Usuario> buscaEmail = repository.findByEmail(email);
        Usuario emailUsuario = buscaEmail.orElseThrow();
        return emailUsuario;
    }
    public Usuario cadastrarUsuario(String email, String senha, Role role){
        if (repository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email já cadastrado");
        }
        Usuario usuario = new Usuario();
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(senha));
        usuario.setRole(role);
        return repository.save(usuario);
    }
  
}
