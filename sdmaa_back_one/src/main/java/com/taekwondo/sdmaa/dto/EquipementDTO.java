package com.taekwondo.sdmaa.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipementDTO {

    private Long id;
    private String nom;
    private String type;
    private String taille;
    private Integer quantiteDisponible;
    private BigDecimal prixAchat;
    private Boolean achetable;
    private Boolean empruntable;
    private String lienImage;
    private String description;
    private String categorie;
}