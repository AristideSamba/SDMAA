package com.taekwondo.sdmaa.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "inscription_activite",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"id_utilisateur", "id_activite"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InscriptionActivite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idInscription;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_utilisateur")
    private Utilisateur utilisateur;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_activite")
    private Activite activite;

    @Column(nullable = false)
    private LocalDate dateDemande;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    @Column(nullable = false)
    private String statutInscription;

    @Column(nullable = false)
    private String statutPaiement;

    private String modePaiement;

    private LocalDate dateValidationAdmin;
}