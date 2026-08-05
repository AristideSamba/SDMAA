package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.dto.EquipementDTO;
import com.taekwondo.sdmaa.entity.Equipement;
import com.taekwondo.sdmaa.service.EquipementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/equipements")
@RequiredArgsConstructor
public class EquipementController {

    private final EquipementService service;

    @PostMapping
    public EquipementDTO create(
            @RequestBody Equipement equipement
    ) {
        return service.create(equipement);
    }

    @GetMapping
    public List<EquipementDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public EquipementDTO getById(
            @PathVariable Long id
    ) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public EquipementDTO update(
            @PathVariable Long id,
            @RequestBody Equipement equipement
    ) {
        return service.update(id, equipement);
    }

    /**
     * Ajouter ou remplacer l'image d'un équipement.
     */
    @PostMapping(
            value = "/{id}/image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public EquipementDTO updateImage(
            @PathVariable Long id,
            @RequestPart("image") MultipartFile image
    ) {
        return service.updateImage(id, image);
    }

    /**
     * Supprimer uniquement l'image.
     */
    @DeleteMapping("/{id}/image")
    public EquipementDTO deleteImage(
            @PathVariable Long id
    ) {
        return service.deleteImage(id);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id
    ) {
        service.delete(id);
    }
}