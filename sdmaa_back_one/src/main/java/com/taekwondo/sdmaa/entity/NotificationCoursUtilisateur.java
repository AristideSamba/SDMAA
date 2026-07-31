package com.taekwondo.sdmaa.entity;

import com.taekwondo.sdmaa.entity.AnnonceCours;
import com.taekwondo.sdmaa.entity.Utilisateur;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "notification_cours_utilisateur",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "annonce_cours_id",
                                "utilisateur_id"
                        }
                )
        }
)
public class NotificationCoursUtilisateur {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(nullable = false)
    private boolean lu = false;

    private LocalDateTime dateLecture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "annonce_cours_id",
            nullable = false
    )
    private AnnonceCours annonceCours;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "utilisateur_id",
            nullable = false
    )
    private Utilisateur utilisateur;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isLu() {
        return lu;
    }

    public void setLu(boolean lu) {
        this.lu = lu;
    }

    public LocalDateTime getDateLecture() {
        return dateLecture;
    }

    public void setDateLecture(
            LocalDateTime dateLecture
    ) {
        this.dateLecture = dateLecture;
    }

    public AnnonceCours getAnnonceCours() {
        return annonceCours;
    }

    public void setAnnonceCours(
            AnnonceCours annonceCours
    ) {
        this.annonceCours = annonceCours;
    }

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(
            Utilisateur utilisateur
    ) {
        this.utilisateur = utilisateur;
    }
}