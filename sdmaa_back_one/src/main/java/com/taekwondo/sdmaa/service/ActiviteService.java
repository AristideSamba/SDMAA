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
    private final CloudinaryImageService cloudinaryImageService;

    /**
     * Créer une activité sans image.
     * L'image sera envoyée ensuite avec une route dédiée.
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

    @Transactional(readOnly = true)
    public List<ActiviteDTO> getAll() {
        return repository.findAll()
                .stream()
                .map(ActiviteMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public ActiviteDTO getById(Long id) {
        return ActiviteMapper.toDTO(
                getEntityById(id)
        );
    }

    @Transactional(readOnly = true)
    public Activite getEntityById(Long id) {
        return repository.findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Activité non trouvée avec l'id : " + id
                        )
                );
    }

    /**
     * Modifier les informations d'une activité.
     * L'image n'est pas modifiée ici.
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
     * Ajouter ou remplacer l'image d'une activité.
     */
    public ActiviteDTO updateImage(
            Long id,
            MultipartFile image
    ) {
        Activite activite =
                getEntityById(id);

        Map<String, String> resultat =
                cloudinaryImageService.uploader(
                        image,
                        DOSSIER_CLOUDINARY
                );

        String nouvelleUrl =
                resultat.get("url");

        String nouveauPublicId =
                resultat.get("publicId");

        String ancienPublicId =
                activite.getImagePublicId();

        activite.setImageActivite(
                nouvelleUrl
        );

        activite.setImagePublicId(
                nouveauPublicId
        );

        Activite activiteModifiee =
                repository.save(activite);

        if (
                ancienPublicId != null
                        && !ancienPublicId.isBlank()
                        && !ancienPublicId.equals(
                        nouveauPublicId
                )
        ) {
            cloudinaryImageService.supprimer(
                    ancienPublicId
            );
        }

        return ActiviteMapper.toDTO(
                activiteModifiee
        );
    }

    /**
     * Supprimer uniquement l'image d'une activité.
     */
    public ActiviteDTO deleteImage(Long id) {
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
     * Supprimer une activité et son image Cloudinary.
     */
    public void delete(Long id) {
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

    private String clean(String value) {
        if (value == null) {
            return null;
        }

        return XssSanitizer.clean(
                value.trim()
        );
    }

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