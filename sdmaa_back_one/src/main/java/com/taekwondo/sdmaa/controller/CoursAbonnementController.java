package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.entity.CoursAbonnement;
import com.taekwondo.sdmaa.service.CoursAbonnementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cours-abonnements")
@RequiredArgsConstructor
public class CoursAbonnementController {

    private final CoursAbonnementService service;

    @PostMapping
    public CoursAbonnement lierCoursAbonnement(
            @RequestParam Long idCours,
            @RequestParam Long idAbonnement
    ) {
        return service.lierCoursAbonnement(idCours, idAbonnement);
    }

    @GetMapping
    public List<CoursAbonnement> getAll() {
        return service.getAll();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}