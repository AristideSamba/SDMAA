package com.taekwondo.sdmaa.controller;


import com.taekwondo.sdmaa.dto.InscriptionActiviteDTO;
import com.taekwondo.sdmaa.entity.InscriptionActivite;
import com.taekwondo.sdmaa.service.InscriptionActiviteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inscriptions-activites")
@RequiredArgsConstructor
public class InscriptionActiviteController {

    private final InscriptionActiviteService service;

    @PostMapping
    public InscriptionActivite create(
            @RequestParam Long idUtilisateur,
            @RequestParam Long idActivite,
            @RequestParam(required = false) String commentaire
    ) {
        return service.create(idUtilisateur, idActivite, commentaire);
    }

    @GetMapping
    public List<InscriptionActiviteDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public InscriptionActiviteDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/utilisateur/{idUtilisateur}")
    public List<InscriptionActiviteDTO> getByUtilisateur(@PathVariable Long idUtilisateur) {
        return service.getByUtilisateur(idUtilisateur);
    }

    @PostMapping("/me")
    public InscriptionActivite createForCurrentUser(
            @RequestParam Long idActivite,
            @RequestParam(required = false) String commentaire
    ) {
        return service.createForCurrentUser(idActivite, commentaire);
    }

    @GetMapping("/me")
    public List<InscriptionActiviteDTO> getMyInscriptions() {
        return service.getMyInscriptions();
    }

    @PutMapping("/{id}/valider")
    public InscriptionActivite valider(@PathVariable Long id) {
        return service.valider(id);
    }

    @PutMapping("/{id}/refuser")
    public InscriptionActivite refuser(@PathVariable Long id) {
        return service.refuser(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
