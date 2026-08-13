package com.taekwondo.sdmaa.mapper;

import com.taekwondo.sdmaa.dto.DocumentDTO;
import com.taekwondo.sdmaa.entity.Document;

public class DocumentMapper {

    public static DocumentDTO toDTO(Document document) {

        return DocumentDTO.builder()
                .id(document.getIdDocument())
                .titre(document.getTitre())
                .type(document.getType())
                .urlFichier(document.getUrlFichier())
                .dateUpload(document.getDateUpload())
                .dateExpiration(document.getDateExpiration())
                .estValide(document.getEstValide())

                .categorieDocument(
                        document.getCategorieDocument()
                )

                .utilisateurId(
                        document.getUtilisateur() != null
                                ? document.getUtilisateur()
                                .getIdUtilisateur()
                                : null
                )

                .utilisateurNom(
                        document.getUtilisateur() != null
                                ? document.getUtilisateur().getPrenom()
                                + " "
                                + document.getUtilisateur().getNom()
                                : null
                )

                .activiteId(
                        document.getActivite() != null
                                ? document.getActivite()
                                .getIdActivite()
                                : null
                )

                .activiteTitre(
                        document.getActivite() != null
                                ? document.getActivite()
                                .getTitre()
                                : null
                )

                .build();
    }
}