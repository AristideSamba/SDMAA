package com.taekwondo.sdmaa.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(
        name = "affectation_cours",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"id_coach", "id_cours"})
        }
)
public class AffectationCours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAffectation;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_coach")
    private Utilisateur coach;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_cours")
    private Cours cours;

    @Column(nullable = false)
    private String statutAffectation; // en_attente, confirmee, refusee

    private LocalDateTime dateAffectation;

    private LocalDateTime dateConfirmation;

    private String commentaire;
}
