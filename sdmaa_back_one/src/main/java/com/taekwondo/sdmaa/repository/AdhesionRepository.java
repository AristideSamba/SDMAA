package com.taekwondo.sdmaa.repository;

import com.taekwondo.sdmaa.entity.Adhesion;
import com.taekwondo.sdmaa.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AdhesionRepository
        extends JpaRepository<Adhesion, Long> {

    List<Adhesion> findByUtilisateurIdUtilisateur(
            Long idUtilisateur
    );

    Optional<Adhesion>
    findFirstByUtilisateurIdUtilisateurAndStatutAdhesionOrderByDateDebutDesc(
            Long idUtilisateur,
            String statutAdhesion
    );

    /**
     * Retourne les utilisateurs ayant une adhésion
     * validée à un abonnement associé au cours.
     */
    @Query("""
            SELECT DISTINCT adhesion.utilisateur
            FROM Adhesion adhesion
            JOIN CoursAbonnement coursAbonnement
              ON coursAbonnement.abonnement = adhesion.abonnement
            WHERE coursAbonnement.cours.idCours = :idCours
              AND LOWER(adhesion.statutAdhesion) = 'validee'
            """)
    List<Utilisateur> findUtilisateursActifsParCours(
            @Param("idCours") Long idCours
    );
}