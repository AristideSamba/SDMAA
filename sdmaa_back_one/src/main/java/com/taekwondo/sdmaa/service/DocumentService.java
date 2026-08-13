package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.DocumentDTO;
import com.taekwondo.sdmaa.entity.Activite;
import com.taekwondo.sdmaa.entity.Document;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.exception.BusinessException;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.DocumentMapper;
import com.taekwondo.sdmaa.repository.ActiviteRepository;
import com.taekwondo.sdmaa.repository.DocumentRepository;
import com.taekwondo.sdmaa.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ActiviteRepository activiteRepository;
    private final UtilisateurService utilisateurService;
    private final CloudinaryDocumentService cloudinaryDocumentService;

    /**
     * ADMIN :
     * créer manuellement un document
     * pour un utilisateur.
     */
    public Document create(
            Long idUtilisateur,
            Long idActivite,
            Document document
    ) {
        Utilisateur utilisateur =
                utilisateurRepository.findById(idUtilisateur)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Utilisateur non trouvé"
                                )
                        );

        Activite activite = null;

        if (idActivite != null) {
            activite =
                    activiteRepository.findById(idActivite)
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Activité non trouvée"
                                    )
                            );
        }

        if (
                document.getTitre() == null
                        || document.getTitre().isBlank()
        ) {
            throw new BusinessException(
                    "Le titre du document est obligatoire"
            );
        }

        if (
                document.getType() == null
                        || document.getType().isBlank()
        ) {
            throw new BusinessException(
                    "Le type du document est obligatoire"
            );
        }

        if (
                document.getUrlFichier() == null
                        || document.getUrlFichier().isBlank()
        ) {
            throw new BusinessException(
                    "L'URL du document est obligatoire"
            );
        }

        document.setUtilisateur(utilisateur);
        document.setActivite(activite);
        document.setDateUpload(LocalDate.now());
        document.setEstValide(false);

        return documentRepository.save(document);
    }

    /**
     * ADMIN :
     * récupérer tous les documents.
     */
    public List<DocumentDTO> getAll() {
        return documentRepository.findAll()
                .stream()
                .map(DocumentMapper::toDTO)
                .toList();
    }

    /**
     * ADMIN :
     * récupérer les documents
     * d'un utilisateur.
     */
    public List<DocumentDTO> getByUtilisateur(
            Long idUtilisateur
    ) {
        if (
                !utilisateurRepository.existsById(
                        idUtilisateur
                )
        ) {
            throw new ResourceNotFoundException(
                    "Utilisateur non trouvé"
            );
        }

        return documentRepository
                .findByUtilisateurIdUtilisateur(
                        idUtilisateur
                )
                .stream()
                .map(DocumentMapper::toDTO)
                .toList();
    }

    /**
     * ADHERENT :
     * récupérer ses propres documents.
     */
    public List<DocumentDTO> getMyDocuments() {
        Utilisateur utilisateur =
                utilisateurService
                        .getUtilisateurConnecte();

        return documentRepository
                .findByUtilisateurIdUtilisateur(
                        utilisateur.getIdUtilisateur()
                )
                .stream()
                .map(DocumentMapper::toDTO)
                .toList();
    }

    /**
     * Récupérer un document par son id.
     */
    public DocumentDTO getById(Long id) {
        Document document =
                documentRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Document non trouvé"
                                )
                        );

        return DocumentMapper.toDTO(
                document
        );
    }

    /**
     * ADHERENT :
     * envoyer un document personnel.
     *
     * Le fichier est stocké sur Cloudinary.
     * Le document reste en attente de validation
     * par l'administration.
     */
    public DocumentDTO uploadForCurrentUser(
            MultipartFile file,
            String titre,
            String typeDocument,
            LocalDate dateExpiration
    ) {
        Utilisateur utilisateur =
                utilisateurService
                        .getUtilisateurConnecte();

        if (
                titre == null
                        || titre.isBlank()
        ) {
            throw new BusinessException(
                    "Le titre du document est obligatoire"
            );
        }

        if (
                typeDocument == null
                        || typeDocument.isBlank()
        ) {
            throw new BusinessException(
                    "Le type du document est obligatoire"
            );
        }

        if (
                dateExpiration != null
                        && dateExpiration.isBefore(
                        LocalDate.now()
                )
        ) {
            throw new BusinessException(
                    "La date d'expiration ne peut pas être antérieure à aujourd'hui"
            );
        }

        Map<String, String> uploadResult =
                cloudinaryDocumentService.uploader(
                        file,
                        "sdmaa/documents"
                );

        String url =
                uploadResult.get("url");

        String publicId =
                uploadResult.get("publicId");

        String resourceType =
                uploadResult.get(
                        "resourceType"
                );

        if (
                url == null
                        || url.isBlank()
        ) {
            throw new BusinessException(
                    "Cloudinary n'a pas retourné d'URL valide"
            );
        }

        Document document =
                Document.builder()
                        .titre(titre.trim())
                        .type(typeDocument.trim())
                        .urlFichier(url)
                        .cloudinaryPublicId(
                                publicId
                        )
                        .cloudinaryResourceType(
                                resourceType
                        )
                        .dateUpload(
                                LocalDate.now()
                        )
                        .dateExpiration(
                                dateExpiration
                        )

                        /**
                         * Important :
                         * l'adhérent ne valide pas
                         * lui-même son document.
                         */
                        .estValide(false)

                        .utilisateur(
                                utilisateur
                        )
                        .activite(null)
                        .build();

        return DocumentMapper.toDTO(
                documentRepository.save(
                        document
                )
        );
    }

    /**
     * ADMIN :
     * valider un document.
     */
    public Document valider(Long id) {
        Document document =
                documentRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Document non trouvé"
                                )
                        );

        if (
                Boolean.TRUE.equals(
                        document.getEstValide()
                )
        ) {
            throw new BusinessException(
                    "Ce document a déjà été validé"
            );
        }

        document.setEstValide(true);

        return documentRepository.save(
                document
        );
    }

    /**
     * ADMIN :
     * supprimer un document.
     *
     * Le fichier est d'abord supprimé
     * de Cloudinary puis de la base.
     */
    public void delete(Long id) {
        Document document =
                documentRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Document non trouvé"
                                )
                        );

        String publicId =
                document.getCloudinaryPublicId();

        String resourceType =
                document.getCloudinaryResourceType();

        if (
                publicId != null
                        && !publicId.isBlank()
        ) {
            cloudinaryDocumentService.supprimer(
                    publicId,
                    resourceType
            );
        }

        documentRepository.delete(
                document
        );
    }
}