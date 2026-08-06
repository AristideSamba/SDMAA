package com.taekwondo.sdmaa.repository;

import com.taekwondo.sdmaa.entity.NotificationUtilisateur;
import com.taekwondo.sdmaa.enums.TypeNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface NotificationUtilisateurRepository
        extends JpaRepository<
        NotificationUtilisateur,
        Long
        > {

    List<NotificationUtilisateur>
    findByUtilisateurEmailOrderByDateCreationDesc(
            String email
    );

    List<NotificationUtilisateur>
    findByUtilisateurIdUtilisateurOrderByDateCreationDesc(
            Long idUtilisateur
    );

    Optional<NotificationUtilisateur>
    findByIdNotificationAndUtilisateurEmail(
            Long idNotification,
            String email
    );

    long countByUtilisateurEmailAndEstLueFalse(
            String email
    );

    boolean existsByUtilisateurIdUtilisateurAndTypeNotificationAndActiviteId(
            Long idUtilisateur,
            TypeNotification typeNotification,
            Long activiteId
    );

    boolean existsByUtilisateurIdUtilisateurAndTypeNotificationAndAnnonceId(
            Long idUtilisateur,
            TypeNotification typeNotification,
            Long annonceId
    );

    boolean existsByUtilisateurIdUtilisateurAndTypeNotificationAndInscriptionId(
            Long idUtilisateur,
            TypeNotification typeNotification,
            Long inscriptionId
    );

    List<NotificationUtilisateur>
    findByDateCreationBefore(
            LocalDateTime limite
    );

    void deleteByDateCreationBefore(
            LocalDateTime limite
    );
}
