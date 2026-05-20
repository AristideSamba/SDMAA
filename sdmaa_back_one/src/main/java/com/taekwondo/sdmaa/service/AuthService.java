package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.auth.AuthResponse;
import com.taekwondo.sdmaa.dto.auth.LoginRequest;
import com.taekwondo.sdmaa.dto.auth.RegisterRequest;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.exception.BusinessException;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.repository.UtilisateurRepository;
import com.taekwondo.sdmaa.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.taekwondo.sdmaa.dto.auth.RegisterCompleteRequest;
import com.taekwondo.sdmaa.entity.Abonnement;
import com.taekwondo.sdmaa.entity.Adhesion;
import com.taekwondo.sdmaa.repository.AbonnementRepository;
import com.taekwondo.sdmaa.repository.AdhesionRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AbonnementRepository abonnementRepository;
    private final AdhesionRepository adhesionRepository;

    public AuthResponse register(RegisterRequest request) {
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Un compte existe déjà avec cet email");
        }

        Utilisateur utilisateur = Utilisateur.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .motDePasseHash(passwordEncoder.encode(request.getMotDePasse()))
                .dateNaissance(request.getDateNaissance())
                .telephone(request.getTelephone())
                .adresse(request.getAdresse())
                .role("ADHERENT")
                .statutCompte("en_attente")
                .dateCreationCompte(LocalDateTime.now())
                .build();

        utilisateurRepository.save(utilisateur);

        String token = jwtService.generateToken(utilisateur.getEmail(), utilisateur.getRole());

        return AuthResponse.builder()
                .token(token)
                .idUtilisateur(utilisateur.getIdUtilisateur())
                .email(utilisateur.getEmail())
                .role(utilisateur.getRole())
                .statutCompte(utilisateur.getStatutCompte())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getMotDePasse()
                )
        );

        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Identifiants invalides"));

        if (!"actif".equals(utilisateur.getStatutCompte())) {
            throw new BusinessException("Votre compte est en attente de validation par le club");
        }

        String token = jwtService.generateToken(
                utilisateur.getEmail(),
                utilisateur.getRole()
        );

        return AuthResponse.builder()
                .token(token)
                .idUtilisateur(utilisateur.getIdUtilisateur())
                .email(utilisateur.getEmail())
                .role(utilisateur.getRole())
                .statutCompte(utilisateur.getStatutCompte())
                .build();
    }

    public AuthResponse registerComplet(RegisterCompleteRequest request) {

        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Un compte existe déjà avec cet email");
        }

        Abonnement abonnement = abonnementRepository.findById(request.getIdAbonnement())
                .orElseThrow(() -> new ResourceNotFoundException("Abonnement non trouvé"));

        Utilisateur utilisateur = Utilisateur.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .motDePasseHash(passwordEncoder.encode(request.getMotDePasse()))
                .dateNaissance(request.getDateNaissance())
                .telephone(request.getTelephone())
                .adresse(request.getAdresse())
                .role("ADHERENT")
                .statutCompte("en_attente")
                .dateCreationCompte(LocalDateTime.now())
                .build();

        utilisateurRepository.save(utilisateur);

        Adhesion adhesion = Adhesion.builder()
                .utilisateur(utilisateur)
                .abonnement(abonnement)
                .dateDemande(LocalDate.now())
                .statutAdhesion("en_attente")
                .statutPaiement("en_attente")
                .modePaiement("especes")
                .build();

        adhesionRepository.save(adhesion);

        String token = jwtService.generateToken(
                utilisateur.getEmail(),
                utilisateur.getRole()
        );

        return AuthResponse.builder()
                .token(token)
                .idUtilisateur(utilisateur.getIdUtilisateur())
                .email(utilisateur.getEmail())
                .role(utilisateur.getRole())
                .statutCompte(utilisateur.getStatutCompte())
                .build();
    }
}
