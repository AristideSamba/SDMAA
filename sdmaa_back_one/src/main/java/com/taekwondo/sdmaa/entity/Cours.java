package com.taekwondo.sdmaa.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCours;

    @ManyToOne
    @JoinColumn(name = "coach_id")
    private Utilisateur coach;

    @OneToMany(mappedBy = "cours")
    private List<AffectationCours> affectationsCours;

    @Column(nullable = false)
    private String titre;

    private String description;

    @Column(nullable = false)
    private String jour;

    @Column(nullable = false)
    private LocalTime heureDebut;

    @Column(nullable = false)
    private LocalTime heureFin;

    private String trancheAge;

    private String niveau;

    @Column(nullable = false)
    private String lieu;

    @Column(nullable = false)
    private String statutCours; // actif, annule

}