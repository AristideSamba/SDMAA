package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.dto.AchatEquipementDTO;
import com.taekwondo.sdmaa.entity.AchatEquipement;
import com.taekwondo.sdmaa.service.AchatEquipementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achats-equipements")
@RequiredArgsConstructor
public class AchatEquipementController {

    private final AchatEquipementService service;

    @PostMapping
    public AchatEquipement create(
            @RequestParam Long idUtilisateur,
            @RequestParam Long idEquipement,
            @RequestParam Integer quantite
    ) {
        return service.create(idUtilisateur, idEquipement, quantite);
    }

    @GetMapping
    public List<AchatEquipementDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/utilisateur/{idUtilisateur}")
    public List<AchatEquipementDTO> getByUtilisateur(@PathVariable Long idUtilisateur) {
        return service.getByUtilisateur(idUtilisateur);
    }

    @PutMapping("/{id}/valider")
    public AchatEquipement valider(@PathVariable Long id) {
        return service.valider(id);
    }

    @GetMapping("/me")
    public List<AchatEquipementDTO> getMyAchats() {
        return service.getMyAchats();
    }

    @PostMapping("/me")
    public AchatEquipement createForCurrentUser(
            @RequestParam Long idEquipement,
            @RequestParam Integer quantite
    ) {
        return service.createForCurrentUser(idEquipement, quantite);
    }

    @PutMapping("/{id}/refuser")
    public AchatEquipement refuser(
            @PathVariable Long id
    ) {
        return service.refuser(id);
    }
}
