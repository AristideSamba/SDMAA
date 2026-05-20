package com.taekwondo.sdmaa.repository;

import com.taekwondo.sdmaa.entity.Adhesion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AdhesionRepository extends JpaRepository<Adhesion, Long> {

    List<Adhesion> findByUtilisateurIdUtilisateur(Long idUtilisateur);
    Optional<Adhesion> findFirstByUtilisateurIdUtilisateurAndStatutAdhesionOrderByDateDebutDesc(
            Long idUtilisateur,
            String statutAdhesion
    );
}