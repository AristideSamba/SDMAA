package com.taekwondo.sdmaa.config;

import com.taekwondo.sdmaa.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(Customizer.withDefaults())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        /*
                         * Autoriser les requêtes CORS preflight.
                         * Important pour les uploads multipart.
                         */
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        /*
                         * Routes publiques.
                         */
                        .requestMatchers(
                                "/api/auth/**",
                                "/error",
                                "/uploads/**"
                        ).permitAll()

                        .requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/abonnements/**"
                        ).permitAll()

                        /*
                         * Profil de l'utilisateur connecté.
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/utilisateurs/me"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/utilisateurs/me"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/utilisateurs/me/password"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/utilisateurs/me/push-token"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/utilisateurs/me/photo"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/utilisateurs/me/photo"
                        ).authenticated()

                        .requestMatchers(
                                "/api/me/**"
                        ).authenticated()

                        /*
                         * Annonces générales.
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/annonces/**"
                        ).authenticated()

                        /*
                        *Notifications générales
                         */

                        .requestMatchers(
                                "/api/notifications/**"
                        ).authenticated()

                        /*
                         * Espace adhérent.
                         */
                        .requestMatchers(
                                "/api/adhesions/me/**"
                        ).hasRole("ADHERENT")

                        .requestMatchers(
                                "/api/documents/me/**"
                        ).hasRole("ADHERENT")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/cours/me"
                        ).hasRole("ADHERENT")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/annonces-cours/me"
                        ).hasRole("ADHERENT")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/inscriptions-activites/me"
                        ).hasRole("ADHERENT")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/inscriptions-activites/me"
                        ).hasRole("ADHERENT")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/achats-equipements/me"
                        ).hasRole("ADHERENT")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/achats-equipements/me"
                        ).hasRole("ADHERENT")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/emprunts-equipements/me"
                        ).hasRole("ADHERENT")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/emprunts-equipements/me"
                        ).hasRole("ADHERENT")

                        /*
                         * Lecture partagée.
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/cours/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "COACH",
                                "ADHERENT"
                        )

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/annonces-cours/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "COACH",
                                "ADHERENT"
                        )

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/equipements/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "COACH",
                                "ADHERENT"
                        )

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/activites/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "COACH",
                                "ADHERENT"
                        )

                        /*
                         * Coach.
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/affectations-cours/**"
                        ).hasAnyRole(
                                "ADMIN",
                                "COACH"
                        )

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/affectations-cours/*/confirmer"
                        ).hasRole("COACH")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/affectations-cours/*/refuser"
                        ).hasRole("COACH")

                        /*
                         * Administration des équipements.
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/equipements"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/equipements/*/image"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/equipements/*"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/equipements/**"
                        ).hasRole("ADMIN")

                        /*
                         * Autres routes administrateur.
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/cours/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/cours/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/cours/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                "/api/cours-abonnements/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/affectations-cours/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/affectations-cours/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/annonces-cours/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/annonces-cours/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                "/api/utilisateurs/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                "/api/adhesions/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                "/api/documents/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                "/api/inscriptions-activites/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                "/api/achats-equipements/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                "/api/emprunts-equipements/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                "/api/activites/**"
                        ).hasRole("ADMIN")

                        /*
                         * Toute autre route nécessite
                         * une authentification.
                         */
                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration.getAuthenticationManager();
    }
}