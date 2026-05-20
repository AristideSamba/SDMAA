package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.AnnonceCoursDTO;
import com.taekwondo.sdmaa.entity.*;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.AnnonceCoursMapper;
import com.taekwondo.sdmaa.repository.AdhesionRepository;
import com.taekwondo.sdmaa.repository.AnnonceCoursRepository;
import com.taekwondo.sdmaa.repository.CoursAbonnementRepository;
import com.taekwondo.sdmaa.repository.CoursRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnonceCoursService {

    private final AnnonceCoursRepository annonceRepository;
    private final CoursRepository coursRepository;
    private final UtilisateurService utilisateurService;
    private final AdhesionRepository adhesionRepository;
    private final CoursAbonnementRepository coursAbonnementRepository;

    public AnnonceCours create(Long idCours, AnnonceCours annonce) {
        Cours cours = coursRepository.findById(idCours)
                .orElseThrow(() -> new ResourceNotFoundException("Cours non trouvé"));

        annonce.setCours(cours);
        annonce.setDateCreation(LocalDateTime.now());

        return annonceRepository.save(annonce);
    }

    public List<AnnonceCoursDTO> getAll() {
        return annonceRepository.findAll()
                .stream()
                .map(AnnonceCoursMapper::toDTO)
                .toList();
    }

    public List<AnnonceCoursDTO> getByCours(Long idCours) {
        return annonceRepository.findByCoursIdCours(idCours)
                .stream()
                .map(AnnonceCoursMapper::toDTO)
                .toList();
    }

    public void delete(Long id) {
        AnnonceCours annonce = annonceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Annonce non trouvée"));

        annonceRepository.delete(annonce);
    }

    public AnnonceCours update(Long id, AnnonceCours updated) {
        AnnonceCours annonce = annonceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Annonce non trouvée"));

        annonce.setDateConcernee(updated.getDateConcernee());
        annonce.setJourConcerne(updated.getJourConcerne());
        annonce.setTypeAnnonce(updated.getTypeAnnonce());
        annonce.setMessage(updated.getMessage());

        return annonceRepository.save(annonce);
    }
    public List<AnnonceCoursDTO> getMesAnnonces() {
        Utilisateur utilisateur = utilisateurService.getUtilisateurConnecte();

        Adhesion adhesion = adhesionRepository
                .findFirstByUtilisateurIdUtilisateurAndStatutAdhesionOrderByDateDebutDesc(
                        utilisateur.getIdUtilisateur(),
                        "validee"
                )
                .orElseThrow(() -> new ResourceNotFoundException("Aucune adhésion active trouvée"));

        List<Cours> coursUtilisateur = coursAbonnementRepository
                .findByAbonnementIdAbonnement(adhesion.getAbonnement().getIdAbonnement())
                .stream()
                .map(CoursAbonnement::getCours)
                .toList();

        return annonceRepository.findByCoursIn(coursUtilisateur)
                .stream()
                .map(AnnonceCoursMapper::toDTO)
                .toList();
    }
}