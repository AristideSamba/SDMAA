package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.ActiviteDTO;
import com.taekwondo.sdmaa.entity.Activite;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.ActiviteMapper;
import com.taekwondo.sdmaa.repository.ActiviteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActiviteService {

    private final ActiviteRepository repository;

    public Activite create(Activite activite) {
        return repository.save(activite);
    }

    public List<ActiviteDTO> getAll() {
        return repository.findAll()
                .stream()
                .map(ActiviteMapper::toDTO)
                .toList();
    }

    public ActiviteDTO getById(Long id) {
        return ActiviteMapper.toDTO(getEntityById(id));
    }

    public Activite getEntityById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activité non trouvée"));
    }

    public Activite update(Long id, Activite updated) {
        Activite activite = getEntityById(id);

        activite.setTitre(updated.getTitre());
        activite.setDescription(updated.getDescription());
        activite.setDateActivite(updated.getDateActivite());
        activite.setHeureDebut(updated.getHeureDebut());
        activite.setHeureFin(updated.getHeureFin());
        activite.setLieu(updated.getLieu());
        activite.setPrix(updated.getPrix());
        activite.setCapaciteMax(updated.getCapaciteMax());
        activite.setIsInternal(updated.getIsInternal());
        activite.setTypeActivite(updated.getTypeActivite());
        activite.setLienExterne(updated.getLienExterne());
        activite.setImageActivite(updated.getImageActivite());

        return repository.save(activite);
    }

    public void delete(Long id) {
        Activite activite = getEntityById(id);
        repository.delete(activite);
    }
}