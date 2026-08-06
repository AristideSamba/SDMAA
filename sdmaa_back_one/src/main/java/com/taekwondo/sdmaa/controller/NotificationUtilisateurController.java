package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.dto.NotificationUtilisateurDTO;
import com.taekwondo.sdmaa.service.NotificationUtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationUtilisateurController {

    private final NotificationUtilisateurService
            notificationService;

    /**
     * Liste des notifications de
     * l’utilisateur connecté.
     */
    @GetMapping
    public ResponseEntity<
            List<NotificationUtilisateurDTO>
            > getMesNotifications(
            Authentication authentication
    ) {
        String email =
                getEmail(authentication);

        return ResponseEntity.ok(
                notificationService
                        .getMesNotifications(
                                email
                        )
        );
    }

    /**
     * Nombre de notifications non lues.
     */
    @GetMapping("/non-lues/count")
    public ResponseEntity<
            Map<String, Long>
            > compterNonLues(
            Authentication authentication
    ) {
        String email =
                getEmail(authentication);

        long count =
                notificationService
                        .compterMesNotificationsNonLues(
                                email
                        );

        return ResponseEntity.ok(
                Map.of(
                        "count",
                        count
                )
        );
    }

    /**
     * Marque une notification comme lue.
     */
    @PutMapping("/{id}/lire")
    public ResponseEntity<
            NotificationUtilisateurDTO
            > marquerCommeLue(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email =
                getEmail(authentication);

        return ResponseEntity.ok(
                notificationService
                        .marquerCommeLue(
                                id,
                                email
                        )
        );
    }

    /**
     * Marque toutes les notifications
     * comme lues.
     */
    @PutMapping("/lire-toutes")
    public ResponseEntity<
            Map<String, Integer>
            > marquerToutesCommeLues(
            Authentication authentication
    ) {
        String email =
                getEmail(authentication);

        int nombre =
                notificationService
                        .marquerToutesCommeLues(
                                email
                        );

        return ResponseEntity.ok(
                Map.of(
                        "notificationsMisesAJour",
                        nombre
                )
        );
    }

    /**
     * Supprime une notification.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    supprimerNotification(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email =
                getEmail(authentication);

        notificationService
                .supprimerNotification(
                        id,
                        email
                );

        return ResponseEntity.noContent().build();
    }

    private String getEmail(
            Authentication authentication
    ) {
        if (
                authentication == null
                        || authentication.getName() == null
                        || authentication.getName().isBlank()
        ) {
            throw new IllegalStateException(
                    "Utilisateur non authentifié"
            );
        }

        return authentication.getName();
    }
}