package com.taekwondo.sdmaa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UtilisateurDTO {

    private Long id;

    private String nom;

    private String prenom;

    private String nomComplet;

    private String email;

    private String adresse;

    private String telephone;

    private String role;

    private String statutCompte;

    private LocalDate dateNaissance;

    private String photoUrl;

    private String ceintureNom;

    private String ceintureCouleur;
}