package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.dto.DocumentDTO;
import com.taekwondo.sdmaa.entity.Document;
import com.taekwondo.sdmaa.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService service;

    /**
     * ADMIN :
     * créer manuellement un document personnel
     * pour un utilisateur.
     */
    @PostMapping
    public Document create(
            @RequestParam Long idUtilisateur,
            @RequestParam(required = false) Long idActivite,
            @RequestBody Document document
    ) {
        return service.create(
                idUtilisateur,
                idActivite,
                document
        );
    }

    /**
     * ADMIN :
     * récupérer tous les documents.
     */
    @GetMapping
    public List<DocumentDTO> getAll() {
        return service.getAll();
    }

    /**
     * ADHERENT :
     * récupérer ses documents personnels.
     */
    @GetMapping("/me")
    public List<DocumentDTO> getMyDocuments() {
        return service.getMyDocuments();
    }

    /**
     * ADHERENT :
     * envoyer un document personnel.
     */
    @PostMapping("/me")
    public DocumentDTO uploadForCurrentUser(
            @RequestParam("file") MultipartFile file,
            @RequestParam String titre,
            @RequestParam String typeDocument,
            @RequestParam(required = false) LocalDate dateExpiration
    ) {
        return service.uploadForCurrentUser(
                file,
                titre,
                typeDocument,
                dateExpiration
        );
    }

    /**
     * MEMBRES AUTHENTIFIÉS :
     * récupérer les documents publiés
     * par le club.
     */
    @GetMapping("/club")
    public List<DocumentDTO> getClubDocuments() {
        return service.getClubDocuments();
    }

    /**
     * ADMIN :
     * publier un document du club.
     */
    @PostMapping("/club")
    public DocumentDTO uploadClubDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam String titre,
            @RequestParam String typeDocument,
            @RequestParam(required = false) LocalDate dateExpiration,
            @RequestParam(required = false) Long idActivite
    ) {
        return service.uploadClubDocument(
                file,
                titre,
                typeDocument,
                dateExpiration,
                idActivite
        );
    }

    /**
     * Récupérer un document précis.
     *
     * On utilise /detail/{id}
     * pour éviter les conflits avec
     * /me ou /club.
     */
    @GetMapping("/detail/{id}")
    public DocumentDTO getById(
            @PathVariable Long id
    ) {
        return service.getById(id);
    }

    /**
     * ADMIN :
     * récupérer les documents
     * d'un utilisateur précis.
     */
    @GetMapping("/utilisateur/{idUtilisateur}")
    public List<DocumentDTO> getByUtilisateur(
            @PathVariable Long idUtilisateur
    ) {
        return service.getByUtilisateur(
                idUtilisateur
        );
    }

    /**
     * ADMIN :
     * valider un document personnel.
     */
    @PutMapping("/detail/{id}/valider")
    public Document valider(
            @PathVariable Long id
    ) {
        return service.valider(id);
    }

    /**
     * ADMIN :
     * supprimer un document.
     */
    @DeleteMapping("/detail/{id}")
    public void delete(
            @PathVariable Long id
    ) {
        service.delete(id);
    }
}