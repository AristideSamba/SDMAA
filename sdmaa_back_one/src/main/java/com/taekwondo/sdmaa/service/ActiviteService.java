package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.ActiviteDTO;
import com.taekwondo.sdmaa.entity.Activite;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.ActiviteMapper;
import com.taekwondo.sdmaa.repository.ActiviteRepository;
import com.taekwondo.sdmaa.security.XssSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class ActiviteService {

    private static final String DOSSIER_CLOUDINARY =
            "sdmaa/activites";

    private final ActiviteRepository repository;

    private final CloudinaryImageService
            cloudinaryImageService;

    private final NotificationService
            notificationService;

    /**
     * Crée une activité sans image.
     *
     * L'image sera envoyée ensuite avec
     * la route dédiée.
     *
     * La notification n'est pas encore envoyée ici,
     * car l'activité ne possède pas encore son image.
     */
    public ActiviteDTO create(
            Activite activite
    ) {
        sanitizeActivite(activite);

        activite.setImageActivite(null);
        activite.setImagePublicId(null);

        Activite activiteEnregistree =
                repository.save(activite);

        return ActiviteMapper.toDTO(
                activiteEnregistree
        );
    }

    /**
     * Retourne toutes les activités.
     */
    @Transactional(readOnly = true)
    public List<ActiviteDTO> getAll() {
        return repository.findAll()
                .stream()
                .map(ActiviteMapper::toDTO)
                .toList();
    }

    /**
     * Retourne une activité par son identifiant.
     */
    @Transactional(readOnly = true)
    public ActiviteDTO getById(
            Long id
    ) {
        return ActiviteMapper.toDTO(
                getEntityById(id)
        );
    }

    /**
     * Retourne directement l'entité Activite.
     */
    @Transactional(readOnly = true)
    public Activite getEntityById(
            Long id
    ) {
        return repository.findById(id)
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Activité non trouvée avec l'id : "
                                                + id
                                )
                );
    }

    /**
     * Modifie les informations d'une activité.
     *
     * L'image n'est pas modifiée ici.
     * Aucune notification "nouvelle activité"
     * n'est renvoyée pendant une modification.
     */
    public ActiviteDTO update(
            Long id,
            Activite updated
    ) {
        Activite activite =
                getEntityById(id);

        activite.setTitre(
                clean(updated.getTitre())
        );

        activite.setDescription(
                clean(updated.getDescription())
        );

        activite.setDateActivite(
                updated.getDateActivite()
        );

        activite.setDureeActivite(
                updated.getDureeActivite()
        );

        activite.setHeureDebut(
                updated.getHeureDebut()
        );

        activite.setHeureFin(
                updated.getHeureFin()
        );

        activite.setLieu(
                clean(updated.getLieu())
        );

        activite.setPrix(
                updated.getPrix()
        );

        activite.setCapaciteMax(
                updated.getCapaciteMax()
        );

        activite.setIsInternal(
                updated.getIsInternal()
        );

        activite.setTypeActivite(
                clean(updated.getTypeActivite())
        );

        activite.setLienExterne(
                cleanOptional(
                        updated.getLienExterne()
                )
        );

        activite.setCategorie(
                clean(updated.getCategorie())
        );

        activite.setDiscipline(
                clean(updated.getDiscipline())
        );

        Activite activiteModifiee =
                repository.save(activite);

        return ActiviteMapper.toDTO(
                activiteModifiee
        );
    }

    /**
     * Ajoute ou remplace l'image d'une activité.
     *
     * La notification "Nouvelle activité"
     * est envoyée uniquement lors du premier
     * ajout d'image.
     *
     * Si l'image est remplacée plus tard,
     * aucune nouvelle notification n'est envoyée.
     */
    public ActiviteDTO updateImage(
            Long id,
            MultipartFile image
    ) {
        if (
                image == null
                        || image.isEmpty()
        ) {
            throw new IllegalArgumentException(
                    "L'image de l'activité est obligatoire."
            );
        }

        Activite activite =
                getEntityById(id);

        String ancienneUrl =
                activite.getImageActivite();

        String ancienPublicId =
                activite.getImagePublicId();

        /*
         * Une première image signifie que l'activité
         * vient juste d'être entièrement créée.
         */
        boolean premiereImage =
                (
                        ancienneUrl == null
                                || ancienneUrl.isBlank()
                )
                        &&
                        (
                                ancienPublicId == null
                                        || ancienPublicId.isBlank()
                        );

        /*
         * On envoie d'abord la nouvelle image.
         * Si Cloudinary échoue, l'ancienne image
         * reste disponible.
         */
        Map<String, String> resultat =
                cloudinaryImageService.uploader(
                        image,
                        DOSSIER_CLOUDINARY
                );

        if (resultat == null) {
            throw new IllegalStateException(
                    "Cloudinary n'a retourné aucun résultat."
            );
        }

        String nouvelleUrl =
                resultat.get("url");

        String nouveauPublicId =
                resultat.get("publicId");

        if (
                nouvelleUrl == null
                        || nouvelleUrl.isBlank()
                        || nouveauPublicId == null
                        || nouveauPublicId.isBlank()
        ) {
            throw new IllegalStateException(
                    "Cloudinary n'a pas retourné une URL ou un publicId valide."
            );
        }

        activite.setImageActivite(
                nouvelleUrl
        );

        activite.setImagePublicId(
                nouveauPublicId
        );

        Activite activiteModifiee =
                repository.save(activite);

        /*
         * On supprime l'ancienne image seulement
         * après avoir enregistré la nouvelle.
         */
        if (
                ancienPublicId != null
                        && !ancienPublicId.isBlank()
                        && !ancienPublicId.equals(
                        nouveauPublicId
                )
        ) {
            try {
                cloudinaryImageService.supprimer(
                        ancienPublicId
                );
            } catch (Exception exception) {
                /*
                 * La nouvelle image est déjà enregistrée.
                 * Une erreur de suppression de l'ancienne
                 * image ne doit pas annuler l'opération.
                 */
                System.err.println(
                        "Impossible de supprimer l'ancienne image Cloudinary : "
                                + exception.getMessage()
                );
            }
        }

        /*
         * La notification est envoyée uniquement
         * à la fin de la création complète :
         * informations + image.
         */
        if (premiereImage) {
            try {
                notificationService
                        .notifierNouvelleActivite(
                                activiteModifiee
                        );
            } catch (Exception exception) {
                /*
                 * Une erreur de notification ne doit pas
                 * empêcher l'enregistrement de l'activité.
                 */
                System.err.println(
                        "Erreur pendant la notification de la nouvelle activité : "
                                + exception.getMessage()
                );

                exception.printStackTrace();
            }
        }

        return ActiviteMapper.toDTO(
                activiteModifiee
        );
    }

    /**
     * Supprime uniquement l'image d'une activité.
     */
    public ActiviteDTO deleteImage(
            Long id
    ) {
        Activite activite =
                getEntityById(id);

        String publicId =
                activite.getImagePublicId();

        if (
                publicId != null
                        && !publicId.isBlank()
        ) {
            cloudinaryImageService.supprimer(
                    publicId
            );
        }

        activite.setImageActivite(null);
        activite.setImagePublicId(null);

        Activite activiteModifiee =
                repository.save(activite);

        return ActiviteMapper.toDTO(
                activiteModifiee
        );
    }

    /**
     * Supprime une activité et son image Cloudinary.
     */
    public void delete(
            Long id
    ) {
        Activite activite =
                getEntityById(id);

        String publicId =
                activite.getImagePublicId();

        if (
                publicId != null
                        && !publicId.isBlank()
        ) {
            cloudinaryImageService.supprimer(
                    publicId
            );
        }

        repository.delete(activite);
    }

    /**
     * Nettoie les champs texte avant
     * l'enregistrement d'une activité.
     */
    private void sanitizeActivite(
            Activite activite
    ) {
        activite.setTitre(
                clean(activite.getTitre())
        );

        activite.setDescription(
                clean(activite.getDescription())
        );

        activite.setLieu(
                clean(activite.getLieu())
        );

        activite.setTypeActivite(
                clean(activite.getTypeActivite())
        );

        activite.setLienExterne(
                cleanOptional(
                        activite.getLienExterne()
                )
        );

        activite.setCategorie(
                clean(activite.getCategorie())
        );

        activite.setDiscipline(
                clean(activite.getDiscipline())
        );
    }

    /**
     * Nettoie une valeur texte.
     */
    private String clean(
            String value
    ) {
        if (value == null) {
            return null;
        }

        return XssSanitizer.clean(
                value.trim()
        );
    }

    /**
     * Nettoie une valeur facultative.
     */
    private String cleanOptional(
            String value
    ) {
        if (
                value == null
                        || value.isBlank()
        ) {
            return null;
        }

        return XssSanitizer.clean(
                value.trim()
        );
    }
}