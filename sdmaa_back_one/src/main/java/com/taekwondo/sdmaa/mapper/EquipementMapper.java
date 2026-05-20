package com.taekwondo.sdmaa.mapper;

import com.taekwondo.sdmaa.dto.EquipementDTO;
import com.taekwondo.sdmaa.entity.Equipement;

public class EquipementMapper {

    public static EquipementDTO toDTO(Equipement equipement) {
        return EquipementDTO.builder()
                .id(equipement.getIdEquipement())
                .nom(equipement.getNom())
                .type(equipement.getType())
                .taille(equipement.getTaille())
                .quantiteDisponible(equipement.getQuantiteDisponible())
                .prixAchat(equipement.getPrixAchat())
                .achetable(equipement.getAchetable())
                .empruntable(equipement.getEmpruntable())
                .lienImage(equipement.getLienImage())
                .description(equipement.getDescription())
                .categorie(equipement.getCategorie())
                .build();
    }
}