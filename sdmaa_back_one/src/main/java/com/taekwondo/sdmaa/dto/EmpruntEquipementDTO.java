package com.taekwondo.sdmaa.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmpruntEquipementDTO {

    private Long id;
    private LocalDate dateEmprunt;
    private LocalDate dateRetourPrevue;
    private LocalDate dateRetourEffective;
    private String statutEmprunt;
    private Integer quantite;

    private Long utilisateurId;
    private String utilisateurNom;
    private String utilisateurPrenom;

    private Long equipementId;
    private String equipementNom;
    private String equipementType;
}
