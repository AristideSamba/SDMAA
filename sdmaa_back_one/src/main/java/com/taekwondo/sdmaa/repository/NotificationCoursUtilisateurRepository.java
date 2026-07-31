package com.taekwondo.sdmaa.repository;

import com.taekwondo.sdmaa.entity.NotificationCoursUtilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotificationCoursUtilisateurRepository
        extends JpaRepository<NotificationCoursUtilisateur, Long> {

    /*
     * Recherche d'une notification appartenant à un utilisateur
     * à partir de l'identifiant utilisateur.
     */
    @Query("""
        SELECT notification
        FROM NotificationCoursUtilisateur notification
        WHERE notification.id = :notificationId
          AND notification.utilisateur.idUtilisateur = :utilisateurId
    """)
    Optional<NotificationCoursUtilisateur> findNotificationUtilisateur(
            @Param("notificationId") Long notificationId,
            @Param("utilisateurId") Long utilisateurId
    );

    /*
     * Liste des notifications d'un utilisateur par son identifiant.
     */
    List<NotificationCoursUtilisateur>
    findByUtilisateurIdUtilisateurOrderByAnnonceCoursDateCreationDesc(
            Long utilisateurId
    );

    /*
     * Liste des notifications de l'utilisateur connecté par son e-mail.
     */
    List<NotificationCoursUtilisateur>
    findByUtilisateurEmailOrderByAnnonceCoursDateCreationDesc(
            String email
    );

    /*
     * Recherche d'une notification par son identifiant,
     * uniquement si elle appartient à l'utilisateur connecté.
     */
    Optional<NotificationCoursUtilisateur>
    findByIdAndUtilisateurEmail(
            Long notificationId,
            String email
    );

    /*
     * Vérifie si une notification existe déjà pour
     * une annonce et un utilisateur.
     *
     * AnnonceCours possède le champ idAnnonce.
     */
    boolean existsByAnnonceCoursIdAnnonceAndUtilisateurIdUtilisateur(
            Long annonceId,
            Long utilisateurId
    );

    /*
     * Compte les notifications non lues avec
     * l'identifiant de l'utilisateur.
     */
    long countByUtilisateurIdUtilisateurAndLuFalse(
            Long utilisateurId
    );

    /*
     * Compte les notifications non lues avec
     * l'e-mail de l'utilisateur connecté.
     */
    long countByUtilisateurEmailAndLuFalse(
            String email
    );

    /*
     * Supprime toutes les notifications associées
     * à une annonce supprimée.
     */
    void deleteByAnnonceCoursIdAnnonce(
            Long annonceId
    );
}