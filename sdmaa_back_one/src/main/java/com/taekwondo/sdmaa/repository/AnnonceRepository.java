package com.taekwondo.sdmaa.repository;


import com.taekwondo.sdmaa.entity.Annonce;
import com.taekwondo.sdmaa.enums.StatutAnnonce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnonceRepository
        extends JpaRepository<Annonce, Long> {

    /**
     * Récupère toutes les annonces selon leur statut,
     * de la plus récente à la plus ancienne.
     */
    List<Annonce> findByStatutOrderByDatePublicationDesc(
            StatutAnnonce statut
    );

    /**
     * Récupère les 5 dernières annonces publiées.
     * Cette méthode servira pour la section
     * "Dernières annonces" du frontend.
     */
    List<Annonce> findTop5ByStatutOrderByDatePublicationDesc(
            StatutAnnonce statut
    );
}
