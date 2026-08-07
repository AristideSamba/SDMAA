package com.taekwondo.sdmaa.dto;

import com.taekwondo.sdmaa.enums.StatutAnnonce;
import lombok.*;

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
     * URL Cloudinary.
     */
    private String image;

    /**
     * Alias pratique conservé pour
     * compatibilité avec le frontend/mobile.
     */
    private String imageUrl;

    private StatutAnnonce statut;

    private LocalDateTime datePublication;

    private LocalDateTime dateCreation;

    private LocalDateTime dateModification;

    private Long auteurId;

    private String auteurNom;
}