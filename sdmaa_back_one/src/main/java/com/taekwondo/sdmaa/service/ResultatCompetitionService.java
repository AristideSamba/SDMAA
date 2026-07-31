package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.ResultatCompetitionDTO;
import com.taekwondo.sdmaa.entity.ResultatCompetition;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.exception.BusinessException;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.ResultatCompetitionMapper;
import com.taekwondo.sdmaa.repository.InscriptionActiviteRepository;
import com.taekwondo.sdmaa.repository.ResultatCompetitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.taekwondo.sdmaa.entity.InscriptionActivite;
import com.taekwondo.sdmaa.enums.TypeMedaille;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResultatCompetitionService {

    private final ResultatCompetitionRepository resultatCompetitionRepository;
    private final InscriptionActiviteRepository inscriptionActiviteRepository;
    private final ResultatCompetitionMapper resultatCompetitionMapper;
    private final UtilisateurService utilisateurService;

    public ResultatCompetitionDTO createResultat(
            Long idInscription,
            Integer rang,
            Integer nombreParticipants,
            TypeMedaille medaille,
            String commentaireCoach
    ) {

        InscriptionActivite inscription = inscriptionActiviteRepository
                .findById(idInscription)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Inscription introuvable avec l'id : " + idInscription
                        )
                );

        if (!"competition".equalsIgnoreCase(
                inscription.getActivite().getTypeActivite()
        )) {
            throw new RuntimeException(
                    "Cette inscription ne concerne pas une compétition."
            );
        }

        if (resultatCompetitionRepository
                .existsByInscriptionActiviteIdInscription(idInscription)) {
            throw new RuntimeException(
                    "Un résultat existe déjà pour cette inscription."
            );
        }

        if (rang == null || rang < 1) {
            throw new RuntimeException(
                    "Le rang doit être supérieur ou égal à 1."
            );
        }

        if (
                nombreParticipants != null
                        && nombreParticipants < 1
        ) {
            throw new RuntimeException(
                    "Le nombre de participants doit être supérieur ou égal à 1."
            );
        }

        if (
                nombreParticipants != null
                        && rang > nombreParticipants
        ) {
            throw new RuntimeException(
                    "Le rang ne peut pas être supérieur au nombre de participants."
            );
        }

        ResultatCompetition resultat = ResultatCompetition.builder()
                .inscriptionActivite(inscription)
                .rang(rang)
                .nombreParticipants(nombreParticipants)
                .medaille(
                        medaille != null
                                ? medaille
                                : TypeMedaille.AUCUNE
                )
                .commentaireCoach(commentaireCoach)
                .build();

        ResultatCompetition resultatEnregistre =
                resultatCompetitionRepository.save(resultat);

        return resultatCompetitionMapper.toDTO(
                resultatEnregistre
        );
    }

    public List<ResultatCompetitionDTO> getResultatsUtilisateur(
            Long idUtilisateur
    ) {

        return resultatCompetitionRepository
                .findByInscriptionActiviteUtilisateurIdUtilisateurOrderByInscriptionActiviteActiviteDateActiviteAsc(
                        idUtilisateur
                )
                .stream()
                .map(resultatCompetitionMapper::toDTO)
                .toList();
    }
    public ResultatCompetitionDTO getByInscription(
            Long idInscription
    ) {

        ResultatCompetition resultat =
                resultatCompetitionRepository
                        .findByInscriptionActiviteIdInscription(
                                idInscription
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Aucun résultat trouvé pour cette inscription."
                                )
                        );

        return resultatCompetitionMapper.toDTO(resultat);
    }

    public ResultatCompetitionDTO updateResultat(
            Long idResultat,
            Integer rang,
            Integer nombreParticipants,
            TypeMedaille medaille,
            String commentaireCoach
    ) {

        ResultatCompetition resultat = resultatCompetitionRepository
                .findById(idResultat)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Résultat de compétition non trouvé."
                        )
                );

        if (rang == null || rang < 1) {
            throw new BusinessException(
                    "Le rang doit être supérieur ou égal à 1."
            );
        }

        if (nombreParticipants != null && nombreParticipants < 1) {
            throw new BusinessException(
                    "Le nombre de participants doit être supérieur ou égal à 1."
            );
        }

        if (
                nombreParticipants != null
                        && rang > nombreParticipants
        ) {
            throw new BusinessException(
                    "Le rang ne peut pas être supérieur au nombre de participants."
            );
        }

        resultat.setRang(rang);
        resultat.setNombreParticipants(nombreParticipants);
        resultat.setMedaille(
                medaille != null ? medaille : TypeMedaille.AUCUNE
        );
        resultat.setCommentaireCoach(commentaireCoach);

        ResultatCompetition resultatMisAJour =
                resultatCompetitionRepository.save(resultat);

        return resultatCompetitionMapper.toDTO(resultatMisAJour);
    }

    public void deleteResultat(Long idResultat) {

        ResultatCompetition resultat = resultatCompetitionRepository
                .findById(idResultat)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Résultat de compétition non trouvé."
                        )
                );

        resultatCompetitionRepository.delete(resultat);
    }

    public List<ResultatCompetitionDTO> getMesResultats() {

        Utilisateur utilisateurConnecte =
                utilisateurService.getUtilisateurConnecte();

        return resultatCompetitionRepository
                .findByInscriptionActiviteUtilisateurIdUtilisateurOrderByInscriptionActiviteActiviteDateActiviteAsc(
                        utilisateurConnecte.getIdUtilisateur()
                )
                .stream()
                .map(resultatCompetitionMapper::toDTO)
                .toList();
    }

}