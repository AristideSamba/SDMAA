package com.taekwondo.sdmaa.repository;

import com.taekwondo.sdmaa.entity.Cours;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoursRepository extends JpaRepository<Cours, Long> {
}
