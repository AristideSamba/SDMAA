package com.taekwondo.sdmaa.repository;

import com.taekwondo.sdmaa.entity.AchatEquipement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AchatEquipementRepository extends JpaRepository<AchatEquipement, Long> {

    List<AchatEquipement> findByUtilisateurIdUtilisateur(Long idUtilisateur);
}