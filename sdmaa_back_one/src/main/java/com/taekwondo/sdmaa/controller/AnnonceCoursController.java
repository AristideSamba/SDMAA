package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.dto.AnnonceCoursDTO;
import com.taekwondo.sdmaa.entity.AnnonceCours;
import com.taekwondo.sdmaa.service.AnnonceCoursService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/annonces-cours")
@RequiredArgsConstructor
public class AnnonceCoursController {

    private final AnnonceCoursService service;

    @PostMapping("/cours/{idCours}")
    public ResponseEntity<AnnonceCours> create(
            @PathVariable Long idCours,
            @RequestBody AnnonceCours annonce
    ) {
        return ResponseEntity.ok(
                service.create(idCours, annonce)
        );
    }

    @GetMapping
    public ResponseEntity<List<AnnonceCoursDTO>> getAll() {
        return ResponseEntity.ok(
                service.getAll()
        );
    }

    @GetMapping("/cours/{idCours}")
    public ResponseEntity<List<AnnonceCoursDTO>> getByCours(
            @PathVariable Long idCours
    ) {
        return ResponseEntity.ok(
                service.getByCours(idCours)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnnonceCours> update(
            @PathVariable Long id,
            @RequestBody AnnonceCours annonce
    ) {
        return ResponseEntity.ok(
                service.update(id, annonce)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {
        service.delete(id);

        return ResponseEntity.noContent().build();
    }
}