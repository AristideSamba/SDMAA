package com.taekwondo.sdmaa.mapper;

import com.taekwondo.sdmaa.dto.CoursDTO;
import com.taekwondo.sdmaa.entity.AffectationCours;
import com.taekwondo.sdmaa.entity.Cours;

import java.util.List;

public class CoursMapper {

    public static CoursDTO toDTO(Cours cours) {
        return CoursDTO.builder()
                .idCours(cours.getIdCours())
                .titre(cours.getTitre())
                .description(cours.getDescription())
                .jour(cours.getJour())
                .heureDebut(cours.getHeureDebut())
                .heureFin(cours.getHeureFin())
                .trancheAge(cours.getTrancheAge())
                .niveau(cours.getNiveau())
                .lieu(cours.getLieu())
                .statutCours(cours.getStatutCours())
                .coachs(
                        cours.getAffectationsCours() == null
                                ? List.of()
                                : cours.getAffectationsCours()
                                .stream()
                                .filter(a -> !"refusee".equalsIgnoreCase(a.getStatutAffectation()))
                                .map(a -> a.getCoach().getPrenom() + " " + a.getCoach().getNom())
                                .toList()
                )
                .build();
    }
}