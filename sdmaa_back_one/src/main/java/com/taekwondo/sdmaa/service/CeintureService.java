package com.taekwondo.sdmaa.service;

import com.taekwondo.sdmaa.entity.Ceinture;
import com.taekwondo.sdmaa.repository.CeintureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CeintureService {

    private final CeintureRepository repository;


    public Ceinture create(Ceinture c) {
        return repository.save(c);
    }

    public List<Ceinture> getAll() {
        return repository.findAll();
    }
}
