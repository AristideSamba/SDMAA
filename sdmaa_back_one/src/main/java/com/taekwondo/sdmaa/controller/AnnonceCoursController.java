package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.dto.AnnonceCoursDTO;
import com.taekwondo.sdmaa.entity.AnnonceCours;
import com.taekwondo.sdmaa.service.AnnonceCoursService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/annonces-cours")
@RequiredArgsConstructor
public class AnnonceCoursController {

    private final AnnonceCoursService service;

    @PostMapping
    public AnnonceCours create(
            @RequestParam Long idCours,
            @RequestBody AnnonceCours annonce
    ) {
        return service.create(idCours, annonce);
    }

    @GetMapping
    public List<AnnonceCoursDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/me")
    public List<AnnonceCoursDTO> getMesAnnonces() {
        return service.getMesAnnonces();
    }

    @GetMapping("/cours/{idCours}")
    public List<AnnonceCoursDTO> getByCours(@PathVariable Long idCours) {
        return service.getByCours(idCours);
    }

    @PutMapping("/{id}")
    public AnnonceCours update(
            @PathVariable Long id,
            @RequestBody AnnonceCours annonce
    ) {
        return service.update(id, annonce);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

}
