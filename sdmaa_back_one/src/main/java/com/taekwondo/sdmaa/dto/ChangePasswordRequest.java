package com.taekwondo.sdmaa.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {

    private String ancienMotDePasse;
    private String nouveauMotDePasse;
    private String confirmationMotDePasse;
}
