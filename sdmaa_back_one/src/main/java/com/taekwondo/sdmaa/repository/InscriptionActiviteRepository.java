package com.taekwondo.sdmaa.repository;

import com.taekwondo.sdmaa.entity.InscriptionActivite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InscriptionActiviteRepository
        extends JpaRepository<
        InscriptionActivite,
        Long
        > {

    boolean
    existsByUtilisateurIdUtilisateurAndActiviteIdActivite(
            Long idUtilisateur,
            Long idActivite
    );

    List<InscriptionActivite>
    findByUtilisateurIdUtilisateur(
            Long idUtilisateur
    );

    /**
     * Récupère les inscriptions d’une activité
     * selon leur statut.
     *
     * Exemple :
     * statutInscription = "validee"
     */
    List<InscriptionActivite>
    findByActiviteIdActiviteAndStatutInscriptionIgnoreCase(
            Long idActivite,
            String statutInscription
    );
}