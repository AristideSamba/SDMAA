package com.taekwondo.sdmaa.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
public class NotificationCoursUtilisateurDTO {

    private Long id;

    private Long annonceId;
    private String titre;
    private String message;
    private LocalDateTime dateCreation;

    private boolean lu;
    private LocalDateTime dateLecture;

    private Long coursId;
    private String coursTitre;
    private String jour;
    private String heureDebut;
    private String heureFin;

}
