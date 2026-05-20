package com.taekwondo.sdmaa.mapper;

import com.taekwondo.sdmaa.dto.ActiviteDTO;
import com.taekwondo.sdmaa.entity.Activite;

public class ActiviteMapper {

    public static ActiviteDTO toDTO(Activite activite) {
        return ActiviteDTO.builder()
                .id(activite.getIdActivite())
                .titre(activite.getTitre())
                .description(activite.getDescription())
                .dateActivite(activite.getDateActivite())
                .heureDebut(activite.getHeureDebut())
                .heureFin(activite.getHeureFin())
                .lieu(activite.getLieu())
                .prix(activite.getPrix())
                .capaciteMax(activite.getCapaciteMax())
                .isInternal(activite.getIsInternal())
                .typeActivite(activite.getTypeActivite())
                .lienExterne(activite.getLienExterne())
                .dureeActivite(activite.getDureeActivite())
                .imageActivite(activite.getImageActivite())
                .build();
    }
}
