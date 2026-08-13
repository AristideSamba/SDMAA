package com.taekwondo.sdmaa.dto;

import com.taekwondo.sdmaa.enums.CategorieDocument;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentDTO {

    private Long id;
    private String titre;
    private String type;
    private String urlFichier;
    private LocalDate dateUpload;
    private LocalDate dateExpiration;
    private Boolean estValide;

    private CategorieDocument categorieDocument;

    private Long utilisateurId;
    private String utilisateurNom;

    private Long activiteId;
    private String activiteTitre;
}