package com.taekwondo.sdmaa.mapper;

import com.taekwondo.sdmaa.dto.InscriptionActiviteDTO;
import com.taekwondo.sdmaa.entity.InscriptionActivite;

public class InscriptionActiviteMapper {

    public static InscriptionActiviteDTO toDTO(InscriptionActivite inscription) {
        return InscriptionActiviteDTO.builder()
                .id(inscription.getIdInscription())
                .dateDemande(inscription.getDateDemande())
                .commentaire(inscription.getCommentaire())
                .statutInscription(inscription.getStatutInscription())
                .statutPaiement(inscription.getStatutPaiement())
                .modePaiement(inscription.getModePaiement())
                .dateValidationAdmin(inscription.getDateValidationAdmin())

                .typeActivite(inscription.getActivite().getTypeActivite())
                .typeActivite(inscription.getActivite().getTypeActivite())
                .lienExterne(inscription.getActivite().getLienExterne())
                .categorie(inscription.getActivite().getCategorie())
                .discipline(inscription.getActivite().getDiscipline())
                .image(inscription.getActivite().getImageActivite())
                .lieu(inscription.getActivite().getLieu())
                .dureeActivite(inscription.getActivite().getDureeActivite())


                .utilisateurId(inscription.getUtilisateur().getIdUtilisateur())
                .utilisateurNom(inscription.getUtilisateur().getNom())
                .utilisateurPrenom(inscription.getUtilisateur().getPrenom())
                .utilisateurEmail(inscription.getUtilisateur().getEmail())

                .activiteId(inscription.getActivite().getIdActivite())
                .activiteTitre(inscription.getActivite().getTitre())
                .activiteDate(inscription.getActivite().getDateActivite())
                .activiteLieu(inscription.getActivite().getLieu())
                .build();
    }
}
