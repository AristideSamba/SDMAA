package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.entity.Abonnement;
import com.taekwondo.sdmaa.entity.Adhesion;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.exception.BusinessException;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.repository.AbonnementRepository;
import com.taekwondo.sdmaa.repository.AdhesionRepository;
import com.taekwondo.sdmaa.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdhesionService {

    private final AdhesionRepository adhesionRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final AbonnementRepository abonnementRepository;
    private final UtilisateurService utilisateurService;

    public Adhesion create(Long idUtilisateur, Long idAbonnement) {
        Utilisateur utilisateur = utilisateurRepository.findById(idUtilisateur)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Abonnement abonnement = abonnementRepository.findById(idAbonnement)
                .orElseThrow(() -> new ResourceNotFoundException("Abonnement non trouvé"));

        Adhesion adhesion = Adhesion.builder()
                .utilisateur(utilisateur)
                .abonnement(abonnement)
                .dateDemande(LocalDate.now())
                .statutAdhesion("en_attente")
                .statutPaiement("en_attente")
                .modePaiement("especes")
                .build();

        return adhesionRepository.save(adhesion);
    }

    public List<Adhesion> getAll() {
        return adhesionRepository.findAll();
    }

    public Adhesion getById(Long id) {
        return adhesionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Adhésion non trouvée"));
    }

    public List<Adhesion> getMyAdhesions() {
        Utilisateur utilisateur = utilisateurService.getUtilisateurConnecte();
        return adhesionRepository.findByUtilisateurIdUtilisateur(utilisateur.getIdUtilisateur());
    }

    public List<Adhesion> getByUtilisateur(Long idUtilisateur) {
        return adhesionRepository.findByUtilisateurIdUtilisateur(idUtilisateur);
    }

    public Adhesion valider(Long id) {
        Adhesion adhesion = getById(id);

        if (!"en_attente".equals(adhesion.getStatutAdhesion())) {
            throw new BusinessException("Cette adhésion a déjà été traitée");
        }

        adhesion.setStatutAdhesion("validee");
        adhesion.setStatutPaiement("paye");
        adhesion.setDateValidationAdmin(LocalDate.now());
        adhesion.setDateDebut(LocalDate.now());

        if (adhesion.getDateFin() == null) {
            adhesion.setDateFin(LocalDate.now().plusYears(1));
        }

        Utilisateur utilisateur = adhesion.getUtilisateur();
        utilisateur.setStatutCompte("actif");

        utilisateurRepository.save(utilisateur);

        return adhesionRepository.save(adhesion);
    }

    public void delete(Long id) {
        Adhesion adhesion = getById(id);
        adhesionRepository.delete(adhesion);
    }

    public Adhesion createForCurrentUser(Long idAbonnement) {
        Utilisateur utilisateur = utilisateurService.getUtilisateurConnecte();

        Abonnement abonnement = abonnementRepository.findById(idAbonnement)
                .orElseThrow(() -> new ResourceNotFoundException("Abonnement non trouvé"));

        Adhesion adhesion = Adhesion.builder()
                .utilisateur(utilisateur)
                .abonnement(abonnement)
                .dateDemande(LocalDate.now())
                .statutAdhesion("en_attente")
                .statutPaiement("en_attente")
                .modePaiement("especes")
                .build();

        return adhesionRepository.save(adhesion);
    }
}