package com.taekwondo.sdmaa.controller;

import com.taekwondo.sdmaa.dto.ResultatCompetitionDTO;
import com.taekwondo.sdmaa.enums.TypeMedaille;
import com.taekwondo.sdmaa.service.ResultatCompetitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resultats-competitions")
@RequiredArgsConstructor
public class ResultatCompetitionController {

    private final ResultatCompetitionService resultatCompetitionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResultatCompetitionDTO createResultat(
            @RequestParam Long idInscription,
            @RequestParam Integer rang,
            @RequestParam(required = false) Integer nombreParticipants,
            @RequestParam(required = false) TypeMedaille medaille,
            @RequestParam(required = false) String commentaireCoach
    ) {

        return resultatCompetitionService.createResultat(
                idInscription,
                rang,
                nombreParticipants,
                medaille,
                commentaireCoach
        );
    }

    @GetMapping("/me")
    public List<ResultatCompetitionDTO> getMesResultats() {
        return resultatCompetitionService.getMesResultats();
    }

    @GetMapping("/utilisateur/{idUtilisateur}")
    public List<ResultatCompetitionDTO> getResultatsUtilisateur(
            @PathVariable Long idUtilisateur
    ) {

        return resultatCompetitionService
                .getResultatsUtilisateur(idUtilisateur);
    }

    @GetMapping("/inscription/{idInscription}")
    public ResultatCompetitionDTO getByInscription(
            @PathVariable Long idInscription
    ) {

        return resultatCompetitionService
                .getByInscription(idInscription);
    }

    @PutMapping("/{idResultat}")
    public ResultatCompetitionDTO updateResultat(
            @PathVariable Long idResultat,
            @RequestParam Integer rang,
            @RequestParam(required = false) Integer nombreParticipants,
            @RequestParam(required = false) TypeMedaille medaille,
            @RequestParam(required = false) String commentaireCoach
    ) {

        return resultatCompetitionService.updateResultat(
                idResultat,
                rang,
                nombreParticipants,
                medaille,
                commentaireCoach
        );
    }

    @DeleteMapping("/{idResultat}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteResultat(
            @PathVariable Long idResultat
    ) {

        resultatCompetitionService.deleteResultat(idResultat);
    }
}