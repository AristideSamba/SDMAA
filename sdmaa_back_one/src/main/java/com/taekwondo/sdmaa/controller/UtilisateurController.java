package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.dto.ChangePasswordRequest;
import com.taekwondo.sdmaa.dto.ImageUploadResponse;
import com.taekwondo.sdmaa.dto.UpdateProfilRequest;
import com.taekwondo.sdmaa.dto.UtilisateurDTO;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.service.UtilisateurService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
public class UtilisateurController {

    private final UtilisateurService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public Utilisateur create(@RequestBody Utilisateur utilisateur) {
        return service.create(utilisateur);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UtilisateurDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public UtilisateurDTO getMe() {
        return service.getMe();
    }

    /**
     * Modifier le nom, le prénom, l'email, le téléphone et l'adresse.
     * La date de naissance n'est pas présente dans UpdateProfilRequest.
     */
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public UtilisateurDTO updateMe(
            @Valid @RequestBody UpdateProfilRequest request
    ) {
        return service.updateMe(request);
    }

    @PutMapping("/me/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isAuthenticated()")
    public void changerMotDePasse(@RequestBody ChangePasswordRequest request) {
        service.changerMotDePasse(request);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UtilisateurDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{idUtilisateur}/ceinture/{idCeinture}")
    @PreAuthorize("hasRole('ADMIN')")
    public UtilisateurDTO assignerCeinture(
            @PathVariable Long idUtilisateur,
            @PathVariable Long idCeinture
    ) {
        return service.assignerCeinture(idUtilisateur, idCeinture);
    }

    @PutMapping("/{id}/profil")
    @PreAuthorize("hasRole('ADMIN')")
    public UtilisateurDTO updateProfilByAdmin(
            @PathVariable Long id,
            @RequestBody Utilisateur utilisateur
    ) {
        return service.updateProfilByAdmin(id, utilisateur);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public UtilisateurDTO updateRole(
            @PathVariable Long id,
            @RequestParam String role
    ) {
        return service.updateRole(id, role);
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("hasRole('ADMIN')")
    public UtilisateurDTO updateStatutCompte(
            @PathVariable Long id,
            @RequestParam String statut
    ) {
        return service.updateStatutCompte(id, statut);
    }

    @PutMapping("/{id}/suspendre")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void suspendre(@PathVariable Long id) {
        service.suspendre(id);
    }

    @PostMapping(value = "/me/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public ImageUploadResponse updateMyPhoto(
            @RequestParam("photo") MultipartFile photo
    ) {
        return service.updateMyPhoto(photo);
    }

    @DeleteMapping("/me/photo")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isAuthenticated()")
    public void deleteMyPhoto() {
        service.deleteMyPhoto();
    }
}