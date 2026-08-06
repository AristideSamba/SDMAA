package com.taekwondo.sdmaa.repository;

import com.taekwondo.sdmaa.entity.Activite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ActiviteRepository
        extends JpaRepository<Activite, Long> {

    /**
     * Activités prévues à une date précise.
     * Utilisé notamment pour le rappel J-3.
     */
    List<Activite> findByDateActivite(
            LocalDate dateActivite
    );
}