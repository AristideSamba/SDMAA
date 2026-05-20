package com.taekwondo.sdmaa.repository;

import com.taekwondo.sdmaa.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByUtilisateurIdUtilisateur(Long idUtilisateur);

    List<Document> findByActiviteIdActivite(Long idActivite);
}
