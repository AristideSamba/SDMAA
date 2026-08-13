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
public class CloudinaryDocumentService {

    /**
     * Formats acceptés pour les documents
     * personnels des adhérents.
     */
    private static final Set<String> TYPES_AUTORISES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png"
    );

    /**
     * Taille maximale :
     * 10 Mo par document.
     */
    private static final long TAILLE_MAXIMALE =
            10 * 1024 * 1024;

    private final Cloudinary cloudinary;

    /**
     * Upload d'un document vers Cloudinary.
     */
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

                                    /*
                                     * Cloudinary détecte automatiquement
                                     * s'il s'agit d'une image, d'un PDF
                                     * ou d'un fichier raw.
                                     */
                                    "resource_type", "auto"
                            )
                    );

            String url =
                    resultat.get("secure_url")
                            .toString();

            String publicId =
                    resultat.get("public_id")
                            .toString();

            String resourceType =
                    resultat.get("resource_type")
                            .toString();

            return Map.of(
                    "url", url,
                    "publicId", publicId,
                    "resourceType", resourceType
            );

        } catch (IOException exception) {
            throw new BusinessException(
                    "Impossible d'envoyer le document vers Cloudinary"
            );
        }
    }

    /**
     * Suppression d'un document Cloudinary.
     *
     * Le resourceType est nécessaire car
     * Cloudinary utilise "image" par défaut
     * lors d'une suppression.
     */
    public void supprimer(
            String publicId,
            String resourceType
    ) {
        if (
                publicId == null
                        || publicId.isBlank()
        ) {
            return;
        }

        String safeResourceType =
                resourceType == null
                        || resourceType.isBlank()
                        ? "raw"
                        : resourceType;

        try {
            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap(
                            "resource_type",
                            safeResourceType,

                            "invalidate",
                            true
                    )
            );

        } catch (IOException exception) {
            throw new BusinessException(
                    "Impossible de supprimer le document Cloudinary"
            );
        }
    }

    /**
     * Vérification avant upload.
     */
    private void verifierFichier(
            MultipartFile fichier
    ) {
        if (
                fichier == null
                        || fichier.isEmpty()
        ) {
            throw new BusinessException(
                    "Le document est obligatoire"
            );
        }

        if (
                fichier.getSize()
                        > TAILLE_MAXIMALE
        ) {
            throw new BusinessException(
                    "Le document ne doit pas dépasser 10 Mo"
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
                    "Format non autorisé. Utilisez PDF, DOC, DOCX, JPG ou PNG"
            );
        }
    }
}