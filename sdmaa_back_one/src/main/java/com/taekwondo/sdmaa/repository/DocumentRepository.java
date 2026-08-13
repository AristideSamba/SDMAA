package com.taekwondo.sdmaa.repository;

import com.taekwondo.sdmaa.entity.Document;
import com.taekwondo.sdmaa.enums.CategorieDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository
        extends JpaRepository<Document, Long> {

    List<Document> findByUtilisateurIdUtilisateur(
            Long idUtilisateur
    );

    List<Document> findByActiviteIdActivite(
            Long idActivite
    );

    List<Document> findByCategorieDocumentOrderByDateUploadDesc(
            CategorieDocument categorieDocument
    );

    List<Document> findByUtilisateurIdUtilisateurAndCategorieDocumentOrderByDateUploadDesc(
            Long idUtilisateur,
            CategorieDocument categorieDocument
    );
}