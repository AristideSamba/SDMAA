package com.taekwondo.sdmaa.entity;

import com.taekwondo.sdmaa.enums.TypeNotification;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "notification_utilisateur",
        indexes = {
                @Index(
                        name = "idx_notification_utilisateur",
                        columnList = "utilisateur_id"
                ),
                @Index(
                        name = "idx_notification_utilisateur_lue",
                        columnList = "utilisateur_id, est_lue"
                ),
                @Index(
                        name = "idx_notification_date_creation",
                        columnList = "date_creation"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationUtilisateur {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    @Column(name = "id_notification")
    private Long idNotification;

    /**
     * Utilisateur destinataire.
     */
    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "utilisateur_id",
            nullable = false
    )
    private Utilisateur utilisateur;

    /**
     * Type fonctionnel de la notification.
     */
    @Enumerated(EnumType.STRING)
    @Column(
            name = "type_notification",
            nullable = false,
            length = 60
    )
    private TypeNotification typeNotification;

    /**
     * Titre affiché dans le centre
     * de notifications.
     */
    @Column(
            name = "titre",
            nullable = false,
            length = 150
    )
    private String titre;

    /**
     * Corps de la notification.
     */
    @Column(
            name = "message",
            nullable = false,
            length = 1000
    )
    private String message;

    /**
     * Nom de l’élément concerné.
     *
     * Exemple :
     * "Championnat régional".
     *
     * Il reste disponible même si l’activité
     * ou l’annonce est supprimée plus tard.
     */
    @Column(
            name = "titre_cible",
            length = 255
    )
    private String titreCible;

    /**
     * Identifiants de navigation facultatifs.
     *
     * On conserve uniquement les identifiants
     * pour éviter de rendre l’historique dépendant
     * de relations JPA supprimables.
     */
    @Column(name = "activite_id")
    private Long activiteId;

    @Column(name = "annonce_id")
    private Long annonceId;

    @Column(name = "cours_id")
    private Long coursId;

    @Column(name = "inscription_id")
    private Long inscriptionId;

    @Builder.Default
    @Column(
            name = "est_lue",
            nullable = false
    )
    private boolean estLue = false;

    @Column(
            name = "date_creation",
            nullable = false,
            updatable = false
    )
    private LocalDateTime dateCreation;

    @Column(name = "date_lecture")
    private LocalDateTime dateLecture;

    @PrePersist
    private void avantCreation() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }

        if (!estLue) {
            dateLecture = null;
        }
    }
}
