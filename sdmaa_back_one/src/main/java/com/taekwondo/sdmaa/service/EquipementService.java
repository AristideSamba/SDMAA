package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.dto.EquipementDTO;
import com.taekwondo.sdmaa.entity.Equipement;
import com.taekwondo.sdmaa.exception.ResourceNotFoundException;
import com.taekwondo.sdmaa.mapper.EquipementMapper;
import com.taekwondo.sdmaa.repository.EquipementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipementService {

    private final EquipementRepository repository;

    public Equipement create(Equipement equipement) {
        return repository.save(equipement);
    }

    public List<EquipementDTO> getAll() {
        return repository.findAll()
                .stream()
                .map(EquipementMapper::toDTO)
                .toList();
    }

    public EquipementDTO getById(Long id) {
        return EquipementMapper.toDTO(getEntityById(id));
    }

    public Equipement getEntityById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Équipement non trouvé"));
    }

    public Equipement update(Long id, Equipement updated) {
        Equipement equipement = getEntityById(id);

        equipement.setNom(updated.getNom());
        equipement.setType(updated.getType());
        equipement.setTaille(updated.getTaille());
        equipement.setQuantiteDisponible(updated.getQuantiteDisponible());
        equipement.setPrixAchat(updated.getPrixAchat());
        equipement.setAchetable(updated.getAchetable());
        equipement.setEmpruntable(updated.getEmpruntable());

        return repository.save(equipement);
    }

    public void delete(Long id) {
        Equipement equipement = getEntityById(id);
        repository.delete(equipement);
    }
}