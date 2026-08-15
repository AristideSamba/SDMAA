package com.taekwondo.sdmaa.dto;

import com.taekwondo.sdmaa.enums.StatutDemandeSuppression;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeSuppressionCompteDTO {

    private Long id;

    private Long utilisateurId;
    private String utilisateurNom;
    private String utilisateurEmail;

    private LocalDateTime dateDemande;
    private String motif;

    private StatutDemandeSuppression statut;

    private LocalDateTime dateTraitement;
    private String commentaireAdmin;
}
