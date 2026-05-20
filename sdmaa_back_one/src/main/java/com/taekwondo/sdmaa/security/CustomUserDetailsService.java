package com.taekwondo.sdmaa.security;

import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        return new User(
                utilisateur.getEmail(),
                utilisateur.getMotDePasseHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + utilisateur.getRole()))
        );
    }
}