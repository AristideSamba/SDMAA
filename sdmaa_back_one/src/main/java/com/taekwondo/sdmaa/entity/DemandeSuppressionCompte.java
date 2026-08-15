package com.taekwondo.sdmaa.entity;

import com.taekwondo.sdmaa.enums.StatutDemandeSuppression;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "demande_suppression_compte")
public class DemandeSuppressionCompte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDemandeSuppression;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    @Column(name = "date_demande", nullable = false)
    private LocalDateTime dateDemande;

    @Column(length = 1000)
    private String motif;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutDemandeSuppression statut;

    @Column(name = "date_traitement")
    private LocalDateTime dateTraitement;

    @Column(name = "commentaire_admin", length = 1000)
    private String commentaireAdmin;

    @PrePersist
    public void prePersist() {
        if (dateDemande == null) {
            dateDemande = LocalDateTime.now();
        }

        if (statut == null) {
            statut = StatutDemandeSuppression.EN_ATTENTE;
        }
    }
}
