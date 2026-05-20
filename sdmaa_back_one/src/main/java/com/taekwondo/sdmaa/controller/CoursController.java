package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.dto.CoursDTO;
import com.taekwondo.sdmaa.entity.Cours;
import com.taekwondo.sdmaa.service.CoursService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cours")
@RequiredArgsConstructor
public class CoursController {

    private final CoursService service;

    @PostMapping
    public Cours create(@RequestBody Cours cours) {
        return service.create(cours);
    }

    @GetMapping
    public List<CoursDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public CoursDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }


    @GetMapping("/me")
    public List<CoursDTO> getMesCours() {
        return service.getCoursUtilisateurConnecteDTO();
    }

    @PutMapping("/{id}")
    public CoursDTO update(@PathVariable Long id, @RequestBody Cours cours) {
        return service.update(id, cours);
    }

    @PutMapping("/{id}/annuler")
    public CoursDTO annuler(@PathVariable Long id) {
        return service.annuler(id);
    }

    @PutMapping("/{id}/suspendre")
    public void suspendre(@PathVariable Long id) {
        service.suspendre(id);
    }
}
