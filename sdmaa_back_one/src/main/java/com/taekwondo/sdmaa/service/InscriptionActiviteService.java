package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.InscriptionActiviteDTO;
import com.taekwondo.sdmaa.entity.Activite;
import com.taekwondo.sdmaa.entity.InscriptionActivite;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.exception.BusinessException;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.InscriptionActiviteMapper;
import com.taekwondo.sdmaa.repository.ActiviteRepository;
import com.taekwondo.sdmaa.repository.InscriptionActiviteRepository;
import com.taekwondo.sdmaa.repository.UtilisateurRepository;
import com.taekwondo.sdmaa.security.XssSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InscriptionActiviteService {

    private final InscriptionActiviteRepository
            inscriptionRepository;

    private final UtilisateurRepository
            utilisateurRepository;

    private final ActiviteRepository
            activiteRepository;

    private final UtilisateurService
            utilisateurService;

    private final NotificationService
            notificationService;

    /**
     * Inscription d'un utilisateur précis
     * à une activité.
     */
    @Transactional
    public InscriptionActivite create(
            Long idUtilisateur,
            Long idActivite,
            String commentaire
    ) {
        Utilisateur utilisateur =
                utilisateurRepository
                        .findById(idUtilisateur)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Utilisateur non trouvé"
                                )
                        );

        Activite activite =
                activiteRepository
                        .findById(idActivite)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Activité non trouvée"
                                )
                        );

        boolean dejaInscrit =
                inscriptionRepository
                        .existsByUtilisateurIdUtilisateurAndActiviteIdActivite(
                                idUtilisateur,
                                idActivite
                        );

        if (dejaInscrit) {
            throw new BusinessException(
                    "Vous êtes déjà inscrit à cette activité"
            );
        }

        /*
         * Empêche l'inscription à une activité
         * déjà passée.
         */
        if (
                activite.getDateActivite() != null
                        && activite
                        .getDateActivite()
                        .isBefore(LocalDate.now())
        ) {
            throw new BusinessException(
                    "Impossible de s'inscrire à une activité déjà passée"
            );
        }

        boolean activitePayante =
                activite.getPrix() != null
                        && activite
                        .getPrix()
                        .doubleValue() > 0;

        String statutPaiement =
                activitePayante
                        ? "en_attente"
                        : "non_requis";

        String modePaiement =
                activitePayante
                        ? "especes"
                        : null;

        String commentaireNettoye =
                commentaire != null
                        ? XssSanitizer.clean(
                        commentaire
                )
                        : null;

        InscriptionActivite inscription =
                InscriptionActivite.builder()
                        .utilisateur(utilisateur)
                        .activite(activite)
                        .dateDemande(LocalDate.now())
                        .commentaire(
                                commentaireNettoye
                        )
                        .statutInscription(
                                "en_attente"
                        )
                        .statutPaiement(
                                statutPaiement
                        )
                        .modePaiement(
                                modePaiement
                        )
                        .build();

        return inscriptionRepository.save(
                inscription
        );
    }

    /**
     * Toutes les inscriptions.
     */
    @Transactional(readOnly = true)
    public List<InscriptionActiviteDTO> getAll() {
        return inscriptionRepository
                .findAll()
                .stream()
                .map(
                        InscriptionActiviteMapper::toDTO
                )
                .toList();
    }

    /**
     * Une inscription par son identifiant.
     */
    @Transactional(readOnly = true)
    public InscriptionActiviteDTO getById(
            Long id
    ) {
        InscriptionActivite inscription =
                getEntityById(id);

        return InscriptionActiviteMapper.toDTO(
                inscription
        );
    }

    /**
     * Inscriptions d'un utilisateur précis.
     */
    @Transactional(readOnly = true)
    public List<InscriptionActiviteDTO>
    getByUtilisateur(
            Long idUtilisateur
    ) {
        utilisateurRepository
                .findById(idUtilisateur)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Utilisateur non trouvé"
                        )
                );

        return inscriptionRepository
                .findByUtilisateurIdUtilisateur(
                        idUtilisateur
                )
                .stream()
                .map(
                        InscriptionActiviteMapper::toDTO
                )
                .toList();
    }

    /**
     * Inscription de l'utilisateur connecté.
     */
    @Transactional
    public InscriptionActivite
    createForCurrentUser(
            Long idActivite,
            String commentaire
    ) {
        Utilisateur utilisateur =
                utilisateurService
                        .getUtilisateurConnecte();

        if (utilisateur == null) {
            throw new BusinessException(
                    "Utilisateur connecté introuvable"
            );
        }

        return create(
                utilisateur.getIdUtilisateur(),
                idActivite,
                commentaire
        );
    }

    /**
     * Inscriptions de l'utilisateur connecté.
     */
    @Transactional(readOnly = true)
    public List<InscriptionActiviteDTO>
    getMyInscriptions() {
        Utilisateur utilisateur =
                utilisateurService
                        .getUtilisateurConnecte();

        if (utilisateur == null) {
            throw new BusinessException(
                    "Utilisateur connecté introuvable"
            );
        }

        Long idUtilisateur =
                utilisateur.getIdUtilisateur();

        if (idUtilisateur == null) {
            throw new BusinessException(
                    "Identifiant de l'utilisateur connecté introuvable"
            );
        }

        List<InscriptionActivite> inscriptions =
                inscriptionRepository
                        .findByUtilisateurIdUtilisateur(
                                idUtilisateur
                        );

        if (inscriptions == null) {
            return List.of();
        }

        return inscriptions
                .stream()
                .map(
                        InscriptionActiviteMapper::toDTO
                )
                .toList();
    }

    /**
     * Validation d'une inscription.
     */
    @Transactional
    public InscriptionActivite valider(
            Long id
    ) {
        InscriptionActivite inscription =
                getEntityById(id);

        if (
                !"en_attente".equalsIgnoreCase(
                        inscription
                                .getStatutInscription()
                )
        ) {
            throw new BusinessException(
                    "Cette inscription a déjà été traitée"
            );
        }

        inscription.setStatutInscription(
                "validee"
        );

        inscription.setDateValidationAdmin(
                LocalDate.now()
        );

        if (
                "en_attente".equalsIgnoreCase(
                        inscription
                                .getStatutPaiement()
                )
        ) {
            inscription.setStatutPaiement(
                    "paye"
            );
        }

        InscriptionActivite
                inscriptionValidee =
                inscriptionRepository.save(
                        inscription
                );

        /*
         * Une erreur de push ne doit pas
         * empêcher la validation métier.
         */
        try {
            notificationService
                    .notifierValidationInscriptionActivite(
                            inscriptionValidee
                    );
        } catch (Exception exception) {
            System.err.println(
                    "Erreur pendant la notification "
                            + "de validation de l'inscription "
                            + inscriptionValidee.getIdInscription()
                            + " : "
                            + exception.getMessage()
            );

            exception.printStackTrace();
        }

        return inscriptionValidee;
    }

    /**
     * Refus d'une inscription.
     */
    @Transactional
    public InscriptionActivite refuser(
            Long id
    ) {
        InscriptionActivite inscription =
                getEntityById(id);

        if (
                !"en_attente".equalsIgnoreCase(
                        inscription
                                .getStatutInscription()
                )
        ) {
            throw new BusinessException(
                    "Cette inscription a déjà été traitée"
            );
        }

        inscription.setStatutInscription(
                "refusee"
        );

        inscription.setDateValidationAdmin(
                LocalDate.now()
        );

        InscriptionActivite
                inscriptionRefusee =
                inscriptionRepository.save(
                        inscription
                );

        /*
         * Une erreur de push ne doit pas
         * empêcher le refus de l'inscription.
         */
        try {
            notificationService
                    .notifierRefusInscriptionActivite(
                            inscriptionRefusee
                    );
        } catch (Exception exception) {
            System.err.println(
                    "Erreur pendant la notification "
                            + "de refus de l'inscription "
                            + inscriptionRefusee.getIdInscription()
                            + " : "
                            + exception.getMessage()
            );

            exception.printStackTrace();
        }

        return inscriptionRefusee;
    }

    /**
     * Suppression d'une inscription.
     */
    @Transactional
    public void delete(
            Long id
    ) {
        InscriptionActivite inscription =
                getEntityById(id);

        inscriptionRepository.delete(
                inscription
        );
    }

    /**
     * Recherche interne d'une inscription.
     */
    private InscriptionActivite getEntityById(
            Long id
    ) {
        return inscriptionRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Inscription à l'activité non trouvée"
                        )
                );
    }
}