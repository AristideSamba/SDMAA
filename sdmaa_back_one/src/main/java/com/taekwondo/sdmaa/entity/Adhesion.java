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
public class Adhesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAdhesion;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_utilisateur")
    private Utilisateur utilisateur;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_abonnement")
    private Abonnement abonnement;

    @Column(nullable = false)
    private LocalDate dateDemande;

    private LocalDate dateValidationAdmin;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    @Column(nullable = false)
    private String statutAdhesion; // en_attente, validee, refusee, expiree

    @Column(nullable = false)
    private String statutPaiement; // en_attente, paye, refuse

    @Column(nullable = false)
    private String modePaiement; // especes
}
