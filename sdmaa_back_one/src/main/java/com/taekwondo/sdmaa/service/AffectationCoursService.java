package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.entity.AffectationCours;
import com.taekwondo.sdmaa.entity.Cours;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.exception.BusinessException;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.repository.AffectationCoursRepository;
import com.taekwondo.sdmaa.repository.CoursRepository;
import com.taekwondo.sdmaa.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AffectationCoursService {

    private final AffectationCoursRepository affectationRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final CoursRepository coursRepository;
    private final UtilisateurService utilisateurService;

    public AffectationCours assignerCoach(Long idCours, Long idCoach) {
        if (affectationRepository.existsByCoachIdUtilisateurAndCoursIdCours(idCoach, idCours)) {
            throw new BusinessException("Ce coach est déjà affecté à ce cours");
        }

        Utilisateur coach = utilisateurRepository.findById(idCoach)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        if (!"COACH".equals(coach.getRole())) {
            throw new BusinessException("L'utilisateur sélectionné n'est pas un coach");
        }

        Cours cours = coursRepository.findById(idCours)
                .orElseThrow(() -> new ResourceNotFoundException("Cours non trouvé"));

        if ("annule".equals(cours.getStatutCours())) {
            throw new BusinessException("Impossible d'affecter un coach à un cours annulé");
        }

        AffectationCours affectation = AffectationCours.builder()
                .coach(coach)
                .cours(cours)
                .statutAffectation("en_attente")
                .dateAffectation(LocalDateTime.now())
                .build();

        return affectationRepository.save(affectation);
    }

    public List<AffectationCours> getAll() {
        return affectationRepository.findAll();
    }

    public AffectationCours getById(Long id) {
        return affectationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Affectation de cours non trouvée"));
    }

    public AffectationCours confirmer(Long id) {
        AffectationCours affectation = getById(id);

        Utilisateur coachConnecte = utilisateurService.getUtilisateurConnecte();

        if (!affectation.getCoach().getIdUtilisateur().equals(coachConnecte.getIdUtilisateur())) {
            throw new BusinessException("Vous ne pouvez confirmer que vos propres cours");
        }

        if (!"en_attente".equals(affectation.getStatutAffectation())) {
            throw new BusinessException("Cette affectation a déjà été traitée");
        }

        affectation.setStatutAffectation("confirmee");
        affectation.setDateConfirmation(LocalDateTime.now());

        return affectationRepository.save(affectation);
    }

    public AffectationCours refuser(Long id, String commentaire) {
        AffectationCours affectation = getById(id);

        Utilisateur coachConnecte = utilisateurService.getUtilisateurConnecte();

        if (!affectation.getCoach().getIdUtilisateur().equals(coachConnecte.getIdUtilisateur())) {
            throw new BusinessException("Vous ne pouvez refuser que vos propres cours");
        }

        if (!"en_attente".equals(affectation.getStatutAffectation())) {
            throw new BusinessException("Cette affectation a déjà été traitée");
        }

        affectation.setStatutAffectation("refusee");
        affectation.setDateConfirmation(LocalDateTime.now());
        affectation.setCommentaire(commentaire);

        return affectationRepository.save(affectation);
    }

    public void delete(Long id) {
        AffectationCours affectation = getById(id);
        affectationRepository.delete(affectation);
    }
}
