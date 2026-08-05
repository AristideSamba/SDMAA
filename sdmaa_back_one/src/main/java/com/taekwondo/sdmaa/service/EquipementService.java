package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.EquipementDTO;
import com.taekwondo.sdmaa.entity.Equipement;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.EquipementMapper;
import com.taekwondo.sdmaa.repository.EquipementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class EquipementService {

    private static final String DOSSIER_CLOUDINARY =
            "sdmaa/equipements";

    private final EquipementRepository repository;
    private final CloudinaryImageService cloudinaryImageService;

    /**
     * Créer un équipement sans image.
     * L'image pourra être ajoutée ensuite
     * avec la route d'upload Cloudinary.
     */
    public EquipementDTO create(Equipement equipement) {

        /*
         * L'URL et le publicId Cloudinary ne doivent pas
         * être fournis manuellement lors de la création.
         */
        equipement.setLienImage(null);
        equipement.setImagePublicId(null);

        Equipement equipementEnregistre =
                repository.save(equipement);

        return EquipementMapper.toDTO(
                equipementEnregistre
        );
    }

    /**
     * Récupérer tous les équipements.
     */
    @Transactional(readOnly = true)
    public List<EquipementDTO> getAll() {

        return repository.findAll()
                .stream()
                .map(EquipementMapper::toDTO)
                .toList();
    }

    /**
     * Récupérer un équipement par son identifiant.
     */
    @Transactional(readOnly = true)
    public EquipementDTO getById(Long id) {

        Equipement equipement =
                getEntityById(id);

        return EquipementMapper.toDTO(
                equipement
        );
    }

    /**
     * Récupérer l'entité Equipement.
     */
    @Transactional(readOnly = true)
    public Equipement getEntityById(Long id) {

        return repository.findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Équipement non trouvé avec l'id : " + id
                        )
                );
    }

    /**
     * Modifier les informations d'un équipement.
     * L'image n'est pas modifiée dans cette méthode.
     */
    public EquipementDTO update(
            Long id,
            Equipement updated
    ) {

        Equipement equipement =
                getEntityById(id);

        equipement.setNom(
                updated.getNom()
        );

        equipement.setType(
                updated.getType()
        );

        equipement.setTaille(
                updated.getTaille()
        );

        equipement.setQuantiteDisponible(
                updated.getQuantiteDisponible()
        );

        equipement.setPrixAchat(
                updated.getPrixAchat()
        );

        equipement.setAchetable(
                updated.getAchetable()
        );

        equipement.setEmpruntable(
                updated.getEmpruntable()
        );

        equipement.setDescription(
                updated.getDescription()
        );

        equipement.setCategorie(
                updated.getCategorie()
        );

        Equipement equipementModifie =
                repository.save(equipement);

        return EquipementMapper.toDTO(
                equipementModifie
        );
    }

    /**
     * Ajouter ou remplacer l'image d'un équipement.
     */
    public EquipementDTO updateImage(
            Long id,
            MultipartFile image
    ) {

        Equipement equipement =
                getEntityById(id);

        /*
         * On envoie d'abord la nouvelle image.
         * Si l'upload échoue, l'ancienne image
         * reste disponible.
         */
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
                equipement.getImagePublicId();

        equipement.setLienImage(
                nouvelleUrl
        );

        equipement.setImagePublicId(
                nouveauPublicId
        );

        Equipement equipementModifie =
                repository.save(equipement);

        /*
         * On supprime l'ancienne image uniquement
         * après l'enregistrement réussi de la nouvelle.
         */
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

        return EquipementMapper.toDTO(
                equipementModifie
        );
    }

    /**
     * Supprimer uniquement l'image de l'équipement.
     */
    public EquipementDTO deleteImage(Long id) {

        Equipement equipement =
                getEntityById(id);

        String publicId =
                equipement.getImagePublicId();

        /*
         * On supprime d'abord l'image Cloudinary.
         * Si cette suppression échoue, les données
         * de la base restent inchangées.
         */
        if (
                publicId != null
                        && !publicId.isBlank()
        ) {
            cloudinaryImageService.supprimer(
                    publicId
            );
        }

        equipement.setLienImage(null);
        equipement.setImagePublicId(null);

        Equipement equipementModifie =
                repository.save(equipement);

        return EquipementMapper.toDTO(
                equipementModifie
        );
    }

    /**
     * Supprimer un équipement et son image Cloudinary.
     */
    public void delete(Long id) {

        Equipement equipement =
                getEntityById(id);

        String publicId =
                equipement.getImagePublicId();

        /*
         * L'image est supprimée de Cloudinary
         * avant la suppression de l'équipement.
         */
        if (
                publicId != null
                        && !publicId.isBlank()
        ) {
            cloudinaryImageService.supprimer(
                    publicId
            );
        }

        repository.delete(
                equipement
        );
    }
}