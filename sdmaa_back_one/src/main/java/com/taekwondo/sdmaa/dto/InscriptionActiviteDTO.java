package com.taekwondo.sdmaa.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InscriptionActiviteDTO {

    private Long id;
    private LocalDate dateDemande;
    private String commentaire;
    private String statutInscription;
    private String statutPaiement;
    private String modePaiement;
    private LocalDate dateValidationAdmin;

    private Long utilisateurId;
    private String utilisateurNom;
    private String utilisateurPrenom;
    private String utilisateurEmail;

    private Long activiteId;
    private String activiteTitre;
    private LocalDate activiteDate;
    private String activiteLieu;
    private String typeActivite;
    private String lienExterne;
    private String categorie;
    private String discipline;
    private String image;
    private String lieu;
    private String dureeActivite;
}
