package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.dto.EquipementDTO;
import com.taekwondo.sdmaa.entity.Equipement;
import com.taekwondo.sdmaa.service.EquipementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipements")
@RequiredArgsConstructor
public class EquipementController {

    private final EquipementService service;

    @PostMapping
    public Equipement create(@RequestBody Equipement equipement) {
        return service.create(equipement);
    }

    @GetMapping
    public List<EquipementDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public EquipementDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public Equipement update(@PathVariable Long id, @RequestBody Equipement equipement) {
        return service.update(id, equipement);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
