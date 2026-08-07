package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.dto.AnnonceDTO;
import com.taekwondo.sdmaa.service.AnnonceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/annonces")
@RequiredArgsConstructor
public class AnnonceController {

    private final AnnonceService
            annonceService;

    /**
     * Créer une annonce sans image.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'COACH')"
    )
    public AnnonceDTO creer(
            @RequestBody AnnonceDTO dto
    ) {
        return annonceService.creer(
                dto
        );
    }

    /**
     * Toutes les annonces.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<AnnonceDTO> getAll() {
        return annonceService.getAll();
    }

    /**
     * Annonce par identifiant.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public AnnonceDTO getById(
            @PathVariable Long id
    ) {
        return annonceService.getById(
                id
        );
    }

    /**
     * Annonces publiées.
     */
    @GetMapping("/publiees")
    @PreAuthorize("isAuthenticated()")
    public List<AnnonceDTO> getPubliees() {
        return annonceService
                .getPubliees();
    }

    /**
     * Cinq dernières annonces.
     */
    @GetMapping("/dernieres")
    @PreAuthorize("isAuthenticated()")
    public List<AnnonceDTO>
    getDernieresAnnonces() {
        return annonceService
                .getDernieresAnnonces();
    }

    /**
     * Modifier les informations.
     *
     * L'image n'est pas modifiée ici.
     */
    @PutMapping("/{id}")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'COACH')"
    )
    public AnnonceDTO modifier(
            @PathVariable Long id,
            @RequestBody AnnonceDTO dto
    ) {
        return annonceService.modifier(
                id,
                dto
        );
    }

    /**
     * Ajouter ou remplacer l'image.
     */
    @PostMapping("/{id}/image")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'COACH')"
    )
    public AnnonceDTO updateImage(
            @PathVariable Long id,
            @RequestParam("image")
            MultipartFile image
    ) {
        return annonceService
                .updateImage(
                        id,
                        image
                );
    }

    /**
     * Supprimer uniquement l'image.
     */
    @DeleteMapping("/{id}/image")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'COACH')"
    )
    public AnnonceDTO deleteImage(
            @PathVariable Long id
    ) {
        return annonceService
                .deleteImage(id);
    }

    /**
     * Publier.
     */
    @PutMapping("/{id}/publier")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'COACH')"
    )
    public AnnonceDTO publier(
            @PathVariable Long id
    ) {
        return annonceService
                .publier(id);
    }

    /**
     * Archiver.
     */
    @PutMapping("/{id}/archiver")
    @PreAuthorize("hasRole('ADMIN')")
    public AnnonceDTO archiver(
            @PathVariable Long id
    ) {
        return annonceService
                .archiver(id);
    }

    /**
     * Supprimer l'annonce et son image.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(
            HttpStatus.NO_CONTENT
    )
    @PreAuthorize("hasRole('ADMIN')")
    public void supprimer(
            @PathVariable Long id
    ) {
        annonceService.supprimer(
                id
        );
    }
}