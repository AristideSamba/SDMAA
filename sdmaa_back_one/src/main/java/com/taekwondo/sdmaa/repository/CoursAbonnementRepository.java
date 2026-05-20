package com.taekwondo.sdmaa.repository;

import com.taekwondo.sdmaa.entity.CoursAbonnement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CoursAbonnementRepository extends JpaRepository<CoursAbonnement, Long> {
    boolean existsByCoursIdCoursAndAbonnementIdAbonnement(Long idCours, Long idAbonnement);
    List<CoursAbonnement> findByAbonnementIdAbonnement(Long idAbonnement);
}
