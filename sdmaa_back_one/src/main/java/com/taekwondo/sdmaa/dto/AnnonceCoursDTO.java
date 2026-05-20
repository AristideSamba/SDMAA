package com.taekwondo.sdmaa.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnonceCoursDTO {

    private Long idAnnonce;

    private LocalDate dateConcernee;
    private String jourConcerne;

    private String typeAnnonce;
    private String message;
    private LocalDateTime dateCreation;

    private Long idCours;
    private String coursTitre;
    private String coursJourHabituel;
    private String coursLieu;
}
