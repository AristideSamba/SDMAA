package com.taekwondo.sdmaa.repository;

import com.taekwondo.sdmaa.entity.AffectationCours;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AffectationCoursRepository extends JpaRepository<AffectationCours, Long> {
    boolean existsByCoachIdUtilisateurAndCoursIdCours(Long idCoach, Long idCours);
    List<AffectationCours> findByCoursIdCours(Long idCours);
}
