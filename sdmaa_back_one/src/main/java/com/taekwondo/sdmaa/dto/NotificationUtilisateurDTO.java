package com.taekwondo.sdmaa.dto;

import com.taekwondo.sdmaa.enums.TypeNotification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationUtilisateurDTO {

    private Long idNotification;

    private TypeNotification typeNotification;

    private String titre;

    private String message;

    private String titreCible;

    private Long activiteId;

    private Long annonceId;

    private Long coursId;

    private Long inscriptionId;

    private boolean estLue;

    private LocalDateTime dateCreation;

    private LocalDateTime dateLecture;
}
