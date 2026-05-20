package com.taekwondo.sdmaa.dto.auth;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterCompleteRequest {

    @NotBlank(message = "Le nom est obligatoire")
    @Pattern(
            regexp = "^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,50}$",
            message = "Le nom doit contenir entre 2 et 50 caractères valides"
    )
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Pattern(
            regexp = "^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,50}$",
            message = "Le prénom doit contenir entre 2 et 50 caractères valides"
    )
    private String prenom;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{13,}$",
            message = "Le mot de passe doit contenir au moins 13 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial"
    )
    private String motDePasse;

    @NotNull(message = "La date de naissance est obligatoire")
    @Past(message = "La date de naissance doit être dans le passé")
    private LocalDate dateNaissance;

    @NotBlank(message = "Le téléphone est obligatoire")
    @Pattern(
            regexp = "^(?:(?:\\+33|0033)\\s?[1-9](?:[\\s.-]?\\d{2}){4}|0[1-9](?:[\\s.-]?\\d{2}){4})$",
            message = "Le numéro de téléphone doit être valide"
    )
    private String telephone;

    @NotBlank(message = "L'adresse est obligatoire")
    @Size(min = 5, max = 255, message = "L'adresse doit contenir entre 5 et 255 caractères")
    private String adresse;

    @NotNull(message = "L'abonnement est obligatoire")
    private Long idAbonnement;
}