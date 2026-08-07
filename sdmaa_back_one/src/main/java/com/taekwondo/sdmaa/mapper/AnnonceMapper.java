package com.taekwondo.sdmaa.mapper;

import com.taekwondo.sdmaa.dto.AnnonceDTO;
import com.taekwondo.sdmaa.entity.Annonce;
import org.springframework.stereotype.Component;

@Component
public class AnnonceMapper {

    /**
     * Convertit une entité en DTO.
     */
    public AnnonceDTO toDTO(
            Annonce annonce
    ) {
        if (annonce == null) {
            return null;
        }

        return AnnonceDTO.builder()
                .id(
                        annonce.getId()
                )
                .titre(
                        annonce.getTitre()
                )
                .contenu(
                        annonce.getContenu()
                )

                /*
                 * L'image contient directement
                 * l'URL Cloudinary.
                 */
                .image(
                        annonce.getImage()
                )

                /*
                 * Alias conservé pour les écrans
                 * utilisant encore imageUrl.
                 */
                .imageUrl(
                        annonce.getImage()
                )

                .statut(
                        annonce.getStatut()
                )
                .datePublication(
                        annonce.getDatePublication()
                )
                .dateCreation(
                        annonce.getDateCreation()
                )
                .dateModification(
                        annonce.getDateModification()
                )

                .auteurId(
                        annonce.getAuteur() != null
                                ? annonce.getAuteur()
                                .getIdUtilisateur()
                                : null
                )

                .auteurNom(
                        annonce.getAuteur() != null
                                ? construireNomAuteur(
                                annonce
                        )
                                : null
                )

                .build();
    }

    /**
     * Conversion DTO -> entité.
     *
     * L'image n'est volontairement pas prise
     * depuis le DTO.
     *
     * Elle est gérée uniquement par la route
     * Cloudinary dédiée.
     */
    public Annonce toEntity(
            AnnonceDTO dto
    ) {
        if (dto == null) {
            return null;
        }

        return Annonce.builder()
                .id(
                        dto.getId()
                )
                .titre(
                        dto.getTitre()
                )
                .contenu(
                        dto.getContenu()
                )
                .statut(
                        dto.getStatut()
                )
                .datePublication(
                        dto.getDatePublication()
                )
                .build();
    }

    /**
     * Mise à jour des informations textuelles.
     *
     * On ne modifie pas :
     * - id
     * - auteur
     * - image
     * - imagePublicId
     * - dateCreation
     */
    public void updateEntity(
            Annonce annonce,
            AnnonceDTO dto
    ) {
        annonce.setTitre(
                dto.getTitre()
        );

        annonce.setContenu(
                dto.getContenu()
        );

        annonce.setStatut(
                dto.getStatut()
        );

        annonce.setDatePublication(
                dto.getDatePublication()
        );
    }

    private String construireNomAuteur(
            Annonce annonce
    ) {
        String prenom =
                annonce.getAuteur()
                        .getPrenom();

        String nom =
                annonce.getAuteur()
                        .getNom();

        return (
                (prenom != null
                        ? prenom
                        : "")
                        + " "
                        + (nom != null
                        ? nom
                        : "")
        ).trim();
    }
}