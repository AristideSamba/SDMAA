package com.taekwondo.sdmaa.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UtilisateurDTO {

    private Long id;
    private String nom;
    private String role;
    private String prenom;
    private String nomComplet;
    private String email;
    private String adresse;
    private String telephone;
    private String statutCompte;
    private LocalDate dateNaissance;

    // 🎨 données utiles pour ton dashboard
    private String ceintureNom;
    private String ceintureCouleur;
}
