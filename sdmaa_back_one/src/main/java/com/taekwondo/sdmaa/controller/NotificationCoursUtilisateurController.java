package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.dto.NotificationCoursUtilisateurDTO;
import com.taekwondo.sdmaa.service.AnnonceCoursService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/annonces-cours")
@RequiredArgsConstructor
public class NotificationCoursUtilisateurController {

    private final AnnonceCoursService annonceCoursService;

    @GetMapping("/me")
    public ResponseEntity<List<NotificationCoursUtilisateurDTO>>
    getMesAnnonces() {
        return ResponseEntity.ok(
                annonceCoursService.getMesAnnonces()
        );
    }

    @PatchMapping("/{id}/lire")
    public ResponseEntity<NotificationCoursUtilisateurDTO>
    marquerCommeLue(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                annonceCoursService.marquerCommeLue(id)
        );
    }

    @GetMapping("/me/non-lues/count")
    public ResponseEntity<Map<String, Long>>
    compterMesNotificationsNonLues() {
        long count =
                annonceCoursService
                        .compterMesNotificationsNonLues();

        return ResponseEntity.ok(
                Map.of("count", count)
        );
    }
}