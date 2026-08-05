package com.taekwondo.sdmaa.mapper;

import com.taekwondo.sdmaa.dto.UtilisateurDTO;
import com.taekwondo.sdmaa.entity.Utilisateur;

public class UtilisateurMapper {

    public static UtilisateurDTO toDTO(
            Utilisateur utilisateur
    ) {
        return UtilisateurDTO.builder()
                .id(utilisateur.getIdUtilisateur())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .nomComplet(
                        utilisateur.getPrenom()
                                + " "
                                + utilisateur.getNom()
                )
                .email(utilisateur.getEmail())
                .adresse(utilisateur.getAdresse())
                .telephone(utilisateur.getTelephone())
                .role(utilisateur.getRole())
                .statutCompte(
                        utilisateur.getStatutCompte()
                )
                .dateNaissance(
                        utilisateur.getDateNaissance()
                )
                .photoUrl(
                        utilisateur.getPhotoUrl()
                )
                .ceintureNom(
                        utilisateur.getCeinture() != null
                                ? utilisateur
                                .getCeinture()
                                .getNom()
                                : null
                )
                .ceintureCouleur(
                        utilisateur.getCeinture() != null
                                ? utilisateur
                                .getCeinture()
                                .getCouleur()
                                : null
                )
                .build();
    }
}