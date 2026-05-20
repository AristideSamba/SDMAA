package com.taekwondo.sdmaa.dto;

import lombok.*;

import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoursDTO {

    private Long idCours;
    private String titre;
    private String description;
    private String jour;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private String trancheAge;
    private String niveau;
    private String lieu;
    private String statutCours;

    private List<String> coachs;
}
