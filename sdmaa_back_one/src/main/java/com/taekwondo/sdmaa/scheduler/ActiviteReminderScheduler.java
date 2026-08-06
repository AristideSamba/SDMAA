package com.taekwondo.sdmaa.scheduler;

import com.taekwondo.sdmaa.entity.Activite;
import com.taekwondo.sdmaa.entity.InscriptionActivite;
import com.taekwondo.sdmaa.repository.ActiviteRepository;
import com.taekwondo.sdmaa.repository.InscriptionActiviteRepository;
import com.taekwondo.sdmaa.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ActiviteReminderScheduler {

    private static final ZoneId ZONE_PARIS =
            ZoneId.of("Europe/Paris");

    private static final String STATUT_VALIDE =
            "validee";

    private final ActiviteRepository
            activiteRepository;

    private final InscriptionActiviteRepository
            inscriptionRepository;

    private final NotificationService
            notificationService;

    /**
     * Vérifie chaque jour à 08h00 les activités
     * prévues exactement trois jours plus tard.
     */
    @Scheduled(
            cron = "0 0 8 * * *",
            zone = "Europe/Paris"
    )
    @Transactional(readOnly = true)
    public void envoyerRappelsJ3() {
        LocalDate dateCible =
                LocalDate.now(ZONE_PARIS)
                        .plusDays(3);

        List<Activite> activites =
                activiteRepository
                        .findByDateActivite(
                                dateCible
                        );

        if (
                activites == null
                        || activites.isEmpty()
        ) {
            return;
        }

        for (Activite activite : activites) {
            notifierInscriptionsValideesJ3(
                    activite
            );
        }
    }

    /**
     * Vérifie toutes les 10 minutes si une activité
     * commence dans environ trois heures.
     */
    @Scheduled(
            cron = "0 */10 * * * *",
            zone = "Europe/Paris"
    )
    @Transactional(readOnly = true)
    public void envoyerRappelsH3() {
        LocalDateTime maintenant =
                LocalDateTime.now(
                        ZONE_PARIS
                );

        LocalDateTime borneDebut =
                maintenant.plusHours(3);

        LocalDateTime borneFin =
                borneDebut.plusMinutes(10);

        LocalDate dateDebut =
                borneDebut.toLocalDate();

        LocalDate dateFin =
                borneFin.toLocalDate();

        traiterActivitesH3PourDate(
                dateDebut,
                borneDebut,
                borneFin
        );

        if (!dateFin.equals(dateDebut)) {
            traiterActivitesH3PourDate(
                    dateFin,
                    borneDebut,
                    borneFin
            );
        }
    }

    private void traiterActivitesH3PourDate(
            LocalDate date,
            LocalDateTime borneDebut,
            LocalDateTime borneFin
    ) {
        List<Activite> activites =
                activiteRepository
                        .findByDateActivite(
                                date
                        );

        if (
                activites == null
                        || activites.isEmpty()
        ) {
            return;
        }

        for (Activite activite : activites) {
            LocalTime heureDebut =
                    activite.getHeureDebut();

            if (heureDebut == null) {
                continue;
            }

            LocalDateTime dateHeureActivite =
                    LocalDateTime.of(
                            activite.getDateActivite(),
                            heureDebut
                    );

            boolean dansLaFenetre =
                    !dateHeureActivite.isBefore(
                            borneDebut
                    )
                            && dateHeureActivite.isBefore(
                            borneFin
                    );

            if (!dansLaFenetre) {
                continue;
            }

            notifierInscriptionsValideesH3(
                    activite
            );
        }
    }

    private void notifierInscriptionsValideesJ3(
            Activite activite
    ) {
        List<InscriptionActivite> inscriptions =
                getInscriptionsValidees(
                        activite
                );

        for (
                InscriptionActivite inscription :
                inscriptions
        ) {
            try {
                notificationService
                        .notifierRappelActiviteJ3(
                                inscription
                        );
            } catch (Exception exception) {
                System.err.println(
                        "Erreur rappel J-3 pour inscription "
                                + inscription.getIdInscription()
                                + " : "
                                + exception.getMessage()
                );
            }
        }
    }

    private void notifierInscriptionsValideesH3(
            Activite activite
    ) {
        List<InscriptionActivite> inscriptions =
                getInscriptionsValidees(
                        activite
                );

        for (
                InscriptionActivite inscription :
                inscriptions
        ) {
            try {
                notificationService
                        .notifierRappelActiviteH3(
                                inscription
                        );
            } catch (Exception exception) {
                System.err.println(
                        "Erreur rappel H-3 pour inscription "
                                + inscription.getIdInscription()
                                + " : "
                                + exception.getMessage()
                );
            }
        }
    }

    private List<InscriptionActivite>
    getInscriptionsValidees(
            Activite activite
    ) {
        if (
                activite == null
                        || activite.getIdActivite() == null
        ) {
            return List.of();
        }

        return inscriptionRepository
                .findByActiviteIdActiviteAndStatutInscriptionIgnoreCase(
                        activite.getIdActivite(),
                        STATUT_VALIDE
                );
    }
}