package com.taekwondo.sdmaa.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AchatEquipementDTO {

    private Long id;
    private LocalDate dateAchat;
    private Integer quantite;
    private BigDecimal montantTotal;
    private String modePaiement;
    private String statutPaiement;

    private Long utilisateurId;
    private String utilisateurNom;
    private String utilisateurPrenom;

    private Long equipementId;
    private String equipementNom;
    private String equipementType;
    private String lienImage;
    private Integer quantiteDisponible;
}
