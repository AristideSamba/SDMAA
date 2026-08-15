package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.DemandeSuppressionCompteDTO;
import com.taekwondo.sdmaa.entity.DemandeSuppressionCompte;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.enums.StatutDemandeSuppression;
import com.taekwondo.sdmaa.exception.BusinessException;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.DemandeSuppressionCompteMapper;
import com.taekwondo.sdmaa.repository.DemandeSuppressionCompteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DemandeSuppressionCompteService {

    private final DemandeSuppressionCompteRepository repository;
    private final UtilisateurService utilisateurService;

    /**
     * ADHERENT :
     * créer une demande de suppression
     * pour le compte actuellement connecté.
     */
    @Transactional
    public DemandeSuppressionCompteDTO creerPourUtilisateurConnecte(
            String motif
    ) {
        Utilisateur utilisateur =
                utilisateurService.getUtilisateurConnecte();

        Long idUtilisateur =
                utilisateur.getIdUtilisateur();

        boolean demandeDejaEnAttente =
                repository.existsByUtilisateurIdUtilisateurAndStatut(
                        idUtilisateur,
                        StatutDemandeSuppression.EN_ATTENTE
                );

        if (demandeDejaEnAttente) {
            throw new BusinessException(
                    "Une demande de suppression est déjà en attente pour ce compte."
            );
        }

        String motifNettoye =
                motif != null && !motif.isBlank()
                        ? motif.trim()
                        : null;

        if (
                motifNettoye != null
                        && motifNettoye.length() > 1000
        ) {
            throw new BusinessException(
                    "Le motif ne doit pas dépasser 1000 caractères."
            );
        }

        DemandeSuppressionCompte demande =
                DemandeSuppressionCompte.builder()
                        .utilisateur(utilisateur)
                        .dateDemande(LocalDateTime.now())
                        .motif(motifNettoye)
                        .statut(StatutDemandeSuppression.EN_ATTENTE)
                        .build();

        return DemandeSuppressionCompteMapper.toDTO(
                repository.save(demande)
        );
    }

    /**
     * UTILISATEUR :
     * récupérer sa demande la plus récente.
     */
    @Transactional(readOnly = true)
    public DemandeSuppressionCompteDTO getMaDerniereDemande() {
        Utilisateur utilisateur =
                utilisateurService.getUtilisateurConnecte();

        return repository
                .findFirstByUtilisateurIdUtilisateurOrderByDateDemandeDesc(
                        utilisateur.getIdUtilisateur()
                )
                .map(DemandeSuppressionCompteMapper::toDTO)
                .orElse(null);
    }

    /**
     * ADMIN :
     * récupérer toutes les demandes.
     */
    @Transactional(readOnly = true)
    public List<DemandeSuppressionCompteDTO> getAll() {
        return repository
                .findAllByOrderByDateDemandeDesc()
                .stream()
                .map(DemandeSuppressionCompteMapper::toDTO)
                .toList();
    }

    /**
     * ADMIN :
     * marquer la demande comme traitée.
     *
     * Cette méthode ne supprime volontairement
     * aucune donnée automatiquement.
     */
    @Transactional
    public DemandeSuppressionCompteDTO traiter(
            Long id,
            String commentaireAdmin
    ) {
        DemandeSuppressionCompte demande =
                getEntityById(id);

        if (
                demande.getStatut()
                        != StatutDemandeSuppression.EN_ATTENTE
        ) {
            throw new BusinessException(
                    "Seule une demande en attente peut être traitée."
            );
        }

        demande.setStatut(
                StatutDemandeSuppression.TRAITEE
        );

        demande.setDateTraitement(
                LocalDateTime.now()
        );

        demande.setCommentaireAdmin(
                nettoyerCommentaire(commentaireAdmin)
        );

        return DemandeSuppressionCompteMapper.toDTO(
                repository.save(demande)
        );
    }

    /**
     * ADMIN :
     * refuser une demande.
     */
    @Transactional
    public DemandeSuppressionCompteDTO refuser(
            Long id,
            String commentaireAdmin
    ) {
        DemandeSuppressionCompte demande =
                getEntityById(id);

        if (
                demande.getStatut()
                        != StatutDemandeSuppression.EN_ATTENTE
        ) {
            throw new BusinessException(
                    "Seule une demande en attente peut être refusée."
            );
        }

        demande.setStatut(
                StatutDemandeSuppression.REFUSEE
        );

        demande.setDateTraitement(
                LocalDateTime.now()
        );

        demande.setCommentaireAdmin(
                nettoyerCommentaire(commentaireAdmin)
        );

        return DemandeSuppressionCompteMapper.toDTO(
                repository.save(demande)
        );
    }

    private DemandeSuppressionCompte getEntityById(
            Long id
    ) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Demande de suppression non trouvée."
                        )
                );
    }

    private String nettoyerCommentaire(
            String commentaire
    ) {
        if (
                commentaire == null
                        || commentaire.isBlank()
        ) {
            return null;
        }

        String valeur =
                commentaire.trim();

        if (valeur.length() > 1000) {
            throw new BusinessException(
                    "Le commentaire ne doit pas dépasser 1000 caractères."
            );
        }

        return valeur;
    }
}
