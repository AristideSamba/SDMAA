package com.taekwondo.sdmaa.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUtilisateur;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String motDePasseHash;

    private LocalDate dateNaissance;

    private String telephone;

    private String adresse;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String statutCompte;

    @Column(nullable = false)
    private LocalDateTime dateCreationCompte;

    @ManyToOne
    @JoinColumn(name = "id_ceinture")
    private Ceinture ceinture;

    /**
     * URL publique sécurisée de la photo Cloudinary.
     */
    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    /**
     * Identifiant technique Cloudinary utilisé
     * pour remplacer ou supprimer la photo.
     */
    @Column(name = "photo_public_id")
    private String photoPublicId;
}