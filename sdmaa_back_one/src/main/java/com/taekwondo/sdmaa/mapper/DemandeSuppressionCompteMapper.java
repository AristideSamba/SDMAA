package com.taekwondo.sdmaa.mapper;

import com.taekwondo.sdmaa.dto.DemandeSuppressionCompteDTO;
import com.taekwondo.sdmaa.entity.DemandeSuppressionCompte;

public class DemandeSuppressionCompteMapper {

    public static DemandeSuppressionCompteDTO toDTO(
            DemandeSuppressionCompte demande
    ) {
        return DemandeSuppressionCompteDTO.builder()
                .id(demande.getIdDemandeSuppression())

                .utilisateurId(
                        demande.getUtilisateur() != null
                                ? demande.getUtilisateur().getIdUtilisateur()
                                : null
                )

                .utilisateurNom(
                        demande.getUtilisateur() != null
                                ? (
                                    demande.getUtilisateur().getPrenom()
                                    + " "
                                    + demande.getUtilisateur().getNom()
                                  ).trim()
                                : null
                )

                .utilisateurEmail(
                        demande.getUtilisateur() != null
                                ? demande.getUtilisateur().getEmail()
                                : null
                )

                .dateDemande(demande.getDateDemande())
                .motif(demande.getMotif())
                .statut(demande.getStatut())
                .dateTraitement(demande.getDateTraitement())
                .commentaireAdmin(demande.getCommentaireAdmin())

                .build();
    }
}
