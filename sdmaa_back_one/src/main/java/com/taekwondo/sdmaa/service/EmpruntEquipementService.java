package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.EmpruntEquipementDTO;
import com.taekwondo.sdmaa.entity.EmpruntEquipement;
import com.taekwondo.sdmaa.entity.Equipement;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.exception.BusinessException;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.EmpruntEquipementMapper;
import com.taekwondo.sdmaa.repository.EmpruntEquipementRepository;
import com.taekwondo.sdmaa.repository.EquipementRepository;
import com.taekwondo.sdmaa.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmpruntEquipementService {

    private final EmpruntEquipementRepository empruntRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final EquipementRepository equipementRepository;
    private final UtilisateurService utilisateurService;

    public EmpruntEquipement create(
            Long idUtilisateur,
            Long idEquipement,
            Integer quantite,
            LocalDate dateRetourPrevue
    ) {
        Utilisateur utilisateur = utilisateurRepository.findById(idUtilisateur)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Equipement equipement = equipementRepository.findById(idEquipement)
                .orElseThrow(() -> new ResourceNotFoundException("Équipement non trouvé"));

        if (!Boolean.TRUE.equals(equipement.getEmpruntable())) {
            throw new BusinessException("Cet équipement n'est pas disponible à l'emprunt");
        }

        if (quantite == null || quantite <= 0) {
            throw new BusinessException("La quantité doit être supérieure à 0");
        }

        if (dateRetourPrevue == null || dateRetourPrevue.isBefore(LocalDate.now())) {
            throw new BusinessException("La date de retour prévue est invalide");
        }

        if (equipement.getQuantiteDisponible() < quantite) {
            throw new BusinessException("Stock insuffisant pour cet emprunt");
        }

        EmpruntEquipement emprunt = EmpruntEquipement.builder()
                .utilisateur(utilisateur)
                .equipement(equipement)
                .dateEmprunt(LocalDate.now())
                .dateRetourPrevue(dateRetourPrevue)
                .statutEmprunt("en_attente")
                .quantite(quantite)
                .build();

        return empruntRepository.save(emprunt);
    }

    public EmpruntEquipement createForCurrentUser(
            Long idEquipement,
            Integer quantite,
            LocalDate dateRetourPrevue
    ) {
        Utilisateur utilisateur = utilisateurService.getUtilisateurConnecte();

        return create(
                utilisateur.getIdUtilisateur(),
                idEquipement,
                quantite,
                dateRetourPrevue
        );
    }

    public List<EmpruntEquipementDTO> getAll() {
        return empruntRepository.findAll()
                .stream()
                .map(EmpruntEquipementMapper::toDTO)
                .toList();
    }

    public List<EmpruntEquipementDTO> getMyEmprunts() {
        Utilisateur utilisateur = utilisateurService.getUtilisateurConnecte();

        return empruntRepository
                .findByUtilisateurIdUtilisateur(utilisateur.getIdUtilisateur())
                .stream()
                .map(EmpruntEquipementMapper::toDTO)
                .toList();
    }

    public List<EmpruntEquipementDTO> getByUtilisateur(Long idUtilisateur) {
        return empruntRepository.findByUtilisateurIdUtilisateur(idUtilisateur)
                .stream()
                .map(EmpruntEquipementMapper::toDTO)
                .toList();
    }

    public EmpruntEquipement valider(Long idEmprunt) {
        EmpruntEquipement emprunt = empruntRepository.findById(idEmprunt)
                .orElseThrow(() -> new ResourceNotFoundException("Emprunt d'équipement non trouvé"));

        if ("en_cours".equals(emprunt.getStatutEmprunt())) {
            throw new BusinessException("Cet emprunt a déjà été validé");
        }

        if ("retourne".equals(emprunt.getStatutEmprunt())) {
            throw new BusinessException("Cet emprunt est déjà retourné");
        }

        if ("refuse".equals(emprunt.getStatutEmprunt())) {
            throw new BusinessException("Cet emprunt a été refusé");
        }

        Equipement equipement = emprunt.getEquipement();

        if (equipement.getQuantiteDisponible() < emprunt.getQuantite()) {
            throw new BusinessException("Stock insuffisant pour valider cet emprunt");
        }

        equipement.setQuantiteDisponible(
                equipement.getQuantiteDisponible() - emprunt.getQuantite()
        );

        emprunt.setStatutEmprunt("en_cours");

        equipementRepository.save(equipement);
        return empruntRepository.save(emprunt);
    }

    public EmpruntEquipement refuser(Long idEmprunt) {
        EmpruntEquipement emprunt = empruntRepository.findById(idEmprunt)
                .orElseThrow(() -> new ResourceNotFoundException("Emprunt d'équipement non trouvé"));

        if ("en_cours".equals(emprunt.getStatutEmprunt())) {
            throw new BusinessException("Impossible de refuser un emprunt déjà validé");
        }

        if ("retourne".equals(emprunt.getStatutEmprunt())) {
            throw new BusinessException("Impossible de refuser un emprunt déjà retourné");
        }

        emprunt.setStatutEmprunt("refuse");

        return empruntRepository.save(emprunt);
    }

    public EmpruntEquipement retourner(Long idEmprunt) {
        EmpruntEquipement emprunt = empruntRepository.findById(idEmprunt)
                .orElseThrow(() -> new ResourceNotFoundException("Emprunt d'équipement non trouvé"));

        if (!"en_cours".equals(emprunt.getStatutEmprunt())) {
            throw new BusinessException("Seul un emprunt en cours peut être retourné");
        }

        Equipement equipement = emprunt.getEquipement();

        equipement.setQuantiteDisponible(
                equipement.getQuantiteDisponible() + emprunt.getQuantite()
        );

        emprunt.setStatutEmprunt("retourne");
        emprunt.setDateRetourEffective(LocalDate.now());

        equipementRepository.save(equipement);
        return empruntRepository.save(emprunt);
    }

    public void delete(Long idEmprunt) {
        EmpruntEquipement emprunt = empruntRepository.findById(idEmprunt)
                .orElseThrow(() -> new ResourceNotFoundException("Emprunt d'équipement non trouvé"));

        if ("en_cours".equals(emprunt.getStatutEmprunt())) {
            throw new BusinessException("Impossible de supprimer un emprunt en cours");
        }

        empruntRepository.delete(emprunt);
    }
}