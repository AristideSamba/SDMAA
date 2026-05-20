package com.taekwondo.sdmaa.repository;

import com.taekwondo.sdmaa.entity.AnnonceCours;
import com.taekwondo.sdmaa.entity.Cours;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnonceCoursRepository extends JpaRepository<AnnonceCours, Long> {

    List<AnnonceCours> findByCoursIdCours(Long idCours);
    List<AnnonceCours> findByCoursIn(List<Cours> cours);
}