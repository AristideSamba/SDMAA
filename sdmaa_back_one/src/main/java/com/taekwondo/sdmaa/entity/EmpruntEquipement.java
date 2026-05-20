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
public class EmpruntEquipement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEmprunt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_utilisateur")
    private Utilisateur utilisateur;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_equipement")
    private Equipement equipement;

    @Column(nullable = false)
    private LocalDate dateEmprunt;

    @Column(nullable = false)
    private LocalDate dateRetourPrevue;

    private LocalDate dateRetourEffective;

    @Column(nullable = false)
    private String statutEmprunt; // en_attente, en_cours, retourne, refuse

    @Column(nullable = false)
    private Integer quantite;
}