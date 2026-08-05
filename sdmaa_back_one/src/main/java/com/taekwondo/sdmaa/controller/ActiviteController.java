package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.dto.ActiviteDTO;
import com.taekwondo.sdmaa.entity.Activite;
import com.taekwondo.sdmaa.service.ActiviteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/activites")
@RequiredArgsConstructor
public class ActiviteController {

    private final ActiviteService service;

    /**
     * Créer une activité sans image.
     */
    @PostMapping
    public ActiviteDTO create(
            @RequestBody Activite activite
    ) {
        return service.create(activite);
    }

    /**
     * Récupérer toutes les activités.
     */
    @GetMapping
    public List<ActiviteDTO> getAll() {
        return service.getAll();
    }

    /**
     * Récupérer une activité par son identifiant.
     */
    @GetMapping("/{id}")
    public ActiviteDTO getById(
            @PathVariable Long id
    ) {
        return service.getById(id);
    }

    /**
     * Modifier une activité sans modifier son image.
     */
    @PutMapping("/{id}")
    public ActiviteDTO update(
            @PathVariable Long id,
            @RequestBody Activite activite
    ) {
        return service.update(id, activite);
    }

    /**
     * Ajouter ou remplacer l'image d'une activité.
     */
    @PostMapping(
            value = "/{id}/image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ActiviteDTO updateImage(
            @PathVariable Long id,
            @RequestPart("image") MultipartFile image
    ) {
        return service.updateImage(id, image);
    }

    /**
     * Supprimer uniquement l'image d'une activité.
     */
    @DeleteMapping("/{id}/image")
    public ActiviteDTO deleteImage(
            @PathVariable Long id
    ) {
        return service.deleteImage(id);
    }

    /**
     * Supprimer complètement une activité.
     */
    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id
    ) {
        service.delete(id);
    }
}