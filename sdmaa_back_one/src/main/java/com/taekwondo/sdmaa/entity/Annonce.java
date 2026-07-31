package com.taekwondo.sdmaa.entity;

import com.taekwondo.sdmaa.enums.StatutAnnonce;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
     * Nom du fichier ou URL de l'image.
     * Ce champ reste facultatif.
     */
    @Column(length = 500)
    private String image;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private StatutAnnonce statut;

    /**
     * Date à partir de laquelle l'annonce
     * doit être visible par les utilisateurs.
     */
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

    /**
     * Auteur de l'annonce.
     *
     * Facultatif pour éviter une erreur si
     * un utilisateur administrateur est supprimé.
     */
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
            statut = StatutAnnonce.BROUILLON;
        }

        if (
                statut == StatutAnnonce.PUBLIEE
                        && datePublication == null
        ) {
            datePublication = maintenant;
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
