package com.taekwondo.sdmaa.entity;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(
        name = "cours_abonnement",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"id_cours", "id_abonnement"})
        }
)
public class CoursAbonnement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCoursAbonnement;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_cours")
    private Cours cours;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_abonnement")
    private Abonnement abonnement;
}