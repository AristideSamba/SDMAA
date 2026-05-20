package com.taekwondo.sdmaa.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnonceCours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAnnonce;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_cours")
    private Cours cours;

    @Column(nullable = false)
    private LocalDate dateConcernee;

    @Column(nullable = false)
    private String typeAnnonce; // annulation, information, remplacement

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private LocalDateTime dateCreation;

    @Column(nullable = false)
    private String jourConcerne;
}
