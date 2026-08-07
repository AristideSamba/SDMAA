package com.taekwondo.sdmaa.entity;

import com.taekwondo.sdmaa.enums.StatutAnnonce;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "annonces")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Annonce {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            nullable = false,
            length = 150
    )
    private String titre;

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String contenu;

    /**
     * URL publique Cloudinary.
     */
    @Column(
            name = "image",
            length = 500
    )
    private String image;

    /**
     * Identifiant Cloudinary.
     *
     * Permet de remplacer ou supprimer
     * proprement l'image dans Cloudinary.
     */
    @Column(
            name = "image_public_id",
            length = 500
    )
    private String imagePublicId;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private StatutAnnonce statut;

    @Column(name = "date_publication")
    private LocalDateTime datePublication;

    @Column(
            name = "date_creation",
            nullable = false,
            updatable = false
    )
    private LocalDateTime dateCreation;

    @Column(
            name = "date_modification",
            nullable = false
    )
    private LocalDateTime dateModification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auteur_id")
    private Utilisateur auteur;

    @PrePersist
    public void avantCreation() {
        LocalDateTime maintenant =
                LocalDateTime.now();

        dateCreation = maintenant;
        dateModification = maintenant;

        if (statut == null) {
            statut =
                    StatutAnnonce.BROUILLON;
        }

        if (
                statut == StatutAnnonce.PUBLIEE
                        && datePublication == null
        ) {
            datePublication =
                    maintenant;
        }
    }

    @PreUpdate
    public void avantModification() {
        dateModification =
                LocalDateTime.now();

        if (
                statut == StatutAnnonce.PUBLIEE
                        && datePublication == null
        ) {
            datePublication =
                    LocalDateTime.now();
        }
    }
}