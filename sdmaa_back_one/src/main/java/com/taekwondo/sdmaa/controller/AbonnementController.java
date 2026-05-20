package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.entity.Abonnement;
import com.taekwondo.sdmaa.service.AbonnementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/abonnements")
@RequiredArgsConstructor
public class AbonnementController {

    private final AbonnementService service;

    @PostMapping
    public Abonnement create(@RequestBody Abonnement abonnement) {
        return service.create(abonnement);
    }

    @GetMapping
    public List<Abonnement> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Abonnement getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public Abonnement update(@PathVariable Long id, @RequestBody Abonnement abonnement) {
        return service.update(id, abonnement);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
