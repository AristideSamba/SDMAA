package com.taekwondo.sdmaa.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActiviteDTO {

    private Long id;
    private String titre;
    private String description;
    private LocalDate dateActivite;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private String dureeActivite;
    private String lieu;
    private BigDecimal prix;
    private Integer capaciteMax;
    private Boolean isInternal;
    private String typeActivite;
    private String lienExterne;
    private String imageActivite;
    private String discipline;
    private String categorie;
}
