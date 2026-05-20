package com.taekwondo.sdmaa.repository;


import com.taekwondo.sdmaa.entity.InscriptionActivite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InscriptionActiviteRepository extends JpaRepository<InscriptionActivite, Long> {

    List<InscriptionActivite> findByUtilisateurIdUtilisateur(Long idUtilisateur);

    List<InscriptionActivite> findByActiviteIdActivite(Long idActivite);

    boolean existsByUtilisateurIdUtilisateurAndActiviteIdActivite(Long idUtilisateur, Long idActivite);
}