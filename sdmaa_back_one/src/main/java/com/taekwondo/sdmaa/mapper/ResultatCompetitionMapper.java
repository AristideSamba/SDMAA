package com.taekwondo.sdmaa.mapper;

import com.taekwondo.sdmaa.dto.ResultatCompetitionDTO;
import com.taekwondo.sdmaa.entity.ResultatCompetition;
import org.springframework.stereotype.Component;

@Component
public class ResultatCompetitionMapper {

    public ResultatCompetitionDTO toDTO(ResultatCompetition resultat) {

        if (resultat == null) {
            return null;
        }

        return ResultatCompetitionDTO.builder()
                .idResultat(resultat.getId())
                .idInscription(resultat.getInscriptionActivite().getIdInscription())

                .idUtilisateur(
                        resultat.getInscriptionActivite()
                                .getUtilisateur()
                                .getIdUtilisateur()
                )

                .nomUtilisateur(
                        resultat.getInscriptionActivite()
                                .getUtilisateur()
                                .getNom()
                )

                .prenomUtilisateur(
                        resultat.getInscriptionActivite()
                                .getUtilisateur()
                                .getPrenom()
                )

                .idActivite(
                        resultat.getInscriptionActivite()
                                .getActivite()
                                .getIdActivite()
                )

                .titreCompetition(
                        resultat.getInscriptionActivite()
                                .getActivite()
                                .getTitre()
                )

                .dateCompetition(
                        resultat.getInscriptionActivite()
                                .getActivite()
                                .getDateActivite()
                )

                .lieuCompetition(
                        resultat.getInscriptionActivite()
                                .getActivite()
                                .getLieu()
                )

                .rang(resultat.getRang())

                .nombreParticipants(
                        resultat.getNombreParticipants()
                )

                .medaille(
                        resultat.getMedaille() != null
                                ? resultat.getMedaille().name()
                                : null
                )

                .commentaireCoach(
                        resultat.getCommentaireCoach()
                )

                .build();
    }
}