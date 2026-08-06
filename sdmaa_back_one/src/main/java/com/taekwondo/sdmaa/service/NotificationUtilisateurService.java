package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.NotificationUtilisateurDTO;
import com.taekwondo.sdmaa.entity.NotificationUtilisateur;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.NotificationUtilisateurMapper;
import com.taekwondo.sdmaa.repository.NotificationUtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationUtilisateurService {

    private final NotificationUtilisateurRepository
            notificationRepository;

    /**
     * Retourne toutes les notifications
     * de l’utilisateur connecté.
     */
    @Transactional(readOnly = true)
    public List<NotificationUtilisateurDTO>
    getMesNotifications(
            String email
    ) {
        return notificationRepository
                .findByUtilisateurEmailOrderByDateCreationDesc(
                        email
                )
                .stream()
                .map(
                        NotificationUtilisateurMapper::toDTO
                )
                .toList();
    }

    /**
     * Retourne le nombre de notifications
     * non lues de l’utilisateur connecté.
     */
    @Transactional(readOnly = true)
    public long compterMesNotificationsNonLues(
            String email
    ) {
        return notificationRepository
                .countByUtilisateurEmailAndEstLueFalse(
                        email
                );
    }

    /**
     * Marque une notification comme lue.
     */
    @Transactional
    public NotificationUtilisateurDTO
    marquerCommeLue(
            Long notificationId,
            String email
    ) {
        NotificationUtilisateur notification =
                notificationRepository
                        .findByIdNotificationAndUtilisateurEmail(
                                notificationId,
                                email
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification introuvable"
                                )
                        );

        if (!notification.isEstLue()) {
            notification.setEstLue(true);
            notification.setDateLecture(
                    LocalDateTime.now()
            );

            notification =
                    notificationRepository.save(
                            notification
                    );
        }

        return NotificationUtilisateurMapper.toDTO(
                notification
        );
    }

    /**
     * Marque toutes les notifications
     * de l’utilisateur comme lues.
     */
    @Transactional
    public int marquerToutesCommeLues(
            String email
    ) {
        List<NotificationUtilisateur> notifications =
                notificationRepository
                        .findByUtilisateurEmailOrderByDateCreationDesc(
                                email
                        );

        int compteur = 0;

        LocalDateTime maintenant =
                LocalDateTime.now();

        for (
                NotificationUtilisateur notification :
                notifications
        ) {
            if (!notification.isEstLue()) {
                notification.setEstLue(true);
                notification.setDateLecture(
                        maintenant
                );

                compteur++;
            }
        }

        if (compteur > 0) {
            notificationRepository.saveAll(
                    notifications
            );
        }

        return compteur;
    }

    /**
     * Supprime une notification appartenant
     * à l’utilisateur connecté.
     */
    @Transactional
    public void supprimerNotification(
            Long notificationId,
            String email
    ) {
        NotificationUtilisateur notification =
                notificationRepository
                        .findByIdNotificationAndUtilisateurEmail(
                                notificationId,
                                email
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification introuvable"
                                )
                        );

        notificationRepository.delete(
                notification
        );
    }

    /**
     * Supprime les anciennes notifications.
     * Cette méthode pourra ensuite être appelée
     * automatiquement par une tâche planifiée.
     */
    @Transactional
    public long supprimerNotificationsAnciennes(
            LocalDateTime limite
    ) {
        List<NotificationUtilisateur> anciennes =
                notificationRepository
                        .findByDateCreationBefore(
                                limite
                        );

        if (anciennes.isEmpty()) {
            return 0;
        }

        notificationRepository.deleteAll(
                anciennes
        );

        return anciennes.size();
    }
}