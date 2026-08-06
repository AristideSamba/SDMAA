package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.entity.Activite;
import com.taekwondo.sdmaa.entity.AnnonceCours;
import com.taekwondo.sdmaa.entity.InscriptionActivite;
import com.taekwondo.sdmaa.entity.NotificationCoursUtilisateur;
import com.taekwondo.sdmaa.entity.NotificationUtilisateur;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.enums.TypeNotification;
import com.taekwondo.sdmaa.repository.AdhesionRepository;
import com.taekwondo.sdmaa.repository.NotificationCoursUtilisateurRepository;
import com.taekwondo.sdmaa.repository.NotificationUtilisateurRepository;
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

    /**
     * Ancien repository conservé temporairement
     * pendant la migration.
     */
    private final NotificationCoursUtilisateurRepository
            notificationCoursRepository;

    /**
     * Nouveau repository générique.
     */
    private final NotificationUtilisateurRepository
            notificationUtilisateurRepository;

    private final ExpoPushNotificationService
            expoPushNotificationService;

    private final AdhesionRepository
            adhesionRepository;

    /* ====================================================================== */
    /*                         ANNONCES DE COURS                               */
    /* ====================================================================== */

    /**
     * Crée les notifications internes et envoie
     * les notifications push pour une annonce de cours.
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

        /*
         * Anciennes notifications conservées
         * temporairement.
         */
        List<NotificationCoursUtilisateur>
                anciennesNotificationsACreer =
                new ArrayList<>();

        for (Utilisateur utilisateur : utilisateurs) {
            if (
                    utilisateur == null
                            || utilisateur.getIdUtilisateur() == null
            ) {
                continue;
            }

            /*
             * Ancien système.
             */
            creerAncienneNotificationAnnonceSiAbsente(
                    annonce,
                    utilisateur,
                    anciennesNotificationsACreer
            );

            /*
             * Nouveau système générique.
             */
            creerNouvelleNotificationAnnonceSiAbsente(
                    annonce,
                    utilisateur
            );

            envoyerPushAnnonceCours(
                    annonce,
                    utilisateur
            );
        }

        if (!anciennesNotificationsACreer.isEmpty()) {
            notificationCoursRepository.saveAll(
                    anciennesNotificationsACreer
            );

            System.out.println(
                    anciennesNotificationsACreer.size()
                            + " ancienne(s) notification(s) créée(s) "
                            + "pour l’annonce "
                            + annonce.getIdAnnonce()
            );
        }
    }

    /**
     * Crée l’ancienne notification liée directement
     * à AnnonceCours.
     *
     * Cette méthode sera supprimée à la fin
     * de la migration.
     */
    private void creerAncienneNotificationAnnonceSiAbsente(
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
     * Crée une annonce dans la nouvelle table
     * notification_utilisateur.
     */
    private void creerNouvelleNotificationAnnonceSiAbsente(
            AnnonceCours annonce,
            Utilisateur utilisateur
    ) {
        Long annonceId =
                annonce.getIdAnnonce();

        if (
                annonceId == null
                        || utilisateur.getIdUtilisateur() == null
        ) {
            return;
        }

        boolean existe =
                notificationUtilisateurRepository
                        .existsByUtilisateurIdUtilisateurAndTypeNotificationAndAnnonceId(
                                utilisateur.getIdUtilisateur(),
                                TypeNotification.ANNONCE_COURS,
                                annonceId
                        );

        if (existe) {
            return;
        }

        Long coursId = null;
        String titreCible = null;

        if (annonce.getCours() != null) {
            coursId =
                    annonce.getCours()
                            .getIdCours();

            titreCible =
                    texteOuNull(
                            annonce.getCours()
                                    .getTitre()
                    );
        }

        NotificationUtilisateur notification =
                NotificationUtilisateur.builder()
                        .utilisateur(utilisateur)
                        .typeNotification(
                                TypeNotification.ANNONCE_COURS
                        )
                        .titre(
                                construireTitreAnnonce(
                                        annonce
                                )
                        )
                        .message(
                                construireMessageAnnonce(
                                        annonce
                                )
                        )
                        .titreCible(titreCible)
                        .annonceId(annonceId)
                        .coursId(coursId)
                        .estLue(false)
                        .dateLecture(null)
                        .build();

        notificationUtilisateurRepository.save(
                notification
        );
    }

    /**
     * Envoie le push d’une annonce de cours.
     */
    private void envoyerPushAnnonceCours(
            AnnonceCours annonce,
            Utilisateur utilisateur
    ) {
        String expoPushToken =
                getExpoPushToken(utilisateur);

        if (expoPushToken == null) {
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
                        && !annonce.getCours()
                        .getTitre()
                        .isBlank()
        ) {
            return "Une nouvelle information concerne le cours "
                    + annonce.getCours()
                    .getTitre()
                    .trim()
                    + ".";
        }

        return "Une nouvelle information de cours est disponible.";
    }

    /* ====================================================================== */
    /*                         NOUVELLE ACTIVITÉ                               */
    /* ====================================================================== */

    /**
     * Notifie tous les adhérents validés
     * lorsqu’une activité est publiée.
     */
    @Transactional
    public void notifierNouvelleActivite(
            Activite activite
    ) {
        if (
                activite == null
                        || activite.getIdActivite() == null
        ) {
            System.out.println(
                    "Notification ignorée : activité absente."
            );

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
            if (
                    utilisateur == null
                            || utilisateur.getIdUtilisateur() == null
            ) {
                continue;
            }

            creerNotificationNouvelleActiviteSiAbsente(
                    activite,
                    utilisateur
            );

            envoyerPushNouvelleActivite(
                    activite,
                    utilisateur
            );
        }
    }

    private void creerNotificationNouvelleActiviteSiAbsente(
            Activite activite,
            Utilisateur utilisateur
    ) {
        boolean existe =
                notificationUtilisateurRepository
                        .existsByUtilisateurIdUtilisateurAndTypeNotificationAndActiviteId(
                                utilisateur.getIdUtilisateur(),
                                TypeNotification.NOUVELLE_ACTIVITE,
                                activite.getIdActivite()
                        );

        if (existe) {
            return;
        }

        String message =
                construireMessageNouvelleActivite(
                        activite
                );

        NotificationUtilisateur notification =
                NotificationUtilisateur.builder()
                        .utilisateur(utilisateur)
                        .typeNotification(
                                TypeNotification.NOUVELLE_ACTIVITE
                        )
                        .titre("Nouvelle activité")
                        .message(message)
                        .titreCible(
                                getTitreActivite(
                                        activite
                                )
                        )
                        .activiteId(
                                activite.getIdActivite()
                        )
                        .estLue(false)
                        .dateLecture(null)
                        .build();

        notificationUtilisateurRepository.save(
                notification
        );
    }

    private void envoyerPushNouvelleActivite(
            Activite activite,
            Utilisateur utilisateur
    ) {
        String expoPushToken =
                getExpoPushToken(utilisateur);

        if (expoPushToken == null) {
            return;
        }

        Map<String, Object> data =
                new HashMap<>();

        data.put(
                "type",
                "NOUVELLE_ACTIVITE"
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

    private String construireMessageNouvelleActivite(
            Activite activite
    ) {
        String titre =
                getTitreActivite(activite);

        return "Une nouvelle activité est disponible : "
                + titre
                + ".";
    }

    /* ====================================================================== */
    /*                    VALIDATION D’UNE INSCRIPTION                         */
    /* ====================================================================== */

    /**
     * Notifie le membre lorsque son inscription
     * à une activité est validée.
     */
    @Transactional
    public void notifierValidationInscriptionActivite(
            InscriptionActivite inscription
    ) {
        if (!inscriptionValide(inscription)) {
            System.out.println(
                    "Notification de validation ignorée : "
                            + "données incomplètes."
            );

            return;
        }

        Utilisateur utilisateur =
                inscription.getUtilisateur();

        Activite activite =
                inscription.getActivite();

        creerNotificationValidationSiAbsente(
                inscription,
                utilisateur,
                activite
        );

        envoyerPushValidationInscription(
                inscription,
                utilisateur,
                activite
        );
    }

    private void creerNotificationValidationSiAbsente(
            InscriptionActivite inscription,
            Utilisateur utilisateur,
            Activite activite
    ) {
        boolean existe =
                notificationUtilisateurRepository
                        .existsByUtilisateurIdUtilisateurAndTypeNotificationAndInscriptionId(
                                utilisateur.getIdUtilisateur(),
                                TypeNotification.VALIDATION_INSCRIPTION,
                                inscription.getIdInscription()
                        );

        if (existe) {
            return;
        }

        NotificationUtilisateur notification =
                NotificationUtilisateur.builder()
                        .utilisateur(utilisateur)
                        .typeNotification(
                                TypeNotification.VALIDATION_INSCRIPTION
                        )
                        .titre("Inscription validée")
                        .message(
                                construireMessageValidationInscription(
                                        activite
                                )
                        )
                        .titreCible(
                                getTitreActivite(
                                        activite
                                )
                        )
                        .activiteId(
                                activite.getIdActivite()
                        )
                        .inscriptionId(
                                inscription.getIdInscription()
                        )
                        .estLue(false)
                        .dateLecture(null)
                        .build();

        notificationUtilisateurRepository.save(
                notification
        );
    }

    private void envoyerPushValidationInscription(
            InscriptionActivite inscription,
            Utilisateur utilisateur,
            Activite activite
    ) {
        String expoPushToken =
                getExpoPushToken(utilisateur);

        if (expoPushToken == null) {
            return;
        }

        Map<String, Object> data =
                new HashMap<>();

        data.put(
                "type",
                "VALIDATION_INSCRIPTION"
        );

        data.put(
                "activiteId",
                activite.getIdActivite()
        );

        data.put(
                "inscriptionId",
                inscription.getIdInscription()
        );

        expoPushNotificationService
                .envoyerNotification(
                        expoPushToken,
                        "Inscription validée",
                        construireMessageValidationInscription(
                                activite
                        ),
                        data
                );
    }

    private String construireMessageValidationInscription(
            Activite activite
    ) {
        return "Votre inscription à « "
                + getTitreActivite(activite)
                + " » a été validée.";
    }

    /* ====================================================================== */
    /*                       REFUS D’UNE INSCRIPTION                           */
    /* ====================================================================== */

    /**
     * Notifie le membre lorsque son inscription
     * à une activité est refusée.
     */
    @Transactional
    public void notifierRefusInscriptionActivite(
            InscriptionActivite inscription
    ) {
        if (!inscriptionValide(inscription)) {
            System.out.println(
                    "Notification de refus ignorée : "
                            + "données incomplètes."
            );

            return;
        }

        Utilisateur utilisateur =
                inscription.getUtilisateur();

        Activite activite =
                inscription.getActivite();

        creerNotificationRefusSiAbsente(
                inscription,
                utilisateur,
                activite
        );

        envoyerPushRefusInscription(
                inscription,
                utilisateur,
                activite
        );
    }

    private void creerNotificationRefusSiAbsente(
            InscriptionActivite inscription,
            Utilisateur utilisateur,
            Activite activite
    ) {
        boolean existe =
                notificationUtilisateurRepository
                        .existsByUtilisateurIdUtilisateurAndTypeNotificationAndInscriptionId(
                                utilisateur.getIdUtilisateur(),
                                TypeNotification.REFUS_INSCRIPTION,
                                inscription.getIdInscription()
                        );

        if (existe) {
            return;
        }

        NotificationUtilisateur notification =
                NotificationUtilisateur.builder()
                        .utilisateur(utilisateur)
                        .typeNotification(
                                TypeNotification.REFUS_INSCRIPTION
                        )
                        .titre("Inscription non retenue")
                        .message(
                                construireMessageRefusInscription(
                                        activite
                                )
                        )
                        .titreCible(
                                getTitreActivite(
                                        activite
                                )
                        )
                        .activiteId(
                                activite.getIdActivite()
                        )
                        .inscriptionId(
                                inscription.getIdInscription()
                        )
                        .estLue(false)
                        .dateLecture(null)
                        .build();

        notificationUtilisateurRepository.save(
                notification
        );
    }

    private void envoyerPushRefusInscription(
            InscriptionActivite inscription,
            Utilisateur utilisateur,
            Activite activite
    ) {
        String expoPushToken =
                getExpoPushToken(utilisateur);

        if (expoPushToken == null) {
            return;
        }

        Map<String, Object> data =
                new HashMap<>();

        data.put(
                "type",
                "REFUS_INSCRIPTION"
        );

        data.put(
                "activiteId",
                activite.getIdActivite()
        );

        data.put(
                "inscriptionId",
                inscription.getIdInscription()
        );

        expoPushNotificationService
                .envoyerNotification(
                        expoPushToken,
                        "Inscription non retenue",
                        construireMessageRefusInscription(
                                activite
                        ),
                        data
                );
    }

    private String construireMessageRefusInscription(
            Activite activite
    ) {
        return "Votre inscription à « "
                + getTitreActivite(activite)
                + " » n’a pas été acceptée.";
    }

    /* ====================================================================== */
    /*                              OUTILS                                     */
    /* ====================================================================== */

    private boolean inscriptionValide(
            InscriptionActivite inscription
    ) {
        return inscription != null
                && inscription.getIdInscription() != null
                && inscription.getUtilisateur() != null
                && inscription.getUtilisateur()
                .getIdUtilisateur() != null
                && inscription.getActivite() != null
                && inscription.getActivite()
                .getIdActivite() != null;
    }

    private String getTitreActivite(
            Activite activite
    ) {
        if (
                activite != null
                        && activite.getTitre() != null
                        && !activite.getTitre()
                        .isBlank()
        ) {
            return activite.getTitre().trim();
        }

        return "Activité du club";
    }

    private String getExpoPushToken(
            Utilisateur utilisateur
    ) {
        if (utilisateur == null) {
            return null;
        }

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

            return null;
        }

        return expoPushToken.trim();
    }

    private String texteOuNull(
            String value
    ) {
        if (
                value == null
                        || value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }
}