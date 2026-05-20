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
    private String type; // tenue, protection, accessoire, ceinture, autre

    private String taille;

    @Column(nullable = false)
    private Integer quantiteDisponible;

    @Column(precision = 8, scale = 2)
    private BigDecimal prixAchat;

    @Column(nullable = false)
    private Boolean achetable;

    @Column(nullable = false)
    private Boolean empruntable;

    @Column(nullable = false)
    private String lienImage;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String categorie;
}
