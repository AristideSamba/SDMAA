package com.taekwondo.sdmaa.mapper;

import com.taekwondo.sdmaa.dto.UtilisateurDTO;
import com.taekwondo.sdmaa.entity.Utilisateur;

public class UtilisateurMapper {

    public static UtilisateurDTO toDTO(Utilisateur user) {

        return UtilisateurDTO.builder()
                .id(user.getIdUtilisateur())
                .nom(user.getNom())
                .role(user.getRole())
                .prenom(user.getPrenom())
                .nomComplet(user.getPrenom() + " " + user.getNom())
                .email(user.getEmail())
                .statutCompte(user.getStatutCompte())
                .adresse(user.getAdresse())
                .dateNaissance(user.getDateNaissance())
                .telephone(user.getTelephone())

                // ⚠️ éviter NullPointerException
                .ceintureNom(
                        user.getCeinture() != null ? user.getCeinture().getNom() : null
                )
                .ceintureCouleur(
                        user.getCeinture() != null ? user.getCeinture().getCouleur() : null
                )
                .build();
    }
}
