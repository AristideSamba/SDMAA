package com.taekwondo.sdmaa.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.taekwondo.sdmaa.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CloudinaryImageService {

    private static final Set<String> TYPES_AUTORISES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private static final long TAILLE_MAXIMALE =
            5 * 1024 * 1024;

    private final Cloudinary cloudinary;

    public Map<String, String> uploader(
            MultipartFile fichier,
            String dossier
    ) {
        verifierFichier(fichier);

        try {
            Map<?, ?> resultat =
                    cloudinary.uploader().upload(
                            fichier.getBytes(),
                            ObjectUtils.asMap(
                                    "folder", dossier,
                                    "resource_type", "image"
                            )
                    );

            String url =
                    resultat.get("secure_url").toString();

            String publicId =
                    resultat.get("public_id").toString();

            return Map.of(
                    "url", url,
                    "publicId", publicId
            );

        } catch (IOException exception) {
            throw new BusinessException(
                    "Impossible d'envoyer l'image vers Cloudinary"
            );
        }
    }

    public void supprimer(String publicId) {
        if (
                publicId == null
                        || publicId.isBlank()
        ) {
            return;
        }

        try {
            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.emptyMap()
            );
        } catch (IOException exception) {
            throw new BusinessException(
                    "Impossible de supprimer l'image Cloudinary"
            );
        }
    }

    private void verifierFichier(
            MultipartFile fichier
    ) {
        if (
                fichier == null
                        || fichier.isEmpty()
        ) {
            throw new BusinessException(
                    "Le fichier image est obligatoire"
            );
        }

        if (
                fichier.getSize()
                        > TAILLE_MAXIMALE
        ) {
            throw new BusinessException(
                    "L'image ne doit pas dépasser 5 Mo"
            );
        }

        String typeContenu =
                fichier.getContentType();

        if (
                typeContenu == null
                        || !TYPES_AUTORISES.contains(
                        typeContenu
                )
        ) {
            throw new BusinessException(
                    "Format non autorisé. Utilisez JPG, PNG ou WEBP"
            );
        }
    }
}
