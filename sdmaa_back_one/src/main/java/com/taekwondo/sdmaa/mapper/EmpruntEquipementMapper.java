package com.taekwondo.sdmaa.mapper;

import com.taekwondo.sdmaa.dto.EmpruntEquipementDTO;
import com.taekwondo.sdmaa.entity.EmpruntEquipement;

public class EmpruntEquipementMapper {

    public static EmpruntEquipementDTO toDTO(EmpruntEquipement emprunt) {
        return EmpruntEquipementDTO.builder()
                .id(emprunt.getIdEmprunt())
                .dateEmprunt(emprunt.getDateEmprunt())
                .dateRetourPrevue(emprunt.getDateRetourPrevue())
                .dateRetourEffective(emprunt.getDateRetourEffective())
                .statutEmprunt(emprunt.getStatutEmprunt())
                .quantite(emprunt.getQuantite())
                .utilisateurId(emprunt.getUtilisateur().getIdUtilisateur())
                .utilisateurNom(emprunt.getUtilisateur().getNom())
                .utilisateurPrenom(emprunt.getUtilisateur().getPrenom())
                .equipementId(emprunt.getEquipement().getIdEquipement())
                .equipementNom(emprunt.getEquipement().getNom())
                .equipementType(emprunt.getEquipement().getType())
                .build();
    }
}
