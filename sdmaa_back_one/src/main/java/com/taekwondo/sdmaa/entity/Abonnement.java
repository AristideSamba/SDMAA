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
public class Abonnement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAbonnement;

    @Column(nullable = false, unique = true)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal prixMensuel;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal prixAnnuel;

    @Column(nullable = false)
    private Integer ageMin;

    @Column(nullable = false)
    private Integer ageMax;
}