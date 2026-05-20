package com.taekwondo.sdmaa.dto.auth;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    private String nom;
    private String prenom;
    private String email;
    private String motDePasse;
    private LocalDate dateNaissance;
    private String telephone;
    private String adresse;
}