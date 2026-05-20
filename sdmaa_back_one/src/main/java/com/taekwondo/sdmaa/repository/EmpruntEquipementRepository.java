package com.taekwondo.sdmaa.repository;

import com.taekwondo.sdmaa.entity.EmpruntEquipement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmpruntEquipementRepository extends JpaRepository<EmpruntEquipement, Long> {

    List<EmpruntEquipement> findByUtilisateurIdUtilisateur(Long idUtilisateur);
}
