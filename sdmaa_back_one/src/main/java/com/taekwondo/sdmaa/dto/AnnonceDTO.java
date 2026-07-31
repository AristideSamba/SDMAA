package com.taekwondo.sdmaa.dto;

import com.taekwondo.sdmaa.enums.StatutAnnonce;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnonceDTO {

    private Long id;

    private String titre;

    private String contenu;

    /**
     * URL ou nom de l'image.
     */
    private String image;

    private StatutAnnonce statut;

    private LocalDateTime datePublication;

    private LocalDateTime dateCreation;

    private LocalDateTime dateModification;

    /**
     * Informations de l'auteur.
     */
    private Long auteurId;

    private String auteurNom;

    private String imageUrl;
}