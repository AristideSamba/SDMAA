package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.ChangePasswordRequest;
import com.taekwondo.sdmaa.dto.UtilisateurDTO;
import com.taekwondo.sdmaa.entity.Ceinture;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.UtilisateurMapper;
import com.taekwondo.sdmaa.repository.CeintureRepository;
import com.taekwondo.sdmaa.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.taekwondo.sdmaa.exception.BusinessException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UtilisateurService {

    private final UtilisateurRepository repository;
    private final CeintureRepository ceintureRepository;
    private final PasswordEncoder passwordEncoder;

    public Utilisateur create(Utilisateur user) {
        user.setStatutCompte("en_attente");
        user.setRole("ADHERENT");

        if (user.getMotDePasseHash() != null) {
            user.setMotDePasseHash(passwordEncoder.encode(user.getMotDePasseHash()));
        }

        return repository.save(user);
    }

    public List<UtilisateurDTO> getAll() {
        return repository.findAll()
                .stream()
                .map(UtilisateurMapper::toDTO)
                .toList();
    }

    public UtilisateurDTO getById(Long id) {
        return UtilisateurMapper.toDTO(getEntityById(id));
    }

    public Utilisateur getEntityById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
    }

    public Utilisateur update(Long id, Utilisateur updatedUser) {
        Utilisateur user = getEntityById(id);

        user.setNom(updatedUser.getNom());
        user.setPrenom(updatedUser.getPrenom());
        user.setEmail(updatedUser.getEmail());
        user.setTelephone(updatedUser.getTelephone());
        user.setAdresse(updatedUser.getAdresse());

        return repository.save(user);
    }

    public void suspendre(Long id) {
        Utilisateur user = getEntityById(id);

        user.setStatutCompte("suspendu");

        repository.save(user);
    }

    public Utilisateur getUtilisateurConnecte() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return repository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur connecté non trouvé"));
    }

    public UtilisateurDTO getMe() {
        return UtilisateurMapper.toDTO(getUtilisateurConnecte());
    }

    public UtilisateurDTO assignerCeinture(Long idUtilisateur, Long idCeinture) {
        Utilisateur utilisateur = getEntityById(idUtilisateur);

        Ceinture ceinture = ceintureRepository.findById(idCeinture)
                .orElseThrow(() -> new ResourceNotFoundException("Ceinture non trouvée"));

        utilisateur.setCeinture(ceinture);

        Utilisateur saved = repository.save(utilisateur);

        return UtilisateurMapper.toDTO(saved);
    }

    public UtilisateurDTO updateMe(Utilisateur updatedUser) {
        Utilisateur user = getUtilisateurConnecte();

        user.setEmail(updatedUser.getEmail());
        user.setAdresse(updatedUser.getAdresse());
        user.setTelephone(updatedUser.getTelephone());

        return UtilisateurMapper.toDTO(repository.save(user));
    }

    //Password handeling
    public void changerMotDePasse(ChangePasswordRequest request) {
        Utilisateur utilisateur = getUtilisateurConnecte();

        if (!passwordEncoder.matches(
                request.getAncienMotDePasse(),
                utilisateur.getMotDePasseHash()
        )) {
            throw new BusinessException("Ancien mot de passe incorrect");
        }

        if (request.getNouveauMotDePasse() == null || request.getNouveauMotDePasse().length() < 13) {
            throw new BusinessException("Le nouveau mot de passe doit contenir au moins 13 caractères");
        }

        if (!request.getNouveauMotDePasse().equals(request.getConfirmationMotDePasse())) {
            throw new BusinessException("Les mots de passe ne correspondent pas");
        }

        if (passwordEncoder.matches(request.getNouveauMotDePasse(), utilisateur.getMotDePasseHash())) {
            throw new BusinessException("Le nouveau mot de passe doit être différent de l'ancien");
        }

        utilisateur.setMotDePasseHash(passwordEncoder.encode(request.getNouveauMotDePasse()));

        repository.save(utilisateur);
    }

    public UtilisateurDTO updateProfilByAdmin(Long id, Utilisateur updatedUser) {
        Utilisateur user = getEntityById(id);

        user.setNom(updatedUser.getNom());
        user.setPrenom(updatedUser.getPrenom());
        user.setEmail(updatedUser.getEmail());
        user.setTelephone(updatedUser.getTelephone());
        user.setAdresse(updatedUser.getAdresse());

        return UtilisateurMapper.toDTO(repository.save(user));
    }

    public UtilisateurDTO updateRole(Long id, String role) {
        Utilisateur user = getEntityById(id);

        String normalizedRole = role.toUpperCase();

        if (!List.of("ADHERENT", "COACH", "ADMIN").contains(normalizedRole)) {
            throw new BusinessException("Rôle invalide");
        }

        user.setRole(normalizedRole);

        return UtilisateurMapper.toDTO(repository.save(user));
    }

    public UtilisateurDTO updateStatutCompte(Long id, String statut) {
        Utilisateur user = getEntityById(id);

        String normalizedStatut = statut.toLowerCase();

        if (!List.of("en_attente", "actif", "suspendu", "refuse").contains(normalizedStatut)) {
            throw new BusinessException("Statut de compte invalide");
        }

        user.setStatutCompte(normalizedStatut);

        return UtilisateurMapper.toDTO(repository.save(user));
    }
}