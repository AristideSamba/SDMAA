package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.AnnonceCoursDTO;
import com.taekwondo.sdmaa.dto.NotificationCoursUtilisateurDTO;
import com.taekwondo.sdmaa.entity.Adhesion;
import com.taekwondo.sdmaa.entity.AnnonceCours;
import com.taekwondo.sdmaa.entity.Cours;
import com.taekwondo.sdmaa.entity.CoursAbonnement;
import com.taekwondo.sdmaa.entity.NotificationCoursUtilisateur;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.AnnonceCoursMapper;
import com.taekwondo.sdmaa.mapper.NotificationCoursUtilisateurMapper;
import com.taekwondo.sdmaa.repository.AdhesionRepository;
import com.taekwondo.sdmaa.repository.AnnonceCoursRepository;
import com.taekwondo.sdmaa.repository.CoursAbonnementRepository;
import com.taekwondo.sdmaa.repository.CoursRepository;
import com.taekwondo.sdmaa.repository.NotificationCoursUtilisateurRepository;
import com.taekwondo.sdmaa.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional
public class AnnonceCoursService {

    private final AnnonceCoursRepository annonceRepository;
    private final CoursRepository coursRepository;
    private final UtilisateurService utilisateurService;
    private final AdhesionRepository adhesionRepository;
    private final CoursAbonnementRepository coursAbonnementRepository;
    private final NotificationCoursUtilisateurRepository notificationRepository;
    private final NotificationCoursUtilisateurMapper notificationMapper;
    private final ExpoPushNotificationService expoPushNotificationService;
    private final NotificationService notificationService;

    /**
     * Crée une annonce pour un cours.
     */
    public AnnonceCours create(
            Long idCours,
            AnnonceCours annonce
    ) {
        Cours cours =
                coursRepository.findById(idCours)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Cours non trouvé"
                                )
                        );

        annonce.setCours(cours);
        annonce.setDateCreation(
                LocalDateTime.now()
        );

        AnnonceCours annonceEnregistree =
                annonceRepository.save(
                        annonce
                );

        List<Utilisateur> utilisateurs =
                adhesionRepository
                        .findUtilisateursActifsParCours(
                                idCours
                        );

        notificationService.notifierAnnonceCours(
                annonceEnregistree,
                utilisateurs
        );

        return annonceEnregistree;
    }



    /**
     * Retourne toutes les annonces.
     */
    @Transactional(readOnly = true)
    public List<AnnonceCoursDTO> getAll() {
        return annonceRepository.findAll()
                .stream()
                .map(AnnonceCoursMapper::toDTO)
                .toList();
    }

    /**
     * Retourne toutes les annonces liées à un cours.
     */
    @Transactional(readOnly = true)
    public List<AnnonceCoursDTO> getByCours(
            Long idCours
    ) {
        if (!coursRepository.existsById(idCours)) {
            throw new ResourceNotFoundException(
                    "Cours non trouvé"
            );
        }

        return annonceRepository
                .findByCoursIdCours(idCours)
                .stream()
                .map(AnnonceCoursMapper::toDTO)
                .toList();
    }

    /**
     * Modifie une annonce existante.
     */
    public AnnonceCours update(
            Long idAnnonce,
            AnnonceCours updated
    ) {
        AnnonceCours annonce =
                annonceRepository.findById(idAnnonce)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Annonce non trouvée"
                                )
                        );

        annonce.setDateConcernee(
                updated.getDateConcernee()
        );

        annonce.setJourConcerne(
                updated.getJourConcerne()
        );

        annonce.setTypeAnnonce(
                updated.getTypeAnnonce()
        );

        annonce.setMessage(
                updated.getMessage()
        );

        return annonceRepository.save(annonce);
    }

    /**
     * Supprime une annonce et toutes les notifications
     * associées à cette annonce.
     */
    @Transactional
    public void delete(Long idAnnonce) {
        AnnonceCours annonce =
                annonceRepository.findById(idAnnonce)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Annonce non trouvée"
                                )
                        );

        notificationRepository
                .deleteByAnnonceCoursIdAnnonce(idAnnonce);

        annonceRepository.delete(annonce);
    }

    /**
     * Retourne les notifications de cours
     * de l'utilisateur connecté.
     */
    public List<NotificationCoursUtilisateurDTO>
    getMesAnnonces() {

        Utilisateur utilisateur =
                utilisateurService
                        .getUtilisateurConnecte();

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

        Long abonnementId =
                adhesion
                        .getAbonnement()
                        .getIdAbonnement();

        List<Cours> coursUtilisateur =
                coursAbonnementRepository
                        .findByAbonnementIdAbonnement(
                                abonnementId
                        )
                        .stream()
                        .map(CoursAbonnement::getCours)
                        .distinct()
                        .toList();

        if (coursUtilisateur.isEmpty()) {
            return List.of();
        }

        List<AnnonceCours> annonces =
                annonceRepository
                        .findByCoursInOrderByDateCreationDesc(
                                coursUtilisateur
                        );

        creerNotificationsManquantes(
                utilisateur,
                annonces
        );

        return notificationRepository
                .findByUtilisateurIdUtilisateurOrderByAnnonceCoursDateCreationDesc(
                        utilisateur.getIdUtilisateur()
                )
                .stream()
                .map(notificationMapper::toDTO)
                .toList();
    }

    /**
     * Marque une notification comme lue
     * pour l'utilisateur connecté.
     */
    public NotificationCoursUtilisateurDTO
    marquerCommeLue(Long notificationId) {

        Utilisateur utilisateur =
                utilisateurService
                        .getUtilisateurConnecte();

        NotificationCoursUtilisateur notification =
                notificationRepository
                        .findNotificationUtilisateur(
                                notificationId,
                                utilisateur.getIdUtilisateur()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification non trouvée"
                                )
                        );

        if (!notification.isLu()) {
            notification.setLu(true);
            notification.setDateLecture(
                    LocalDateTime.now()
            );

            notification =
                    notificationRepository.save(
                            notification
                    );
        }

        return notificationMapper.toDTO(
                notification
        );
    }

    /**
     * Compte les notifications non lues
     * de l'utilisateur connecté.
     */
    @Transactional(readOnly = true)
    public long compterMesNotificationsNonLues() {

        Utilisateur utilisateur =
                utilisateurService
                        .getUtilisateurConnecte();

        return notificationRepository
                .countByUtilisateurIdUtilisateurAndLuFalse(
                        utilisateur.getIdUtilisateur()
                );
    }

    /**
     * Crée les notifications qui n'existent pas encore
     * pour l'utilisateur connecté.
     */
    private void creerNotificationsManquantes(
            Utilisateur utilisateur,
            List<AnnonceCours> annonces
    ) {
        List<NotificationCoursUtilisateur>
                notificationsACreer =
                new ArrayList<>();

        for (AnnonceCours annonce : annonces) {

            boolean existe =
                    notificationRepository
                            .existsByAnnonceCoursIdAnnonceAndUtilisateurIdUtilisateur(
                                    annonce.getIdAnnonce(),
                                    utilisateur.getIdUtilisateur()
                            );

            if (existe) {
                continue;
            }

            NotificationCoursUtilisateur notification =
                    new NotificationCoursUtilisateur();

            notification.setAnnonceCours(
                    annonce
            );

            notification.setUtilisateur(
                    utilisateur
            );

            notification.setLu(false);
            notification.setDateLecture(null);

            notificationsACreer.add(
                    notification
            );
        }

        if (!notificationsACreer.isEmpty()) {
            notificationRepository.saveAll(
                    notificationsACreer
            );
        }
    }
}

