package com.taekwondo.sdmaa.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idActivite;

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDate dateActivite;

    @Column(nullable = false)
    private String dureeActivite;

    private LocalTime heureDebut;

    private LocalTime heureFin;

    @Column(nullable = false)
    private String lieu;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal prix;

    private Integer capaciteMax;

    @Column(nullable = false)
    private Boolean isInternal;

    @Column(nullable = false)
    private String typeActivite;

    private String lienExterne;

    @Column(nullable = false)
    private String categorie;

    @Column(nullable = false)
    private String discipline;

    /**
     * URL publique retournée par Cloudinary.
     */
    @Column(name = "image_activite", length = 500)
    private String imageActivite;

    /**
     * Identifiant Cloudinary utilisé pour remplacer
     * ou supprimer l'image.
     */
    @Column(name = "image_public_id")
    private String imagePublicId;
}