package com.taekwondo.sdmaa.mapper;

import com.taekwondo.sdmaa.dto.NotificationCoursUtilisateurDTO;
import com.taekwondo.sdmaa.entity.AnnonceCours;
import com.taekwondo.sdmaa.entity.Cours;
import com.taekwondo.sdmaa.entity.NotificationCoursUtilisateur;
import org.springframework.stereotype.Component;

@Component
public class NotificationCoursUtilisateurMapper {

    public NotificationCoursUtilisateurDTO toDTO(
            NotificationCoursUtilisateur notification
    ) {
        if (notification == null) {
            return null;
        }

        NotificationCoursUtilisateurDTO dto =
                new NotificationCoursUtilisateurDTO();

        // Identifiant personnel de la notification
        dto.setId(notification.getId());

        // État de lecture propre à l'utilisateur
        dto.setLu(notification.isLu());
        dto.setDateLecture(
                notification.getDateLecture()
        );

        AnnonceCours annonce =
                notification.getAnnonceCours();

        if (annonce != null) {

            // Identifiant de l'annonce
            dto.setAnnonceId(
                    annonce.getIdAnnonce()
            );

            /*
             * AnnonceCours ne possède pas de titre.
             * On génère donc un titre avec le type d'annonce.
             */
            dto.setTitre(
                    construireTitreAnnonce(annonce)
            );

            dto.setMessage(
                    annonce.getMessage()
            );

            dto.setDateCreation(
                    annonce.getDateCreation()
            );

            Cours cours = annonce.getCours();

            if (cours != null) {
                dto.setCoursId(
                        cours.getIdCours()
                );

                dto.setCoursTitre(
                        cours.getTitre()
                );

                dto.setJour(
                        cours.getJour()
                );

                dto.setHeureDebut(
                        cours.getHeureDebut() != null
                                ? cours.getHeureDebut().toString()
                                : null
                );

                dto.setHeureFin(
                        cours.getHeureFin() != null
                                ? cours.getHeureFin().toString()
                                : null
                );
            }
        }

        return dto;
    }

    /**
     * Construit un titre lisible à partir
     * du type de l'annonce.
     */
    private String construireTitreAnnonce(
            AnnonceCours annonce
    ) {
        if (annonce.getTypeAnnonce() == null) {
            return "Information sur votre cours";
        }

        String typeAnnonce =
                annonce.getTypeAnnonce()
                        .toString()
                        .trim()
                        .toLowerCase()
                        .replace("_", " ");

        if (typeAnnonce.isEmpty()) {
            return "Information sur votre cours";
        }

        return Character.toUpperCase(
                typeAnnonce.charAt(0)
        ) + typeAnnonce.substring(1);
    }
}