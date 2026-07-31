package com.taekwondo.sdmaa.entity;

import com.taekwondo.sdmaa.enums.TypeMedaille;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resultats_competition")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultatCompetition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "inscription_activite_id",
            nullable = false,
            unique = true
    )
    private InscriptionActivite inscriptionActivite;

    @Column(nullable = false)
    private Integer rang;

    private Integer nombreParticipants;

    @Enumerated(EnumType.STRING)
    private TypeMedaille medaille;

    @Column(length = 1000)
    private String commentaireCoach;
}
