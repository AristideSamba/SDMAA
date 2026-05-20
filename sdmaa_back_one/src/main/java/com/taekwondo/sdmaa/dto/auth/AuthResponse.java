package com.taekwondo.sdmaa.dto.auth;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private Long idUtilisateur;
    private String email;
    private String role;
    private String statutCompte;
}
