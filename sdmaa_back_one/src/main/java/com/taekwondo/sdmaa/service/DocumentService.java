package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.DocumentDTO;
import com.taekwondo.sdmaa.entity.Activite;
import com.taekwondo.sdmaa.enums.CategorieDocument;
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
import org.springframework.transaction.annotation.Transactional;
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
     * créer manuellement un document personnel
     * pour un utilisateur.
     */
    @Transactional
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

        verifierTitreEtType(
                document.getTitre(),
                document.getType()
        );

        if (
                document.getUrlFichier() == null
                        || document.getUrlFichier().isBlank()
        ) {
            throw new BusinessException(
                    "L'URL du document est obligatoire"
            );
        }

        verifierDateExpiration(
                document.getDateExpiration()
        );

        document.setUtilisateur(
                utilisateur
        );

        document.setActivite(
                activite
        );

        document.setCategorieDocument(
                CategorieDocument.PERSONNEL
        );

        document.setDateUpload(
                LocalDate.now()
        );

        document.setEstValide(
                false
        );

        return documentRepository.save(
                document
        );
    }

    /**
     * ADMIN :
     * récupérer tous les documents.
     */
    @Transactional(readOnly = true)
    public List<DocumentDTO> getAll() {

        return documentRepository
                .findAll()
                .stream()
                .map(DocumentMapper::toDTO)
                .toList();
    }

    /**
     * ADMIN :
     * récupérer les documents
     * d'un utilisateur.
     */
    @Transactional(readOnly = true)
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
     * récupérer ses documents personnels.
     */
    @Transactional(readOnly = true)
    public List<DocumentDTO> getMyDocuments() {

        Utilisateur utilisateur =
                utilisateurService
                        .getUtilisateurConnecte();

        return documentRepository
                .findByUtilisateurIdUtilisateurAndCategorieDocumentOrderByDateUploadDesc(
                        utilisateur.getIdUtilisateur(),
                        CategorieDocument.PERSONNEL
                )
                .stream()
                .map(DocumentMapper::toDTO)
                .toList();
    }

    /**
     * MEMBRE AUTHENTIFIÉ :
     * récupérer les documents publiés
     * par le club.
     */
    @Transactional(readOnly = true)
    public List<DocumentDTO> getClubDocuments() {

        return documentRepository
                .findByCategorieDocumentOrderByDateUploadDesc(
                        CategorieDocument.CLUB
                )
                .stream()
                .map(DocumentMapper::toDTO)
                .toList();
    }

    /**
     * Récupérer un document
     * à partir de son identifiant.
     */
    @Transactional(readOnly = true)
    public DocumentDTO getById(
            Long id
    ) {

        Document document =
                documentRepository
                        .findById(id)
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
     * Il reste ensuite en attente
     * de validation admin.
     */
    @Transactional
    public DocumentDTO uploadForCurrentUser(
            MultipartFile file,
            String titre,
            String typeDocument,
            LocalDate dateExpiration
    ) {

        Utilisateur utilisateur =
                utilisateurService
                        .getUtilisateurConnecte();

        verifierTitreEtType(
                titre,
                typeDocument
        );

        verifierDateExpiration(
                dateExpiration
        );

        Map<String, String> uploadResult =
                cloudinaryDocumentService
                        .uploader(
                                file,
                                "sdmaa/documents/personnels"
                        );

        String url =
                uploadResult.get(
                        "url"
                );

        String publicId =
                uploadResult.get(
                        "publicId"
                );

        String resourceType =
                uploadResult.get(
                        "resourceType"
                );

        verifierResultatCloudinary(
                url,
                publicId
        );

        Document document =
                Document.builder()
                        .titre(
                                titre.trim()
                        )
                        .type(
                                typeDocument.trim()
                        )
                        .urlFichier(
                                url
                        )
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
                        .estValide(
                                false
                        )
                        .categorieDocument(
                                CategorieDocument.PERSONNEL
                        )
                        .utilisateur(
                                utilisateur
                        )
                        .activite(
                                null
                        )
                        .build();

        Document saved =
                documentRepository.save(
                        document
                );

        return DocumentMapper.toDTO(
                saved
        );
    }

    /**
     * ADMIN :
     * publier un document destiné
     * à tous les membres du club.
     *
     * Un document du club n'appartient
     * pas à un utilisateur précis.
     */
    @Transactional
    public DocumentDTO uploadClubDocument(
            MultipartFile file,
            String titre,
            String typeDocument,
            LocalDate dateExpiration,
            Long idActivite
    ) {

        verifierTitreEtType(
                titre,
                typeDocument
        );

        verifierDateExpiration(
                dateExpiration
        );

        Activite activite = null;

        if (idActivite != null) {

            activite =
                    activiteRepository
                            .findById(
                                    idActivite
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Activité non trouvée"
                                    )
                            );
        }

        Map<String, String> uploadResult =
                cloudinaryDocumentService
                        .uploader(
                                file,
                                "sdmaa/documents/club"
                        );

        String url =
                uploadResult.get(
                        "url"
                );

        String publicId =
                uploadResult.get(
                        "publicId"
                );

        String resourceType =
                uploadResult.get(
                        "resourceType"
                );

        verifierResultatCloudinary(
                url,
                publicId
        );

        Document document =
                Document.builder()
                        .titre(
                                titre.trim()
                        )
                        .type(
                                typeDocument.trim()
                        )
                        .urlFichier(
                                url
                        )
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

                        /*
                         * Un document du club
                         * est directement disponible.
                         */
                        .estValide(
                                true
                        )

                        .categorieDocument(
                                CategorieDocument.CLUB
                        )

                        /*
                         * Important :
                         * pas d'utilisateur lié.
                         */
                        .utilisateur(
                                null
                        )

                        .activite(
                                activite
                        )
                        .build();

        Document saved =
                documentRepository.save(
                        document
                );

        return DocumentMapper.toDTO(
                saved
        );
    }

    /**
     * ADMIN :
     * valider un document personnel.
     */
    @Transactional
    public Document valider(
            Long id
    ) {

        Document document =
                documentRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Document non trouvé"
                                )
                        );

        if (
                document.getCategorieDocument()
                        == CategorieDocument.CLUB
        ) {
            throw new BusinessException(
                    "Un document du club n'a pas besoin d'être validé"
            );
        }

        if (
                Boolean.TRUE.equals(
                        document.getEstValide()
                )
        ) {
            throw new BusinessException(
                    "Ce document a déjà été validé"
            );
        }

        document.setEstValide(
                true
        );

        return documentRepository.save(
                document
        );
    }

    /**
     * ADMIN :
     * supprimer un document.
     *
     * Suppression :
     * 1. Cloudinary
     * 2. Base de données
     */
    @Transactional
    public void delete(
            Long id
    ) {

        Document document =
                documentRepository
                        .findById(id)
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
            cloudinaryDocumentService
                    .supprimer(
                            publicId,
                            resourceType
                    );
        }

        documentRepository.delete(
                document
        );
    }

    /**
     * Vérification commune :
     * titre + type.
     */
    private void verifierTitreEtType(
            String titre,
            String typeDocument
    ) {

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
    }

    /**
     * La date d'expiration
     * est facultative.
     */
    private void verifierDateExpiration(
            LocalDate dateExpiration
    ) {

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
    }

    /**
     * Vérifier que Cloudinary
     * a bien retourné les informations
     * nécessaires.
     */
    private void verifierResultatCloudinary(
            String url,
            String publicId
    ) {

        if (
                url == null
                        || url.isBlank()
        ) {
            throw new BusinessException(
                    "Cloudinary n'a pas retourné d'URL valide"
            );
        }

        if (
                publicId == null
                        || publicId.isBlank()
        ) {
            throw new BusinessException(
                    "Cloudinary n'a pas retourné de publicId valide"
            );
        }
    }
}