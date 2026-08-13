package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.AchatEquipementDTO;
import com.taekwondo.sdmaa.entity.AchatEquipement;
import com.taekwondo.sdmaa.entity.Equipement;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.exception.BusinessException;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.AchatEquipementMapper;
import com.taekwondo.sdmaa.repository.AchatEquipementRepository;
import com.taekwondo.sdmaa.repository.EquipementRepository;
import com.taekwondo.sdmaa.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AchatEquipementService {

    private final AchatEquipementRepository achatRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final EquipementRepository equipementRepository;
    private final UtilisateurService utilisateurService;

    /**
     * Créer un achat pour un utilisateur.
     */
    public AchatEquipement create(
            Long idUtilisateur,
            Long idEquipement,
            Integer quantite
    ) {
        Utilisateur utilisateur =
                utilisateurRepository.findById(idUtilisateur)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Utilisateur non trouvé"
                                )
                        );

        Equipement equipement =
                equipementRepository.findById(idEquipement)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Équipement non trouvé"
                                )
                        );

        /**
         * L'équipement doit être disponible à l'achat.
         */
        if (!Boolean.TRUE.equals(equipement.getAchetable())) {
            throw new BusinessException(
                    "Cet équipement n'est pas disponible à l'achat"
            );
        }

        /**
         * Vérification de la quantité.
         */
        if (quantite == null || quantite <= 0) {
            throw new BusinessException(
                    "La quantité doit être supérieure à 0"
            );
        }

        /**
         * Le prix doit obligatoirement être renseigné
         * avant de calculer le montant total.
         */
        if (equipement.getPrixAchat() == null) {
            throw new BusinessException(
                    "Le prix de cet équipement n'est pas renseigné"
            );
        }

        /**
         * Vérification du stock disponible.
         *
         * Le stock n'est pas encore décrémenté ici.
         * Il sera décrémenté au moment où l'admin
         * validera le paiement.
         */
        if (equipement.getQuantiteDisponible() == null
                || equipement.getQuantiteDisponible() < quantite) {

            throw new BusinessException(
                    "Stock insuffisant pour cet équipement"
            );
        }

        /**
         * Calcul du montant total.
         */
        BigDecimal montantTotal =
                equipement.getPrixAchat()
                        .multiply(
                                BigDecimal.valueOf(quantite)
                        );

        AchatEquipement achat =
                AchatEquipement.builder()
                        .utilisateur(utilisateur)
                        .equipement(equipement)
                        .dateAchat(LocalDate.now())
                        .quantite(quantite)
                        .montantTotal(montantTotal)
                        .modePaiement("especes")
                        .statutPaiement("en_attente")
                        .build();

        return achatRepository.save(achat);
    }

    /**
     * ADMIN :
     * récupérer tous les achats.
     */
    public List<AchatEquipementDTO> getAll() {
        return achatRepository.findAll()
                .stream()
                .map(AchatEquipementMapper::toDTO)
                .toList();
    }

    /**
     * ADMIN :
     * récupérer les achats d'un utilisateur.
     */
    public List<AchatEquipementDTO> getByUtilisateur(
            Long idUtilisateur
    ) {
        /**
         * On vérifie que l'utilisateur existe.
         */
        if (!utilisateurRepository.existsById(idUtilisateur)) {
            throw new ResourceNotFoundException(
                    "Utilisateur non trouvé"
            );
        }

        return achatRepository
                .findByUtilisateurIdUtilisateur(idUtilisateur)
                .stream()
                .map(AchatEquipementMapper::toDTO)
                .toList();
    }

    /**
     * ADHERENT :
     * récupérer ses propres achats.
     */
    public List<AchatEquipementDTO> getMyAchats() {
        Utilisateur utilisateur =
                utilisateurService.getUtilisateurConnecte();

        return achatRepository
                .findByUtilisateurIdUtilisateur(
                        utilisateur.getIdUtilisateur()
                )
                .stream()
                .map(AchatEquipementMapper::toDTO)
                .toList();
    }

    /**
     * ADMIN :
     * valider l'achat après paiement.
     */
    public AchatEquipement valider(Long idAchat) {

        AchatEquipement achat =
                achatRepository.findById(idAchat)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Achat d'équipement non trouvé"
                                )
                        );

        /**
         * Impossible de valider deux fois.
         */
        if ("paye".equalsIgnoreCase(
                achat.getStatutPaiement()
        )) {
            throw new BusinessException(
                    "Cet achat a déjà été validé"
            );
        }

        /**
         * Impossible de valider un achat refusé.
         */
        if ("refuse".equalsIgnoreCase(
                achat.getStatutPaiement()
        )) {
            throw new BusinessException(
                    "Impossible de valider un achat refusé"
            );
        }

        Equipement equipement =
                achat.getEquipement();

        /**
         * Nouvelle vérification du stock au moment
         * de la validation.
         *
         * C'est important car le stock peut avoir
         * changé depuis la création de la demande.
         */
        if (equipement.getQuantiteDisponible() == null
                || equipement.getQuantiteDisponible()
                < achat.getQuantite()) {

            throw new BusinessException(
                    "Stock insuffisant pour valider cet achat"
            );
        }

        /**
         * Décrémentation réelle du stock.
         */
        equipement.setQuantiteDisponible(
                equipement.getQuantiteDisponible()
                        - achat.getQuantite()
        );

        equipementRepository.save(equipement);

        /**
         * Paiement validé.
         */
        achat.setStatutPaiement("paye");

        return achatRepository.save(achat);
    }

    /**
     * ADMIN :
     * refuser une demande d'achat.
     */
    public AchatEquipement refuser(Long idAchat) {

        AchatEquipement achat =
                achatRepository.findById(idAchat)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Achat d'équipement non trouvé"
                                )
                        );

        /**
         * Un achat payé ne peut plus être refusé.
         */
        if ("paye".equalsIgnoreCase(
                achat.getStatutPaiement()
        )) {
            throw new BusinessException(
                    "Impossible de refuser un achat déjà payé"
            );
        }

        /**
         * Évite de refuser plusieurs fois
         * le même achat.
         */
        if ("refuse".equalsIgnoreCase(
                achat.getStatutPaiement()
        )) {
            throw new BusinessException(
                    "Cet achat a déjà été refusé"
            );
        }

        achat.setStatutPaiement("refuse");

        return achatRepository.save(achat);
    }

    /**
     * ADHERENT :
     * créer une demande d'achat pour lui-même.
     */
    public AchatEquipement createForCurrentUser(
            Long idEquipement,
            Integer quantite
    ) {
        Utilisateur utilisateur =
                utilisateurService.getUtilisateurConnecte();

        return create(
                utilisateur.getIdUtilisateur(),
                idEquipement,
                quantite
        );
    }
}