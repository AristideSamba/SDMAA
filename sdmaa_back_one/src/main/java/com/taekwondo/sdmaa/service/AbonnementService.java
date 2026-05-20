package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.entity.Abonnement;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.repository.AbonnementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AbonnementService {

    private final AbonnementRepository repository;

    public Abonnement create(Abonnement abonnement) {
        return repository.save(abonnement);
    }

    public List<Abonnement> getAll() {
        return repository.findAll();
    }

    public Abonnement getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Abonnement non trouvé"));
    }

    public Abonnement update(Long id, Abonnement updated) {
        Abonnement abonnement = getById(id);

        abonnement.setNom(updated.getNom());
        abonnement.setDescription(updated.getDescription());
        abonnement.setPrixMensuel(updated.getPrixMensuel());
        abonnement.setPrixAnnuel(updated.getPrixAnnuel());
        abonnement.setAgeMin(updated.getAgeMin());
        abonnement.setAgeMax(updated.getAgeMax());

        return repository.save(abonnement);
    }

    public void delete(Long id) {
        Abonnement abonnement = getById(id);
        repository.delete(abonnement);
    }
}