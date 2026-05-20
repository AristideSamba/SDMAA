package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.CoursDTO;
import com.taekwondo.sdmaa.entity.Adhesion;
import com.taekwondo.sdmaa.entity.Cours;
import com.taekwondo.sdmaa.entity.CoursAbonnement;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.exception.BusinessException;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.CoursMapper;
import com.taekwondo.sdmaa.repository.AdhesionRepository;
import com.taekwondo.sdmaa.repository.CoursAbonnementRepository;
import com.taekwondo.sdmaa.repository.CoursRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CoursService {

    private final CoursRepository coursRepository;
    private final UtilisateurService utilisateurService;
    private final AdhesionRepository adhesionRepository;
    private final CoursAbonnementRepository coursAbonnementRepository;

    public Cours create(Cours cours) {
        cours.setStatutCours("actif");
        return coursRepository.save(cours);
    }

    public List<CoursDTO> getAll() {
        return coursRepository.findAll()
                .stream()
                .map(CoursMapper::toDTO)
                .toList();
    }

    public CoursDTO getById(Long id) {
        return CoursMapper.toDTO(getEntityById(id));
    }

    public Cours getEntityById(Long id) {
        return coursRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cours non trouvé"));
    }

    public List<Cours> getCoursUtilisateurConnecte() {
        Utilisateur utilisateur = utilisateurService.getUtilisateurConnecte();

        Adhesion adhesion = adhesionRepository
                .findFirstByUtilisateurIdUtilisateurAndStatutAdhesionOrderByDateDebutDesc(
                        utilisateur.getIdUtilisateur(),
                        "validee"
                )
                .orElseThrow(() -> new ResourceNotFoundException("Aucune adhésion active trouvée"));

        return coursAbonnementRepository
                .findByAbonnementIdAbonnement(adhesion.getAbonnement().getIdAbonnement())
                .stream()
                .map(CoursAbonnement::getCours)
                .toList();
    }

    public CoursDTO update(Long id, Cours updated) {
        Cours cours = getEntityById(id);

        cours.setTitre(updated.getTitre());
        cours.setDescription(updated.getDescription());
        cours.setJour(updated.getJour());
        cours.setHeureDebut(updated.getHeureDebut());
        cours.setHeureFin(updated.getHeureFin());
        cours.setTrancheAge(updated.getTrancheAge());
        cours.setNiveau(updated.getNiveau());
        cours.setLieu(updated.getLieu());
        cours.setStatutCours(updated.getStatutCours());

        return CoursMapper.toDTO(coursRepository.save(cours));
    }

    public List<CoursDTO> getCoursUtilisateurConnecteDTO() {
        Utilisateur utilisateur = utilisateurService.getUtilisateurConnecte();

        Adhesion adhesion = adhesionRepository
                .findFirstByUtilisateurIdUtilisateurAndStatutAdhesionOrderByDateDebutDesc(
                        utilisateur.getIdUtilisateur(),
                        "validee"
                )
                .orElseThrow(() -> new ResourceNotFoundException("Aucune adhésion active trouvée"));

        return coursAbonnementRepository
                .findByAbonnementIdAbonnement(adhesion.getAbonnement().getIdAbonnement())
                .stream()
                .map(CoursAbonnement::getCours)
                .map(CoursMapper::toDTO)
                .toList();
    }

    public CoursDTO annuler(Long id) {
        Cours cours = getEntityById(id);

        if ("annule".equalsIgnoreCase(cours.getStatutCours())) {
            throw new BusinessException("Ce cours est déjà annulé");
        }

        cours.setStatutCours("annule");

        return CoursMapper.toDTO(coursRepository.save(cours));
    }

    public void suspendre(Long idCours) {
        Cours cours = getEntityById(idCours);

        cours.setStatutCours("suspendu");

        coursRepository.save(cours);
    }
}