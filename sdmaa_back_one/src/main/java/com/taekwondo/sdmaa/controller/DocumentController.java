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

    @PostMapping
    public Document create(
            @RequestParam Long idUtilisateur,
            @RequestParam(required = false) Long idActivite,
            @RequestBody Document document
    ) {
        return service.create(idUtilisateur, idActivite, document);
    }

    @GetMapping
    public List<DocumentDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public DocumentDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/utilisateur/{idUtilisateur}")
    public List<DocumentDTO> getByUtilisateur(@PathVariable Long idUtilisateur) {
        return service.getByUtilisateur(idUtilisateur);
    }

    @PostMapping("/me")
    public DocumentDTO uploadForCurrentUser(
            @RequestParam("file") MultipartFile file,
            @RequestParam String titre,
            @RequestParam String typeDocument,
            @RequestParam(required = false) LocalDate dateExpiration
    ) {
        return service.uploadForCurrentUser(file, titre, typeDocument, dateExpiration);
    }

    @GetMapping("/me")
    public List<DocumentDTO> getMyDocuments() {
        return service.getMyDocuments();
    }

    @PutMapping("/{id}/valider")
    public Document valider(@PathVariable Long id) {
        return service.valider(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
