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
    private String typeActivite; // stage, sortie, passage_grade, competition, autre

    @Column(nullable = false)
    private String lienExterne;

    @Column(nullable = false)
    private String categorie;

    @Column(nullable = false)
    private String discipline;

    @Column(nullable = false)
    private String imageActivite;
}