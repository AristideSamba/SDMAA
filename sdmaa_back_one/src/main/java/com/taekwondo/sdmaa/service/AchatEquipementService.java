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

    public AchatEquipement create(Long idUtilisateur, Long idEquipement, Integer quantite) {
        Utilisateur utilisateur = utilisateurRepository.findById(idUtilisateur)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Equipement equipement = equipementRepository.findById(idEquipement)
                .orElseThrow(() -> new ResourceNotFoundException("Équipement non trouvé"));

        if (!Boolean.TRUE.equals(equipement.getAchetable())) {
            throw new BusinessException("Cet équipement n'est pas disponible à l'achat");
        }

        if (quantite == null || quantite <= 0) {
            throw new BusinessException("La quantité doit être supérieure à 0");
        }

        if (equipement.getQuantiteDisponible() < quantite) {
            throw new BusinessException("Stock insuffisant pour cet équipement");
        }

        BigDecimal montantTotal = equipement.getPrixAchat().multiply(BigDecimal.valueOf(quantite));

        AchatEquipement achat = AchatEquipement.builder()
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

    public List<AchatEquipementDTO> getAll() {
        return achatRepository.findAll()
                .stream()
                .map(AchatEquipementMapper::toDTO)
                .toList();
    }

    public List<AchatEquipementDTO> getByUtilisateur(Long idUtilisateur) {
        return achatRepository.findByUtilisateurIdUtilisateur(idUtilisateur)
                .stream()
                .map(AchatEquipementMapper::toDTO)
                .toList();
    }

    public List<AchatEquipementDTO> getMyAchats() {
        Utilisateur utilisateur = utilisateurService.getUtilisateurConnecte();

        return achatRepository
                .findByUtilisateurIdUtilisateur(utilisateur.getIdUtilisateur())
                .stream()
                .map(AchatEquipementMapper::toDTO)
                .toList();
    }

    public AchatEquipement valider(Long idAchat) {
        AchatEquipement achat = achatRepository.findById(idAchat)
                .orElseThrow(() -> new ResourceNotFoundException("Achat d'équipement non trouvé"));

        if ("paye".equals(achat.getStatutPaiement())) {
            throw new BusinessException("Cet achat a déjà été validé");
        }

        Equipement equipement = achat.getEquipement();

        if (equipement.getQuantiteDisponible() < achat.getQuantite()) {
            throw new BusinessException("Stock insuffisant pour valider cet achat");
        }

        equipement.setQuantiteDisponible(equipement.getQuantiteDisponible() - achat.getQuantite());
        equipementRepository.save(equipement);

        achat.setStatutPaiement("paye");

        return achatRepository.save(achat);
    }

    public AchatEquipement createForCurrentUser(Long idEquipement, Integer quantite) {
        Utilisateur utilisateur = utilisateurService.getUtilisateurConnecte();

        return create(
                utilisateur.getIdUtilisateur(),
                idEquipement,
                quantite
        );
    }
}