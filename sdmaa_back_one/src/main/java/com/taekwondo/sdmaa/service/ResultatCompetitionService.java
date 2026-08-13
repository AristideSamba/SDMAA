package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.ResultatCompetitionDTO;
import com.taekwondo.sdmaa.entity.InscriptionActivite;
import com.taekwondo.sdmaa.entity.ResultatCompetition;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.enums.TypeMedaille;
import com.taekwondo.sdmaa.exception.BusinessException;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.ResultatCompetitionMapper;
import com.taekwondo.sdmaa.repository.InscriptionActiviteRepository;
import com.taekwondo.sdmaa.repository.ResultatCompetitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResultatCompetitionService {

    private final ResultatCompetitionRepository resultatCompetitionRepository;
    private final InscriptionActiviteRepository inscriptionActiviteRepository;
    private final ResultatCompetitionMapper resultatCompetitionMapper;
    private final UtilisateurService utilisateurService;

    /**
     * ADMIN / COACH :
     * créer un résultat pour une inscription
     * à une compétition.
     */
    @Transactional
    public ResultatCompetitionDTO createResultat(
            Long idInscription,
            Integer rang,
            Integer nombreParticipants,
            TypeMedaille medaille,
            String commentaireCoach
    ) {

        InscriptionActivite inscription =
                inscriptionActiviteRepository
                        .findById(idInscription)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Inscription introuvable avec l'id : "
                                                + idInscription
                                )
                        );

        if (
                inscription.getActivite() == null
                        || !"competition".equalsIgnoreCase(
                        inscription.getActivite()
                                .getTypeActivite()
                )
        ) {
            throw new BusinessException(
                    "Cette inscription ne concerne pas une compétition."
            );
        }

        if (
                resultatCompetitionRepository
                        .existsByInscriptionActiviteIdInscription(
                                idInscription
                        )
        ) {
            throw new BusinessException(
                    "Un résultat existe déjà pour cette inscription."
            );
        }

        verifierResultat(
                rang,
                nombreParticipants
        );

        ResultatCompetition resultat =
                ResultatCompetition.builder()
                        .inscriptionActivite(
                                inscription
                        )
                        .rang(rang)
                        .nombreParticipants(
                                nombreParticipants
                        )
                        .medaille(
                                medaille != null
                                        ? medaille
                                        : TypeMedaille.AUCUNE
                        )
                        .commentaireCoach(
                                commentaireCoach
                        )
                        .build();

        ResultatCompetition resultatEnregistre =
                resultatCompetitionRepository.save(
                        resultat
                );

        /*
         * Le mapping est effectué pendant que
         * la transaction Hibernate est encore ouverte.
         */
        return resultatCompetitionMapper.toDTO(
                resultatEnregistre
        );
    }

    /**
     * Récupérer les résultats
     * d'un utilisateur.
     */
    @Transactional(readOnly = true)
    public List<ResultatCompetitionDTO> getResultatsUtilisateur(
            Long idUtilisateur
    ) {

        return resultatCompetitionRepository
                .findByInscriptionActiviteUtilisateurIdUtilisateurOrderByInscriptionActiviteActiviteDateActiviteAsc(
                        idUtilisateur
                )
                .stream()

                /*
                 * Le mapper peut accéder à :
                 *
                 * resultat.getInscriptionActivite()
                 * resultat.getInscriptionActivite().getActivite()
                 * resultat.getInscriptionActivite().getUtilisateur()
                 *
                 * sans LazyInitializationException.
                 */
                .map(
                        resultatCompetitionMapper::toDTO
                )
                .toList();
    }

    /**
     * Récupérer un résultat à partir
     * d'une inscription.
     */
    @Transactional(readOnly = true)
    public ResultatCompetitionDTO getByInscription(
            Long idInscription
    ) {

        ResultatCompetition resultat =
                resultatCompetitionRepository
                        .findByInscriptionActiviteIdInscription(
                                idInscription
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Aucun résultat trouvé pour cette inscription."
                                )
                        );

        return resultatCompetitionMapper.toDTO(
                resultat
        );
    }

    /**
     * ADMIN / COACH :
     * modifier un résultat existant.
     */
    @Transactional
    public ResultatCompetitionDTO updateResultat(
            Long idResultat,
            Integer rang,
            Integer nombreParticipants,
            TypeMedaille medaille,
            String commentaireCoach
    ) {

        ResultatCompetition resultat =
                resultatCompetitionRepository
                        .findById(idResultat)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Résultat de compétition non trouvé."
                                )
                        );

        verifierResultat(
                rang,
                nombreParticipants
        );

        resultat.setRang(rang);

        resultat.setNombreParticipants(
                nombreParticipants
        );

        resultat.setMedaille(
                medaille != null
                        ? medaille
                        : TypeMedaille.AUCUNE
        );

        resultat.setCommentaireCoach(
                commentaireCoach
        );

        ResultatCompetition resultatMisAJour =
                resultatCompetitionRepository.save(
                        resultat
                );

        return resultatCompetitionMapper.toDTO(
                resultatMisAJour
        );
    }

    /**
     * ADMIN :
     * supprimer un résultat.
     */
    @Transactional
    public void deleteResultat(
            Long idResultat
    ) {

        ResultatCompetition resultat =
                resultatCompetitionRepository
                        .findById(idResultat)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Résultat de compétition non trouvé."
                                )
                        );

        resultatCompetitionRepository.delete(
                resultat
        );
    }

    /**
     * ADHERENT :
     * récupérer ses propres résultats.
     *
     * C'est cette méthode qui alimente
     * /api/resultats-competitions/me.
     */
    @Transactional(readOnly = true)
    public List<ResultatCompetitionDTO> getMesResultats() {

        Utilisateur utilisateurConnecte =
                utilisateurService
                        .getUtilisateurConnecte();

        Long idUtilisateur =
                utilisateurConnecte
                        .getIdUtilisateur();

        return resultatCompetitionRepository
                .findByInscriptionActiviteUtilisateurIdUtilisateurOrderByInscriptionActiviteActiviteDateActiviteAsc(
                        idUtilisateur
                )
                .stream()

                /*
                 * IMPORTANT :
                 * le mapping reste DANS
                 * la transaction.
                 */
                .map(
                        resultatCompetitionMapper::toDTO
                )
                .toList();
    }

    /**
     * Validation commune des données
     * d'un résultat de compétition.
     */
    private void verifierResultat(
            Integer rang,
            Integer nombreParticipants
    ) {

        if (
                rang == null
                        || rang < 1
        ) {
            throw new BusinessException(
                    "Le rang doit être supérieur ou égal à 1."
            );
        }

        if (
                nombreParticipants != null
                        && nombreParticipants < 1
        ) {
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
    }
}