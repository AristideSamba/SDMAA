package com.taekwondo.sdmaa.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long idDocument;

    @Column(
            name = "nom",
            nullable = false
    )
    private String titre;

    @Column(nullable = false)
    private String type;

    @Column(
            name = "fichier_url",
            nullable = false,
            length = 1000
    )
    private String urlFichier;

    /**
     * Identifiant Cloudinary permettant
     * de supprimer le fichier plus tard.
     */
    @Column(
            name = "cloudinary_public_id"
    )
    private String cloudinaryPublicId;

    /**
     * image / raw / video
     */
    @Column(
            name = "cloudinary_resource_type"
    )
    private String cloudinaryResourceType;

    @Column(
            name = "date_upload",
            nullable = false
    )
    private LocalDate dateUpload;

    /**
     * Facultatif car tous les documents
     * n'ont pas de date d'expiration.
     */
    @Column(
            name = "date_expiration"
    )
    private LocalDate dateExpiration;

    @Column(
            name = "est_valide"
    )
    private Boolean estValide;

    /**
     * Document appartenant à un utilisateur.
     */
    @ManyToOne(optional = false)
    @JoinColumn(
            name = "id_utilisateur"
    )
    private Utilisateur utilisateur;

    /**
     * Activité éventuellement associée
     * au document.
     */
    @ManyToOne
    @JoinColumn(
            name = "id_activite"
    )
    private Activite activite;
}