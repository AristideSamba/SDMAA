package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.dto.ActiviteDTO;
import com.taekwondo.sdmaa.entity.Activite;
import com.taekwondo.sdmaa.service.ActiviteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activites")
@RequiredArgsConstructor
public class ActiviteController {

    private final ActiviteService service;

    @PostMapping
    public Activite create(@RequestBody Activite activite) {
        return service.create(activite);
    }

    @GetMapping
    public List<ActiviteDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ActiviteDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public Activite update(@PathVariable Long id, @RequestBody Activite activite) {
        return service.update(id, activite);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
