package com.taekwondo.sdmaa.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ceinture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCeinture;

    @Column(nullable = false, unique = true)
    private String nom;

    @Column(nullable = false)
    private String couleur; // ex: red, yellow, black
}