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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDocument;

    @Column(name = "nom", nullable = false)
    private String titre;

    @Column(nullable = false)
    private String type;
    //certificat médical, diplome, passeport etc

    @Column(name = "fichier_url", nullable = false)
    private String urlFichier;

    @Column(name = "date_upload", nullable = false)
    private LocalDate dateUpload;

    @Column(name = "date_expiration", nullable = false)
    private LocalDate dateExpiration;

    @Column(name = "est_valide")
    private Boolean estValide;

    // 🔗 lien utilisateur (obligatoire)
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_utilisateur")
    private Utilisateur utilisateur;

    // 🔗 lien activité (optionnel)
    @ManyToOne
    @JoinColumn(name = "id_activite")
    private Activite activite;
}