package com.taekwondo.sdmaa.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEquipement;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String type;

    private String taille;

    @Column(nullable = false)
    private Integer quantiteDisponible;

    @Column(precision = 8, scale = 2)
    private BigDecimal prixAchat;

    @Column(nullable = false)
    private Boolean achetable;

    @Column(nullable = false)
    private Boolean empruntable;

    /**
     * URL publique sécurisée retournée par Cloudinary.
     */
    @Column(name = "lien_image", length = 500)
    private String lienImage;

    /**
     * Identifiant Cloudinary utilisé pour remplacer
     * ou supprimer l’image.
     */
    @Column(name = "image_public_id")
    private String imagePublicId;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private String categorie;
}