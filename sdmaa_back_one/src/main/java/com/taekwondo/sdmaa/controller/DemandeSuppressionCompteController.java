package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.dto.DemandeSuppressionCompteDTO;
import com.taekwondo.sdmaa.service.DemandeSuppressionCompteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/demandes-suppression")
@RequiredArgsConstructor
public class DemandeSuppressionCompteController {

    private final DemandeSuppressionCompteService service;

    /**
     * UTILISATEUR CONNECTÉ :
     * envoyer une demande de suppression.
     */
    @PostMapping("/me")
    public DemandeSuppressionCompteDTO creerMaDemande(
            @RequestParam(required = false) String motif
    ) {
        return service.creerPourUtilisateurConnecte(
                motif
        );
    }

    /**
     * UTILISATEUR CONNECTÉ :
     * récupérer sa demande la plus récente.
     */
    @GetMapping("/me")
    public DemandeSuppressionCompteDTO getMaDerniereDemande() {
        return service.getMaDerniereDemande();
    }

    /**
     * ADMIN :
     * récupérer toutes les demandes.
     */
    @GetMapping
    public List<DemandeSuppressionCompteDTO> getAll() {
        return service.getAll();
    }

    /**
     * ADMIN :
     * marquer une demande comme traitée.
     */
    @PutMapping("/{id}/traiter")
    public DemandeSuppressionCompteDTO traiter(
            @PathVariable Long id,
            @RequestParam(required = false) String commentaireAdmin
    ) {
        return service.traiter(
                id,
                commentaireAdmin
        );
    }

    /**
     * ADMIN :
     * refuser une demande.
     */
    @PutMapping("/{id}/refuser")
    public DemandeSuppressionCompteDTO refuser(
            @PathVariable Long id,
            @RequestParam(required = false) String commentaireAdmin
    ) {
        return service.refuser(
                id,
                commentaireAdmin
        );
    }
}
