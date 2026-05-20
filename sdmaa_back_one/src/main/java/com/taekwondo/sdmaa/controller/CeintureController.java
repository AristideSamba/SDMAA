package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.entity.Ceinture;
import com.taekwondo.sdmaa.service.CeintureService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ceintures")
@RequiredArgsConstructor
public class CeintureController {

    private final CeintureService service;

    @PostMapping
    public Ceinture create(@RequestBody Ceinture c) {
        return service.create(c);
    }

    @GetMapping
    public List<Ceinture> getAll() {
        return service.getAll();
    }
}