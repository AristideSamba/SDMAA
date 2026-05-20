package com.taekwondo.sdmaa.mapper;

import com.taekwondo.sdmaa.dto.AnnonceCoursDTO;
import com.taekwondo.sdmaa.entity.AnnonceCours;

public class AnnonceCoursMapper {

    public static AnnonceCoursDTO toDTO(AnnonceCours annonce) {
        return AnnonceCoursDTO.builder()
                .idAnnonce(annonce.getIdAnnonce())
                .dateConcernee(annonce.getDateConcernee())
                .jourConcerne(annonce.getJourConcerne())
                .typeAnnonce(annonce.getTypeAnnonce())
                .message(annonce.getMessage())
                .dateCreation(annonce.getDateCreation())
                .idCours(annonce.getCours().getIdCours())
                .coursTitre(annonce.getCours().getTitre())
                .coursJourHabituel(annonce.getCours().getJour())
                .coursLieu(annonce.getCours().getLieu())
                .build();
    }
}