package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.entity.AffectationCours;
import com.taekwondo.sdmaa.service.AffectationCoursService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/affectations-cours")
@RequiredArgsConstructor
public class AffectationCoursController {

    private final AffectationCoursService service;

    @PostMapping
    public AffectationCours assignerCoach(
            @RequestParam Long idCours,
            @RequestParam Long idCoach
    ) {
        return service.assignerCoach(idCours, idCoach);
    }

    @GetMapping
    public List<AffectationCours> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public AffectationCours getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}/confirmer")
    public AffectationCours confirmer(@PathVariable Long id) {
        return service.confirmer(id);
    }

    @PutMapping("/{id}/refuser")
    public AffectationCours refuser(
            @PathVariable Long id,
            @RequestParam(required = false) String commentaire
    ) {
        return service.refuser(id, commentaire);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
