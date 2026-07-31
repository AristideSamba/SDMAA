package com.taekwondo.sdmaa.mapper;

import com.taekwondo.sdmaa.dto.AnnonceDTO;
import com.taekwondo.sdmaa.entity.Annonce;
import com.taekwondo.sdmaa.entity.Utilisateur;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Component
public class AnnonceMapper {

    /**
     * Convertit une entité Annonce en DTO.
     */
    public AnnonceDTO toDTO(Annonce annonce) {

        if (annonce == null) {
            return null;
        }

        return AnnonceDTO.builder()
                .id(annonce.getId())
                .titre(annonce.getTitre())
                .contenu(annonce.getContenu())
                .image(annonce.getImage())
                .imageUrl(
                        annonce.getImage() == null
                                ? null
                                : ServletUriComponentsBuilder
                                .fromCurrentContextPath()
                                .path("/uploads/")
                                .path(annonce.getImage())
                                .toUriString()
                )
                .statut(annonce.getStatut())
                .datePublication(annonce.getDatePublication())
                .dateCreation(annonce.getDateCreation())
                .dateModification(annonce.getDateModification())

                .auteurId(
                        annonce.getAuteur() != null
                                ? annonce.getAuteur().getIdUtilisateur()
                                : null
                )

                .auteurNom(
                        annonce.getAuteur() != null
                                ?  annonce.getAuteur().getPrenom() + " " + annonce.getAuteur().getNom()
                                : null
                )

                .build();
    }

    /**
     * Convertit un DTO en entité.
     *
     * L'auteur est renseigné par le service,
     * car lui seul connaît l'utilisateur connecté.
     */
    public Annonce toEntity(AnnonceDTO dto) {

        if (dto == null) {
            return null;
        }

        return Annonce.builder()
                .id(dto.getId())
                .titre(dto.getTitre())
                .contenu(dto.getContenu())
                .image(dto.getImage())
                .statut(dto.getStatut())
                .datePublication(dto.getDatePublication())
                .build();
    }

    /**
     * Met à jour une annonce existante.
     *
     * On ne touche jamais :
     * - à l'id
     * - à l'auteur
     * - aux dates de création
     */
    public void updateEntity(
            Annonce annonce,
            AnnonceDTO dto
    ) {

        annonce.setTitre(dto.getTitre());
        annonce.setContenu(dto.getContenu());
        annonce.setImage(dto.getImage());
        annonce.setStatut(dto.getStatut());
        annonce.setDatePublication(dto.getDatePublication());
    }
}