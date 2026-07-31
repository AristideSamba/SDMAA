package com.taekwondo.sdmaa.service;


import com.taekwondo.sdmaa.dto.NotificationCoursUtilisateurDTO;
import com.taekwondo.sdmaa.entity.NotificationCoursUtilisateur;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.NotificationCoursUtilisateurMapper;
import com.taekwondo.sdmaa.repository.NotificationCoursUtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationCoursUtilisateurService {

    private final NotificationCoursUtilisateurRepository repository;
    private final NotificationCoursUtilisateurMapper mapper;

    public NotificationCoursUtilisateurService(
            NotificationCoursUtilisateurRepository repository,
            NotificationCoursUtilisateurMapper mapper
    ) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<NotificationCoursUtilisateurDTO>
    getMesNotifications(String email) {
        return repository
                .findByUtilisateurEmailOrderByAnnonceCoursDateCreationDesc(
                        email
                )
                .stream()
                .map(mapper::toDTO)
                .toList();
    }

    @Transactional
    public NotificationCoursUtilisateurDTO marquerCommeLue(
            Long notificationId,
            String email
    ) {
        NotificationCoursUtilisateur notification =
                repository
                        .findByIdAndUtilisateurEmail(
                                notificationId,
                                email
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification introuvable"
                                )
                        );

        if (!notification.isLu()) {
            notification.setLu(true);
            notification.setDateLecture(
                    LocalDateTime.now()
            );

            notification = repository.save(
                    notification
            );
        }

        return mapper.toDTO(notification);
    }

    @Transactional(readOnly = true)
    public long compterMesNotificationsNonLues(
            String email
    ) {
        return repository
                .countByUtilisateurEmailAndLuFalse(
                        email
                );
    }
}