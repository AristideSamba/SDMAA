package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.dto.AnnonceDTO;
import com.taekwondo.sdmaa.service.AnnonceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import com.taekwondo.sdmaa.dto.ImageUploadResponse;
import com.taekwondo.sdmaa.service.AnnonceImageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/annonces")
@RequiredArgsConstructor
public class AnnonceController {

    private final AnnonceService annonceService;
    private final AnnonceImageService annonceImageService;

    @PostMapping("/image")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    public ImageUploadResponse uploaderImage(
            @RequestParam("image") MultipartFile image
    ) {
        String chemin =
                annonceImageService.enregistrer(image);

        String url =
                ServletUriComponentsBuilder
                        .fromCurrentContextPath()
                        .path("/uploads/")
                        .path(chemin)
                        .toUriString();

        return new ImageUploadResponse(
                chemin,
                url
        );
    }

    /**
     * Créer une annonce.
     * Accessible uniquement aux administrateurs et aux coachs.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    public AnnonceDTO creer(
            @RequestBody AnnonceDTO dto
    ) {
        return annonceService.creer(dto);
    }

    /**
     * Récupérer toutes les annonces.
     * Réservé à l'administration.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<AnnonceDTO> getAll() {
        return annonceService.getAll();
    }

    /**
     * Récupérer une annonce par son identifiant.
     * Accessible aux administrateurs et aux coachs.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public AnnonceDTO getById(
            @PathVariable Long id
    ) {
        return annonceService.getById(id);
    }

    /**
     * Récupérer toutes les annonces publiées.
     * Accessible aux utilisateurs authentifiés.
     */
    @GetMapping("/publiees")
    @PreAuthorize("isAuthenticated()")
    public List<AnnonceDTO> getPubliees() {
        return annonceService.getPubliees();
    }

    /**
     * Récupérer les cinq dernières annonces publiées.
     * Accessible aux utilisateurs authentifiés.
     */
    @GetMapping("/dernieres")
    @PreAuthorize("isAuthenticated()")
    public List<AnnonceDTO> getDernieresAnnonces() {
        return annonceService.getDernieresAnnonces();
    }

    /**
     * Modifier une annonce.
     * Accessible uniquement aux administrateurs et aux coachs.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    public AnnonceDTO modifier(
            @PathVariable Long id,
            @RequestBody AnnonceDTO dto
    ) {
        return annonceService.modifier(id, dto);
    }

    /**
     * Publier une annonce.
     * Accessible uniquement aux administrateurs et aux coachs.
     */
    @PutMapping("/{id}/publier")
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    public AnnonceDTO publier(
            @PathVariable Long id
    ) {
        return annonceService.publier(id);
    }

    /**
     * Archiver une annonce.
     * Accessible uniquement aux administrateurs.
     */
    @PutMapping("/{id}/archiver")
    @PreAuthorize("hasRole('ADMIN')")
    public AnnonceDTO archiver(
            @PathVariable Long id
    ) {
        return annonceService.archiver(id);
    }

    /**
     * Supprimer définitivement une annonce.
     * Accessible uniquement aux administrateurs.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void supprimer(
            @PathVariable Long id
    ) {
        annonceService.supprimer(id);
    }
}