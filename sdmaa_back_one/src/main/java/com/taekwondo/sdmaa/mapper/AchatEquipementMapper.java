package com.taekwondo.sdmaa.mapper;

import com.taekwondo.sdmaa.dto.AchatEquipementDTO;
import com.taekwondo.sdmaa.entity.AchatEquipement;

public class AchatEquipementMapper {

    public static AchatEquipementDTO toDTO(AchatEquipement achat) {
        return AchatEquipementDTO.builder()
                .id(achat.getIdAchat())
                .dateAchat(achat.getDateAchat())
                .quantite(achat.getQuantite())
                .montantTotal(achat.getMontantTotal())
                .modePaiement(achat.getModePaiement())
                .statutPaiement(achat.getStatutPaiement())
                .utilisateurId(achat.getUtilisateur().getIdUtilisateur())
                .utilisateurNom(achat.getUtilisateur().getNom())
                .utilisateurPrenom(achat.getUtilisateur().getPrenom())
                .equipementId(achat.getEquipement().getIdEquipement())
                .equipementNom(achat.getEquipement().getNom())
                .equipementType(achat.getEquipement().getType())
                .lienImage(achat.getEquipement().getLienImage())
                .quantiteDisponible(achat.getEquipement().getQuantiteDisponible())
                .build();
    }
}
