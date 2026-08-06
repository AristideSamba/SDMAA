package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.entity.Activite;
import com.taekwondo.sdmaa.entity.AnnonceCours;
import com.taekwondo.sdmaa.entity.NotificationCoursUtilisateur;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.repository.AdhesionRepository;
import com.taekwondo.sdmaa.repository.NotificationCoursUtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationCoursUtilisateurRepository
            notificationCoursRepository;

    private final ExpoPushNotificationService
            expoPushNotificationService;

    private final AdhesionRepository adhesionRepository;

    /**
     * Crée les notifications internes et envoie
     * une notification push aux utilisateurs concernés
     * par une annonce de cours.
     */
    @Transactional
    public void notifierAnnonceCours(
            AnnonceCours annonce,
            List<Utilisateur> utilisateurs
    ) {
        if (annonce == null) {
            System.out.println(
                    "Notification ignorée : annonce absente."
            );

            return;
        }

        if (
                utilisateurs == null
                        || utilisateurs.isEmpty()
        ) {
            System.out.println(
                    "Aucun utilisateur concerné par l’annonce "
                            + annonce.getIdAnnonce()
            );

            return;
        }

        List<NotificationCoursUtilisateur>
                notificationsACreer =
                new ArrayList<>();

        for (Utilisateur utilisateur : utilisateurs) {
            if (utilisateur == null) {
                continue;
            }

            creerNotificationInterneSiAbsente(
                    annonce,
                    utilisateur,
                    notificationsACreer
            );

            envoyerPushAnnonceCours(
                    annonce,
                    utilisateur
            );
        }

        if (!notificationsACreer.isEmpty()) {
            notificationCoursRepository.saveAll(
                    notificationsACreer
            );

            System.out.println(
                    notificationsACreer.size()
                            + " notification(s) interne(s) créée(s) "
                            + "pour l’annonce "
                            + annonce.getIdAnnonce()
            );
        }
    }

    /**
     * Crée une notification interne seulement
     * lorsqu’elle n’existe pas déjà.
     */
    private void creerNotificationInterneSiAbsente(
            AnnonceCours annonce,
            Utilisateur utilisateur,
            List<NotificationCoursUtilisateur>
                    notificationsACreer
    ) {
        boolean existe =
                notificationCoursRepository
                        .existsByAnnonceCoursIdAnnonceAndUtilisateurIdUtilisateur(
                                annonce.getIdAnnonce(),
                                utilisateur.getIdUtilisateur()
                        );

        if (existe) {
            return;
        }

        NotificationCoursUtilisateur notification =
                new NotificationCoursUtilisateur();

        notification.setAnnonceCours(annonce);
        notification.setUtilisateur(utilisateur);
        notification.setLu(false);
        notification.setDateLecture(null);

        notificationsACreer.add(notification);
    }

    /**
     * Envoie la notification Expo au téléphone
     * lorsque l’utilisateur possède un token valide.
     */
    private void envoyerPushAnnonceCours(
            AnnonceCours annonce,
            Utilisateur utilisateur
    ) {
        String expoPushToken =
                utilisateur.getExpoPushToken();

        if (
                expoPushToken == null
                        || expoPushToken.isBlank()
        ) {
            System.out.println(
                    "Aucun token Expo pour l’utilisateur "
                            + utilisateur.getIdUtilisateur()
            );

            return;
        }

        Map<String, Object> data =
                new HashMap<>();

        data.put(
                "type",
                "ANNONCE_COURS"
        );

        data.put(
                "annonceId",
                annonce.getIdAnnonce()
        );

        if (annonce.getCours() != null) {
            data.put(
                    "coursId",
                    annonce.getCours()
                            .getIdCours()
            );
        }

        expoPushNotificationService
                .envoyerNotification(
                        expoPushToken,
                        construireTitreAnnonce(
                                annonce
                        ),
                        construireMessageAnnonce(
                                annonce
                        ),
                        data
                );
    }

    /**
     * Construit le titre affiché dans
     * la notification Android.
     */
    private String construireTitreAnnonce(
            AnnonceCours annonce
    ) {
        if (
                annonce.getTypeAnnonce() == null
                        || annonce.getTypeAnnonce()
                        .isBlank()
        ) {
            return "Nouvelle annonce de cours";
        }

        return switch (
                annonce.getTypeAnnonce()
                        .trim()
                        .toUpperCase()
                ) {
            case "ANNULATION" ->
                    "Cours annulé";

            case "REPORT" ->
                    "Cours reporté";

            case "INFORMATION" ->
                    "Information du club";

            default ->
                    "Nouvelle annonce de cours";
        };
    }

    /**
     * Construit le contenu de la notification.
     */
    private String construireMessageAnnonce(
            AnnonceCours annonce
    ) {
        if (
                annonce.getMessage() != null
                        && !annonce.getMessage()
                        .isBlank()
        ) {
            return annonce.getMessage().trim();
        }

        if (
                annonce.getCours() != null
                        && annonce.getCours()
                        .getTitre() != null
        ) {
            return "Une nouvelle information concerne le cours "
                    + annonce.getCours().getTitre()
                    + ".";
        }

        return "Une nouvelle information de cours est disponible.";
    }

    /**
     * Notification nouvelle activité
     */

    @Transactional
    public void notifierNouvelleActivite(
            Activite activite
    ) {
        if (activite == null) {
            return;
        }

        List<Utilisateur> utilisateurs =
                adhesionRepository
                        .findUtilisateursAvecAdhesionValidee();

        if (
                utilisateurs == null
                        || utilisateurs.isEmpty()
        ) {
            System.out.println(
                    "Aucun utilisateur à notifier pour l’activité "
                            + activite.getIdActivite()
            );

            return;
        }

        for (Utilisateur utilisateur : utilisateurs) {
            if (utilisateur == null) {
                continue;
            }

            String expoPushToken =
                    utilisateur.getExpoPushToken();

            if (
                    expoPushToken == null
                            || expoPushToken.isBlank()
            ) {
                continue;
            }

            Map<String, Object> data =
                    new HashMap<>();

            data.put(
                    "type",
                    "ACTIVITE"
            );

            data.put(
                    "activiteId",
                    activite.getIdActivite()
            );

            expoPushNotificationService
                    .envoyerNotification(
                            expoPushToken,
                            "Nouvelle activité",
                            construireMessageNouvelleActivite(
                                    activite
                            ),
                            data
                    );
        }
    }

    private String construireMessageNouvelleActivite(
            Activite activite
    ) {
        String titre =
                activite.getTitre();

        if (
                titre != null
                        && !titre.isBlank()
        ) {
            return titre.trim();
        }

        return "Une nouvelle activité est disponible.";
    }
}