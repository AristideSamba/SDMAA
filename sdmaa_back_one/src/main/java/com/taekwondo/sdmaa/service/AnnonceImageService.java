package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class AnnonceImageService {

    private static final Path DOSSIER_UPLOAD =
            Paths.get("uploads", "annonces");

    private static final Set<String> TYPES_AUTORISES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private static final long TAILLE_MAXIMALE = 5 * 1024 * 1024;

    public String enregistrer(MultipartFile fichier) {

        verifierFichier(fichier);

        try {
            Files.createDirectories(DOSSIER_UPLOAD);

            String nomOriginal = fichier.getOriginalFilename();

            String extension = recupererExtension(nomOriginal);

            String nouveauNom =
                    UUID.randomUUID() + extension;

            Path destination =
                    DOSSIER_UPLOAD.resolve(nouveauNom).normalize();

            Files.copy(
                    fichier.getInputStream(),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return "annonces/" + nouveauNom;

        } catch (IOException exception) {
            throw new BusinessException(
                    "Impossible d'enregistrer l'image de l'annonce"
            );
        }
    }

    public void supprimer(String cheminImage) {

        if (cheminImage == null || cheminImage.isBlank()) {
            return;
        }

        try {
            String nomFichier =
                    Paths.get(cheminImage).getFileName().toString();

            Path chemin =
                    DOSSIER_UPLOAD.resolve(nomFichier).normalize();

            Files.deleteIfExists(chemin);

        } catch (IOException exception) {
            throw new BusinessException(
                    "Impossible de supprimer l'image de l'annonce"
            );
        }
    }

    private void verifierFichier(MultipartFile fichier) {

        if (fichier == null || fichier.isEmpty()) {
            throw new BusinessException(
                    "Le fichier image est obligatoire"
            );
        }

        if (fichier.getSize() > TAILLE_MAXIMALE) {
            throw new BusinessException(
                    "L'image ne doit pas dépasser 5 Mo"
            );
        }

        String typeContenu = fichier.getContentType();

        if (
                typeContenu == null
                        || !TYPES_AUTORISES.contains(typeContenu)
        ) {
            throw new BusinessException(
                    "Format non autorisé. Utilisez JPG, PNG ou WEBP"
            );
        }

        String nomOriginal = fichier.getOriginalFilename();

        if (nomOriginal == null || nomOriginal.isBlank()) {
            throw new BusinessException(
                    "Nom de fichier invalide"
            );
        }
    }

    private String recupererExtension(String nomFichier) {

        int positionPoint = nomFichier.lastIndexOf(".");

        if (
                positionPoint == -1
                        || positionPoint == nomFichier.length() - 1
        ) {
            throw new BusinessException(
                    "Le fichier ne possède pas d'extension valide"
            );
        }

        return nomFichier
                .substring(positionPoint)
                .toLowerCase();
    }
}