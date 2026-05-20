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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InscriptionActiviteService {

    private final InscriptionActiviteRepository inscriptionRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ActiviteRepository activiteRepository;
    private final UtilisateurService utilisateurService;

    public InscriptionActivite create(Long idUtilisateur, Long idActivite, String commentaire) {
        if (inscriptionRepository.existsByUtilisateurIdUtilisateurAndActiviteIdActivite(idUtilisateur, idActivite)) {
            throw new BusinessException("Vous êtes déjà inscrit à cette activité");
        }

        Utilisateur utilisateur = utilisateurRepository.findById(idUtilisateur)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Activite activite = activiteRepository.findById(idActivite)
                .orElseThrow(() -> new ResourceNotFoundException("Activité non trouvée"));

        String statutPaiement = activite.getPrix() != null && activite.getPrix().doubleValue() > 0
                ? "en_attente"
                : "non_requis";

        String modePaiement = activite.getPrix() != null && activite.getPrix().doubleValue() > 0
                ? "especes"
                : null;

        InscriptionActivite inscription = InscriptionActivite.builder()
                .utilisateur(utilisateur)
                .activite(activite)
                .dateDemande(LocalDate.now())
                .commentaire(commentaire)
                .statutInscription("en_attente")
                .statutPaiement(statutPaiement)
                .modePaiement(modePaiement)
                .build();

        return inscriptionRepository.save(inscription);
    }

    public List<InscriptionActiviteDTO> getAll() {
        return inscriptionRepository.findAll()
                .stream()
                .map(InscriptionActiviteMapper::toDTO)
                .toList();
    }

    public InscriptionActiviteDTO getById(Long id) {
        InscriptionActivite inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription à l'activité non trouvée"));

        return InscriptionActiviteMapper.toDTO(inscription);
    }

    public List<InscriptionActiviteDTO> getByUtilisateur(Long idUtilisateur) {
        return inscriptionRepository.findByUtilisateurIdUtilisateur(idUtilisateur)
                .stream()
                .map(InscriptionActiviteMapper::toDTO)
                .toList();
    }

    public InscriptionActivite createForCurrentUser(Long idActivite, String commentaire) {
        Utilisateur utilisateur = utilisateurService.getUtilisateurConnecte();

        return create(utilisateur.getIdUtilisateur(), idActivite, commentaire);
    }

    public List<InscriptionActiviteDTO> getMyInscriptions() {
        Utilisateur utilisateur = utilisateurService.getUtilisateurConnecte();

        return inscriptionRepository.findByUtilisateurIdUtilisateur(utilisateur.getIdUtilisateur())
                .stream()
                .map(InscriptionActiviteMapper::toDTO)
                .toList();
    }

    public InscriptionActivite valider(Long id) {
        InscriptionActivite inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription à l'activité non trouvée"));

        if (!"en_attente".equals(inscription.getStatutInscription())) {
            throw new BusinessException("Cette inscription a déjà été traitée");
        }

        inscription.setStatutInscription("validee");
        inscription.setDateValidationAdmin(LocalDate.now());

        if ("en_attente".equals(inscription.getStatutPaiement())) {
            inscription.setStatutPaiement("paye");
        }

        return inscriptionRepository.save(inscription);
    }

    public InscriptionActivite refuser(Long id) {
        InscriptionActivite inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription à l'activité non trouvée"));

        if (!"en_attente".equals(inscription.getStatutInscription())) {
            throw new BusinessException("Cette inscription a déjà été traitée");
        }

        inscription.setStatutInscription("refusee");
        inscription.setDateValidationAdmin(LocalDate.now());

        return inscriptionRepository.save(inscription);
    }

    public void delete(Long id) {
        InscriptionActivite inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription à l'activité non trouvée"));

        inscriptionRepository.delete(inscription);
    }
}