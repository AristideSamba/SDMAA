package com.taekwondo.sdmaa.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AchatEquipement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAchat;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_utilisateur")
    private Utilisateur utilisateur;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_equipement")
    private Equipement equipement;

    @Column(nullable = false)
    private LocalDate dateAchat;

    @Column(nullable = false)
    private Integer quantite;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal montantTotal;

    @Column(nullable = false)
    private String modePaiement; // especes

    @Column(nullable = false)
    private String statutPaiement; // en_attente, paye, refuse
}