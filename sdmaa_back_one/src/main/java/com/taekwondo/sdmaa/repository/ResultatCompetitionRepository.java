package com.taekwondo.sdmaa.repository;

import com.taekwondo.sdmaa.entity.ResultatCompetition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResultatCompetitionRepository
        extends JpaRepository<ResultatCompetition, Long> {

    Optional<ResultatCompetition>
    findByInscriptionActiviteIdInscription(Long idInscription);

    boolean existsByInscriptionActiviteIdInscription(Long idInscription);

    List<ResultatCompetition>
    findByInscriptionActiviteUtilisateurIdUtilisateurOrderByInscriptionActiviteActiviteDateActiviteAsc(
            Long idUtilisateur
    );
}