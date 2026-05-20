package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.entity.Abonnement;
import com.taekwondo.sdmaa.entity.Cours;
import com.taekwondo.sdmaa.entity.CoursAbonnement;
import com.taekwondo.sdmaa.exception.BusinessException;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.repository.AbonnementRepository;
import com.taekwondo.sdmaa.repository.CoursAbonnementRepository;
import com.taekwondo.sdmaa.repository.CoursRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CoursAbonnementService {

    private final CoursAbonnementRepository coursAbonnementRepository;
    private final CoursRepository coursRepository;
    private final AbonnementRepository abonnementRepository;

    public CoursAbonnement lierCoursAbonnement(Long idCours, Long idAbonnement) {
        if (coursAbonnementRepository.existsByCoursIdCoursAndAbonnementIdAbonnement(idCours, idAbonnement)) {
            throw new BusinessException("Ce cours est déjà lié à cet abonnement");
        }

        Cours cours = coursRepository.findById(idCours)
                .orElseThrow(() -> new ResourceNotFoundException("Cours non trouvé"));

        Abonnement abonnement = abonnementRepository.findById(idAbonnement)
                .orElseThrow(() -> new ResourceNotFoundException("Abonnement non trouvé"));

        CoursAbonnement lien = CoursAbonnement.builder()
                .cours(cours)
                .abonnement(abonnement)
                .build();

        return coursAbonnementRepository.save(lien);
    }

    public List<CoursAbonnement> getAll() {
        return coursAbonnementRepository.findAll();
    }

    public void delete(Long id) {
        CoursAbonnement lien = coursAbonnementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lien cours-abonnement non trouvé"));

        coursAbonnementRepository.delete(lien);
    }
}
