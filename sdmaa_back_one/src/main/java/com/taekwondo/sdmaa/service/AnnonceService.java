package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.AnnonceDTO;
import com.taekwondo.sdmaa.entity.Annonce;
import com.taekwondo.sdmaa.entity.Utilisateur;
import com.taekwondo.sdmaa.enums.StatutAnnonce;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.AnnonceMapper;
import com.taekwondo.sdmaa.repository.AnnonceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AnnonceService {

    private final AnnonceRepository annonceRepository;
    private final AnnonceMapper annonceMapper;
    private final UtilisateurService utilisateurService;

    /**
     * Crée une nouvelle annonce pour l'utilisateur connecté.
     */
    public AnnonceDTO creer(AnnonceDTO dto) {

        Utilisateur auteur =
                utilisateurService.getUtilisateurConnecte();

        Annonce annonce =
                annonceMapper.toEntity(dto);

        annonce.setAuteur(auteur);

        if (annonce.getStatut() == null) {
            annonce.setStatut(
                    StatutAnnonce.BROUILLON
            );
        }

        if (
                annonce.getStatut() == StatutAnnonce.PUBLIEE
                        && annonce.getDatePublication() == null
        ) {
            annonce.setDatePublication(
                    LocalDateTime.now()
            );
        }

        Annonce annonceEnregistree =
                annonceRepository.save(annonce);

        return annonceMapper.toDTO(
                annonceEnregistree
        );
    }

    /**
     * Récupère toutes les annonces.
     */
    @Transactional(readOnly = true)
    public List<AnnonceDTO> getAll() {

        return annonceRepository
                .findAll()
                .stream()
                .map(annonceMapper::toDTO)
                .toList();
    }

    /**
     * Récupère une annonce par son identifiant.
     */
    @Transactional(readOnly = true)
    public AnnonceDTO getById(Long id) {

        Annonce annonce =
                trouverAnnonce(id);

        return annonceMapper.toDTO(annonce);
    }

    /**
     * Récupère toutes les annonces publiées,
     * de la plus récente à la plus ancienne.
     */
    @Transactional(readOnly = true)
    public List<AnnonceDTO> getPubliees() {

        return annonceRepository
                .findByStatutOrderByDatePublicationDesc(
                        StatutAnnonce.PUBLIEE
                )
                .stream()
                .map(annonceMapper::toDTO)
                .toList();
    }

    /**
     * Récupère les cinq dernières annonces publiées.
     */
    @Transactional(readOnly = true)
    public List<AnnonceDTO> getDernieresAnnonces() {

        return annonceRepository
                .findTop5ByStatutOrderByDatePublicationDesc(
                        StatutAnnonce.PUBLIEE
                )
                .stream()
                .map(annonceMapper::toDTO)
                .toList();
    }

    /**
     * Modifie une annonce existante.
     */
    public AnnonceDTO modifier(
            Long id,
            AnnonceDTO dto
    ) {

        Annonce annonce =
                trouverAnnonce(id);

        StatutAnnonce ancienStatut =
                annonce.getStatut();

        annonceMapper.updateEntity(
                annonce,
                dto
        );

        /*
         * Si aucun statut n'est envoyé,
         * on conserve l'ancien statut.
         */
        if (annonce.getStatut() == null) {
            annonce.setStatut(ancienStatut);
        }

        /*
         * Lorsque l'annonce devient publiée,
         * on initialise sa date de publication.
         */
        if (
                annonce.getStatut() == StatutAnnonce.PUBLIEE
                        && ancienStatut != StatutAnnonce.PUBLIEE
                        && annonce.getDatePublication() == null
        ) {
            annonce.setDatePublication(
                    LocalDateTime.now()
            );
        }

        Annonce annonceModifiee =
                annonceRepository.save(annonce);

        return annonceMapper.toDTO(
                annonceModifiee
        );
    }

    /**
     * Publie une annonce.
     */
    public AnnonceDTO publier(Long id) {

        Annonce annonce =
                trouverAnnonce(id);

        annonce.setStatut(
                StatutAnnonce.PUBLIEE
        );

        if (annonce.getDatePublication() == null) {
            annonce.setDatePublication(
                    LocalDateTime.now()
            );
        }

        Annonce annoncePubliee =
                annonceRepository.save(annonce);

        return annonceMapper.toDTO(
                annoncePubliee
        );
    }

    /**
     * Archive une annonce.
     */
    public AnnonceDTO archiver(Long id) {

        Annonce annonce =
                trouverAnnonce(id);

        annonce.setStatut(
                StatutAnnonce.ARCHIVEE
        );

        Annonce annonceArchivee =
                annonceRepository.save(annonce);

        return annonceMapper.toDTO(
                annonceArchivee
        );
    }

    /**
     * Supprime définitivement une annonce.
     */
    public void supprimer(Long id) {

        Annonce annonce =
                trouverAnnonce(id);

        annonceRepository.delete(annonce);
    }

    /**
     * Recherche une annonce ou déclenche une exception.
     */
    private Annonce trouverAnnonce(Long id) {

        return annonceRepository
                .findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Annonce introuvable avec l'id : " + id
                        )
                );
    }
}