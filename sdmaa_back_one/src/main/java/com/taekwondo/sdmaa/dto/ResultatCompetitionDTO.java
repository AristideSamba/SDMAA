package com.taekwondo.sdmaa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultatCompetitionDTO {

    private Long idResultat;

    private Long idInscription;

    private Long idUtilisateur;

    private String nomUtilisateur;

    private String prenomUtilisateur;

    private Long idActivite;

    private String titreCompetition;

    private LocalDate dateCompetition;

    private String lieuCompetition;

    private Integer rang;

    private Integer nombreParticipants;

    private String medaille;

    private String commentaireCoach;
}