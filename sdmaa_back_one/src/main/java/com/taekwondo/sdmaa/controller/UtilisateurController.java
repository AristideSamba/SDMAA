package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.dto.ChangePasswordRequest;
import com.taekwondo.sdmaa.dto.UtilisateurDTO;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
public class UtilisateurController {

    private final UtilisateurService service;

    @PostMapping
    public Utilisateur create(@RequestBody Utilisateur user) {
        return service.create(user);
    }

    @GetMapping
    public List<UtilisateurDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public UtilisateurDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{idUtilisateur}/ceinture/{idCeinture}")
    public UtilisateurDTO assignerCeinture(
            @PathVariable Long idUtilisateur,
            @PathVariable Long idCeinture
    ) {
        return service.assignerCeinture(idUtilisateur, idCeinture);
    }

    @PutMapping("/me")
    public UtilisateurDTO updateMe(@RequestBody Utilisateur utilisateur) {
        return service.updateMe(utilisateur);
    }

    @PutMapping("/me/password")
    public void changerMotDePasse(@RequestBody ChangePasswordRequest request) {
        service.changerMotDePasse(request);
    }

    @PutMapping("/{id}/profil")
    public UtilisateurDTO updateProfilByAdmin(
            @PathVariable Long id,
            @RequestBody Utilisateur utilisateur
    ) {
        return service.updateProfilByAdmin(id, utilisateur);
    }

    @PutMapping("/{id}/role")
    public UtilisateurDTO updateRole(
            @PathVariable Long id,
            @RequestParam String role
    ) {
        return service.updateRole(id, role);
    }

    @PutMapping("/{id}/statut")
    public UtilisateurDTO updateStatutCompte(
            @PathVariable Long id,
            @RequestParam String statut
    ) {
        return service.updateStatutCompte(id, statut);
    }

    @PutMapping("/{id}/suspendre")
    public void suspendre(@PathVariable Long id) {
        service.suspendre(id);
    }
}
