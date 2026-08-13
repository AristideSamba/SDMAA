package com.taekwondo.sdmaa.entity;

import com.taekwondo.sdmaa.enums.CategorieDocument;
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
     * Identifiant Cloudinary.
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
     * Facultatif :
     * certains documents n'expirent pas.
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
     * Permet de distinguer :
     *
     * PERSONNEL
     * CLUB
     */
    @Enumerated(EnumType.STRING)
    @Column(
            name = "categorie_document",
            nullable = false
    )
    private CategorieDocument categorieDocument;

    /**
     * Pour un document personnel :
     * utilisateur != null
     *
     * Pour un document du club :
     * utilisateur = null
     */
    @ManyToOne
    @JoinColumn(
            name = "id_utilisateur"
    )
    private Utilisateur utilisateur;

    /**
     * Activité éventuellement associée.
     */
    @ManyToOne
    @JoinColumn(
            name = "id_activite"
    )
    private Activite activite;

    /**
     * Valeurs par défaut
     * lors d'une insertion.
     */
    @PrePersist
    public void prePersist() {

        if (dateUpload == null) {
            dateUpload =
                    LocalDate.now();
        }

        if (estValide == null) {
            estValide =
                    false;
        }

        if (
                categorieDocument == null
        ) {
            categorieDocument =
                    CategorieDocument.PERSONNEL;
        }
    }
}