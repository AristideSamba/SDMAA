package com.taekwondo.sdmaa.repository;

import com.taekwondo.sdmaa.entity.DemandeSuppressionCompte;
import com.taekwondo.sdmaa.enums.StatutDemandeSuppression;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DemandeSuppressionCompteRepository
        extends JpaRepository<DemandeSuppressionCompte, Long> {

    boolean existsByUtilisateurIdUtilisateurAndStatut(
            Long idUtilisateur,
            StatutDemandeSuppression statut
    );

    Optional<DemandeSuppressionCompte>
    findFirstByUtilisateurIdUtilisateurOrderByDateDemandeDesc(
            Long idUtilisateur
    );

    List<DemandeSuppressionCompte>
    findAllByOrderByDateDemandeDesc();
}
