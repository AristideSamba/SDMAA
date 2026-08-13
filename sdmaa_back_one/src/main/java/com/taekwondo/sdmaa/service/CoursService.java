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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CoursService {

    private final CoursRepository coursRepository;
    private final UtilisateurService utilisateurService;
    private final AdhesionRepository adhesionRepository;
    private final CoursAbonnementRepository coursAbonnementRepository;

    /**
     * ADMIN :
     * créer un cours.
     */
    @Transactional
    public Cours create(Cours cours) {
        cours.setStatutCours("actif");

        return coursRepository.save(cours);
    }

    /**
     * Récupérer tous les cours.
     *
     * La transaction reste ouverte pendant
     * le mapping DTO afin que les relations
     * LAZY nécessaires au mapper puissent
     * être chargées correctement.
     */
    @Transactional(readOnly = true)
    public List<CoursDTO> getAll() {
        return coursRepository.findAll()
                .stream()
                .map(CoursMapper::toDTO)
                .toList();
    }

    /**
     * Récupérer un cours par son identifiant.
     */
    @Transactional(readOnly = true)
    public CoursDTO getById(Long id) {
        Cours cours = coursRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cours non trouvé"
                        )
                );

        return CoursMapper.toDTO(cours);
    }

    /**
     * Récupérer directement l'entité Cours.
     *
     * Attention :
     * une entité retournée par cette méthode
     * ne doit pas être utilisée plus tard pour
     * accéder à des relations LAZY en dehors
     * d'une transaction.
     */
    @Transactional(readOnly = true)
    public Cours getEntityById(Long id) {
        return coursRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cours non trouvé"
                        )
                );
    }

    /**
     * Récupérer les cours correspondant
     * à l'abonnement de l'utilisateur connecté.
     *
     * Cette méthode retourne les entités.
     * La transaction est nécessaire car
     * CoursAbonnement -> Cours peut également
     * utiliser un chargement LAZY.
     */
    @Transactional(readOnly = true)
    public List<Cours> getCoursUtilisateurConnecte() {

        Utilisateur utilisateur =
                utilisateurService.getUtilisateurConnecte();

        Adhesion adhesion =
                adhesionRepository
                        .findFirstByUtilisateurIdUtilisateurAndStatutAdhesionOrderByDateDebutDesc(
                                utilisateur.getIdUtilisateur(),
                                "validee"
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Aucune adhésion active trouvée"
                                )
                        );

        Long idAbonnement =
                adhesion.getAbonnement()
                        .getIdAbonnement();

        return coursAbonnementRepository
                .findByAbonnementIdAbonnement(
                        idAbonnement
                )
                .stream()
                .map(CoursAbonnement::getCours)
                .toList();
    }

    /**
     * ADHERENT :
     * récupérer les cours de l'utilisateur
     * connecté sous forme de DTO.
     *
     * C'est ici que la correction du
     * LazyInitializationException est
     * particulièrement importante.
     */
    @Transactional(readOnly = true)
    public List<CoursDTO> getCoursUtilisateurConnecteDTO() {

        Utilisateur utilisateur =
                utilisateurService.getUtilisateurConnecte();

        Adhesion adhesion =
                adhesionRepository
                        .findFirstByUtilisateurIdUtilisateurAndStatutAdhesionOrderByDateDebutDesc(
                                utilisateur.getIdUtilisateur(),
                                "validee"
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Aucune adhésion active trouvée"
                                )
                        );

        Long idAbonnement =
                adhesion.getAbonnement()
                        .getIdAbonnement();

        return coursAbonnementRepository
                .findByAbonnementIdAbonnement(
                        idAbonnement
                )
                .stream()

                /*
                 * Le Cours est récupéré alors que
                 * la transaction Hibernate est
                 * toujours ouverte.
                 */
                .map(CoursAbonnement::getCours)

                /*
                 * Le mapping DTO est également fait
                 * DANS la transaction.
                 *
                 * Si CoursMapper accède à
                 * cours.getAffectationsCours(),
                 * Hibernate peut donc initialiser
                 * cette collection LAZY.
                 */
                .map(CoursMapper::toDTO)

                .toList();
    }

    /**
     * ADMIN :
     * modifier un cours.
     */
    @Transactional
    public CoursDTO update(
            Long id,
            Cours updated
    ) {
        Cours cours =
                coursRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Cours non trouvé"
                                )
                        );

        cours.setTitre(
                updated.getTitre()
        );

        cours.setDescription(
                updated.getDescription()
        );

        cours.setJour(
                updated.getJour()
        );

        cours.setHeureDebut(
                updated.getHeureDebut()
        );

        cours.setHeureFin(
                updated.getHeureFin()
        );

        cours.setTrancheAge(
                updated.getTrancheAge()
        );

        cours.setNiveau(
                updated.getNiveau()
        );

        cours.setLieu(
                updated.getLieu()
        );

        cours.setStatutCours(
                updated.getStatutCours()
        );

        Cours saved =
                coursRepository.save(cours);

        return CoursMapper.toDTO(
                saved
        );
    }

    /**
     * ADMIN :
     * annuler un cours.
     */
    @Transactional
    public CoursDTO annuler(Long id) {

        Cours cours =
                coursRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Cours non trouvé"
                                )
                        );

        if (
                "annule".equalsIgnoreCase(
                        cours.getStatutCours()
                )
        ) {
            throw new BusinessException(
                    "Ce cours est déjà annulé"
            );
        }

        cours.setStatutCours(
                "annule"
        );

        Cours saved =
                coursRepository.save(cours);

        return CoursMapper.toDTO(
                saved
        );
    }

    /**
     * ADMIN :
     * suspendre un cours.
     */
    @Transactional
    public void suspendre(Long idCours) {

        Cours cours =
                coursRepository.findById(idCours)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Cours non trouvé"
                                )
                        );

        if (
                "suspendu".equalsIgnoreCase(
                        cours.getStatutCours()
                )
        ) {
            throw new BusinessException(
                    "Ce cours est déjà suspendu"
            );
        }

        cours.setStatutCours(
                "suspendu"
        );

        coursRepository.save(cours);
    }
}