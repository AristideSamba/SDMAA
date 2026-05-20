package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.dto.EmpruntEquipementDTO;
import com.taekwondo.sdmaa.entity.EmpruntEquipement;
import com.taekwondo.sdmaa.service.EmpruntEquipementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/emprunts-equipements")
@RequiredArgsConstructor
public class EmpruntEquipementController {

    private final EmpruntEquipementService service;

    // ADMIN : créer un emprunt pour un utilisateur
    @PostMapping
    public EmpruntEquipement create(
            @RequestParam Long idUtilisateur,
            @RequestParam Long idEquipement,
            @RequestParam Integer quantite,
            @RequestParam LocalDate dateRetourPrevue
    ) {
        return service.create(idUtilisateur, idEquipement, quantite, dateRetourPrevue);
    }

    // ADHERENT : créer une demande pour soi-même
    @PostMapping("/me")
    public EmpruntEquipement createForCurrentUser(
            @RequestParam Long idEquipement,
            @RequestParam Integer quantite,
            @RequestParam LocalDate dateRetourPrevue
    ) {
        return service.createForCurrentUser(idEquipement, quantite, dateRetourPrevue);
    }

    // ADMIN : tous les emprunts
    @GetMapping
    public List<EmpruntEquipementDTO> getAll() {
        return service.getAll();
    }

    // ADHERENT : mes emprunts
    @GetMapping("/me")
    public List<EmpruntEquipementDTO> getMyEmprunts() {
        return service.getMyEmprunts();
    }

    // ADMIN : emprunts d'un utilisateur
    @GetMapping("/utilisateur/{idUtilisateur}")
    public List<EmpruntEquipementDTO> getByUtilisateur(@PathVariable Long idUtilisateur) {
        return service.getByUtilisateur(idUtilisateur);
    }

    // ADMIN : valider une demande
    @PutMapping("/{id}/valider")
    public EmpruntEquipement valider(@PathVariable Long id) {
        return service.valider(id);
    }

    // ADMIN : refuser une demande
    @PutMapping("/{id}/refuser")
    public EmpruntEquipement refuser(@PathVariable Long id) {
        return service.refuser(id);
    }

    // ADMIN : marquer comme rendu
    @PutMapping("/{id}/retour")
    public EmpruntEquipement retourner(@PathVariable Long id) {
        return service.retourner(id);
    }

    // ADMIN : supprimer
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}