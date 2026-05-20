package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.dto.UtilisateurDTO;
import com.taekwondo.sdmaa.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    private final UtilisateurService utilisateurService;

    @GetMapping
    public UtilisateurDTO getMe() {
        return utilisateurService.getMe();
    }
}
