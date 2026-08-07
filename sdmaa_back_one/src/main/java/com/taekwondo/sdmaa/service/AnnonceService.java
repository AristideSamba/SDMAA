package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.AnnonceDTO;
import com.taekwondo.sdmaa.entity.Annonce;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.enums.StatutAnnonce;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.AnnonceMapper;
import com.taekwondo.sdmaa.repository.AdhesionRepository;
import com.taekwondo.sdmaa.repository.AnnonceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AnnonceService {

    private static final String
            DOSSIER_CLOUDINARY =
            "sdmaa/annonces";

    private final AnnonceRepository
            annonceRepository;

    private final AnnonceMapper
            annonceMapper;

    private final UtilisateurService
            utilisateurService;

    private final NotificationService
            notificationService;

    private final AdhesionRepository
            adhesionRepository;

    private final CloudinaryImageService
            cloudinaryImageService;

    /**
     * Crée une annonce sans image.
     *
     * L'image est envoyée ensuite par
     * la route dédiée.
     */
    public AnnonceDTO creer(
            AnnonceDTO dto
    ) {
        Utilisateur auteur =
                utilisateurService
                        .getUtilisateurConnecte();

        Annonce annonce =
                annonceMapper
                        .toEntity(dto);

        annonce.setAuteur(
                auteur
        );

        /*
         * L'image est exclusivement gérée
         * par Cloudinary.
         */
        annonce.setImage(null);
        annonce.setImagePublicId(null);

        if (annonce.getStatut() == null) {
            annonce.setStatut(
                    StatutAnnonce.BROUILLON
            );
        }

        boolean estPubliee =
                annonce.getStatut()
                        == StatutAnnonce.PUBLIEE;

        if (
                estPubliee
                        && annonce.getDatePublication()
                        == null
        ) {
            annonce.setDatePublication(
                    LocalDateTime.now()
            );
        }

        Annonce annonceEnregistree =
                annonceRepository.save(
                        annonce
                );

        if (estPubliee) {
            notifierNouvelleAnnonce(
                    annonceEnregistree
            );
        }

        return annonceMapper.toDTO(
                annonceEnregistree
        );
    }

    /**
     * Toutes les annonces.
     */
    @Transactional(readOnly = true)
    public List<AnnonceDTO> getAll() {
        return annonceRepository
                .findAll()
                .stream()
                .map(
                        annonceMapper::toDTO
                )
                .toList();
    }

    /**
     * Annonce par identifiant.
     */
    @Transactional(readOnly = true)
    public AnnonceDTO getById(
            Long id
    ) {
        return annonceMapper.toDTO(
                trouverAnnonce(id)
        );
    }

    /**
     * Toutes les annonces publiées.
     */
    @Transactional(readOnly = true)
    public List<AnnonceDTO> getPubliees() {
        return annonceRepository
                .findByStatutOrderByDatePublicationDesc(
                        StatutAnnonce.PUBLIEE
                )
                .stream()
                .map(
                        annonceMapper::toDTO
                )
                .toList();
    }

    /**
     * Cinq dernières annonces publiées.
     */
    @Transactional(readOnly = true)
    public List<AnnonceDTO>
    getDernieresAnnonces() {
        return annonceRepository
                .findTop5ByStatutOrderByDatePublicationDesc(
                        StatutAnnonce.PUBLIEE
                )
                .stream()
                .map(
                        annonceMapper::toDTO
                )
                .toList();
    }

    /**
     * Modifie une annonce.
     *
     * L'image n'est pas modifiée ici.
     */
    public AnnonceDTO modifier(
            Long id,
            AnnonceDTO dto
    ) {
        Annonce annonce =
                trouverAnnonce(id);

        StatutAnnonce ancienStatut =
                annonce.getStatut();

        annonceMapper.updateEntity(
                annonce,
                dto
        );

        if (annonce.getStatut() == null) {
            annonce.setStatut(
                    ancienStatut
            );
        }

        boolean devientPubliee =
                annonce.getStatut()
                        == StatutAnnonce.PUBLIEE
                        && ancienStatut
                        != StatutAnnonce.PUBLIEE;

        if (
                devientPubliee
                        && annonce.getDatePublication()
                        == null
        ) {
            annonce.setDatePublication(
                    LocalDateTime.now()
            );
        }

        Annonce annonceModifiee =
                annonceRepository.save(
                        annonce
                );

        if (devientPubliee) {
            notifierNouvelleAnnonce(
                    annonceModifiee
            );
        }

        return annonceMapper.toDTO(
                annonceModifiee
        );
    }

    /**
     * Ajoute ou remplace l'image
     * d'une annonce dans Cloudinary.
     */
    public AnnonceDTO updateImage(
            Long id,
            MultipartFile image
    ) {
        Annonce annonce =
                trouverAnnonce(id);

        Map<String, String> resultat =
                cloudinaryImageService
                        .uploader(
                                image,
                                DOSSIER_CLOUDINARY
                        );

        String nouvelleUrl =
                resultat.get(
                        "url"
                );

        String nouveauPublicId =
                resultat.get(
                        "publicId"
                );

        if (
                nouvelleUrl == null
                        || nouvelleUrl.isBlank()
                        || nouveauPublicId == null
                        || nouveauPublicId.isBlank()
        ) {
            throw new IllegalStateException(
                    "Cloudinary n'a pas retourné "
                            + "les informations attendues."
            );
        }

        String ancienPublicId =
                annonce.getImagePublicId();

        annonce.setImage(
                nouvelleUrl
        );

        annonce.setImagePublicId(
                nouveauPublicId
        );

        Annonce annonceModifiee =
                annonceRepository.save(
                        annonce
                );

        /*
         * L'ancienne image est supprimée
         * seulement après sauvegarde
         * de la nouvelle.
         */
        if (
                ancienPublicId != null
                        && !ancienPublicId.isBlank()
                        && !ancienPublicId.equals(
                        nouveauPublicId
                )
        ) {
            cloudinaryImageService
                    .supprimer(
                            ancienPublicId
                    );
        }

        return annonceMapper.toDTO(
                annonceModifiee
        );
    }

    /**
     * Supprime uniquement l'image.
     */
    public AnnonceDTO deleteImage(
            Long id
    ) {
        Annonce annonce =
                trouverAnnonce(id);

        String publicId =
                annonce.getImagePublicId();

        if (
                publicId != null
                        && !publicId.isBlank()
        ) {
            cloudinaryImageService
                    .supprimer(
                            publicId
                    );
        }

        annonce.setImage(null);
        annonce.setImagePublicId(null);

        Annonce annonceModifiee =
                annonceRepository.save(
                        annonce
                );

        return annonceMapper.toDTO(
                annonceModifiee
        );
    }

    /**
     * Publie une annonce.
     */
    public AnnonceDTO publier(
            Long id
    ) {
        Annonce annonce =
                trouverAnnonce(id);

        boolean etaitDejaPubliee =
                annonce.getStatut()
                        == StatutAnnonce.PUBLIEE;

        annonce.setStatut(
                StatutAnnonce.PUBLIEE
        );

        if (
                annonce.getDatePublication()
                        == null
        ) {
            annonce.setDatePublication(
                    LocalDateTime.now()
            );
        }

        Annonce annoncePubliee =
                annonceRepository.save(
                        annonce
                );

        if (!etaitDejaPubliee) {
            notifierNouvelleAnnonce(
                    annoncePubliee
            );
        }

        return annonceMapper.toDTO(
                annoncePubliee
        );
    }

    /**
     * Archive une annonce.
     */
    public AnnonceDTO archiver(
            Long id
    ) {
        Annonce annonce =
                trouverAnnonce(id);

        annonce.setStatut(
                StatutAnnonce.ARCHIVEE
        );

        Annonce annonceArchivee =
                annonceRepository.save(
                        annonce
                );

        return annonceMapper.toDTO(
                annonceArchivee
        );
    }

    /**
     * Supprime l'annonce ainsi que
     * son image Cloudinary.
     */
    public void supprimer(
            Long id
    ) {
        Annonce annonce =
                trouverAnnonce(id);

        String publicId =
                annonce.getImagePublicId();

        if (
                publicId != null
                        && !publicId.isBlank()
        ) {
            cloudinaryImageService
                    .supprimer(
                            publicId
                    );
        }

        annonceRepository.delete(
                annonce
        );
    }

    /**
     * Notification d'une nouvelle annonce.
     */
    private void notifierNouvelleAnnonce(
            Annonce annonce
    ) {
        try {
            List<Utilisateur> utilisateurs =
                    adhesionRepository
                            .findUtilisateursAvecAdhesionValidee();

            if (
                    utilisateurs == null
                            || utilisateurs.isEmpty()
            ) {
                System.out.println(
                        "Aucun utilisateur à notifier "
                                + "pour la nouvelle annonce."
                );

                return;
            }

            notificationService
                    .notifierNouvelleAnnonce(
                            annonce,
                            utilisateurs
                    );

        } catch (Exception exception) {
            System.err.println(
                    "L'annonce a bien été publiée, "
                            + "mais une erreur est survenue "
                            + "pendant l'envoi des notifications : "
                            + exception.getMessage()
            );

            exception.printStackTrace();
        }
    }

    /**
     * Recherche interne.
     */
    private Annonce trouverAnnonce(
            Long id
    ) {
        return annonceRepository
                .findById(id)
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Annonce introuvable "
                                                + "avec l'id : "
                                                + id
                                )
                );
    }
}