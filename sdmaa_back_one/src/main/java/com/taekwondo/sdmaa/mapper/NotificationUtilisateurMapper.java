package com.taekwondo.sdmaa.mapper;

import com.taekwondo.sdmaa.dto.NotificationUtilisateurDTO;
import com.taekwondo.sdmaa.entity.NotificationUtilisateur;

public final class NotificationUtilisateurMapper {

    private NotificationUtilisateurMapper() {
    }

    public static NotificationUtilisateurDTO toDTO(
            NotificationUtilisateur notification
    ) {
        if (notification == null) {
            return null;
        }

        return NotificationUtilisateurDTO
                .builder()
                .idNotification(
                        notification.getIdNotification()
                )
                .typeNotification(
                        notification.getTypeNotification()
                )
                .titre(
                        notification.getTitre()
                )
                .message(
                        notification.getMessage()
                )
                .titreCible(
                        notification.getTitreCible()
                )
                .activiteId(
                        notification.getActiviteId()
                )
                .annonceId(
                        notification.getAnnonceId()
                )
                .coursId(
                        notification.getCoursId()
                )
                .inscriptionId(
                        notification.getInscriptionId()
                )
                .estLue(
                        notification.isEstLue()
                )
                .dateCreation(
                        notification.getDateCreation()
                )
                .dateLecture(
                        notification.getDateLecture()
                )
                .build();
    }
}
