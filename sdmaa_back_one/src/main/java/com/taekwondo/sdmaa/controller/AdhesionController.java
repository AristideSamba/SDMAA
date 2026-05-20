package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.entity.Adhesion;
import com.taekwondo.sdmaa.service.AdhesionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adhesions")
@RequiredArgsConstructor
public class AdhesionController {

    private final AdhesionService service;

    @PostMapping
    public Adhesion create(
            @RequestParam Long idUtilisateur,
            @RequestParam Long idAbonnement
    ) {
        return service.create(idUtilisateur, idAbonnement);
    }

    @GetMapping
    public List<Adhesion> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Adhesion getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/utilisateur/{idUtilisateur}")
    public List<Adhesion> getByUtilisateur(@PathVariable Long idUtilisateur) {
        return service.getByUtilisateur(idUtilisateur);
    }

    @PutMapping("/{id}/valider")
    public Adhesion valider(@PathVariable Long id) {
        return service.valider(id);
    }

    @PostMapping("/me")
    public Adhesion createForCurrentUser(@RequestParam Long idAbonnement) {
        return service.createForCurrentUser(idAbonnement);
    }

    @GetMapping("/me")
    public List<Adhesion> getMyAdhesions() {
        return service.getMyAdhesions();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}