package com.taekwondo.sdmaa.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader =
                request.getHeader("Authorization");

        /*
         * Aucun token : on laisse Spring Security
         * décider si la route est publique ou protégée.
         */
        if (
                authHeader == null ||
                        !authHeader.startsWith("Bearer ")
        ) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt =
                authHeader.substring(7);

        try {
            final String email =
                    jwtService.extractEmail(jwt);

            if (
                    email != null &&
                            SecurityContextHolder
                                    .getContext()
                                    .getAuthentication() == null
            ) {
                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(email);

                boolean tokenValide =
                        jwtService.isTokenValid(
                                jwt,
                                userDetails.getUsername()
                        );

                if (tokenValide) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authToken);
                }
            }

            filterChain.doFilter(request, response);

        } catch (ExpiredJwtException exception) {
            SecurityContextHolder.clearContext();

            writeUnauthorizedResponse(
                    response,
                    "Votre session a expiré. Veuillez vous reconnecter."
            );

        } catch (JwtException exception) {
            SecurityContextHolder.clearContext();

            writeUnauthorizedResponse(
                    response,
                    "Le token d'authentification est invalide."
            );

        } catch (Exception exception) {
            SecurityContextHolder.clearContext();

            /*
             * On évite de transformer toutes les erreurs
             * métier en erreur 401.
             *
             * Ici, l'exception concerne uniquement le filtre JWT.
             */
            writeUnauthorizedResponse(
                    response,
                    "Impossible de valider la session."
            );
        }
    }

    private void writeUnauthorizedResponse(
            HttpServletResponse response,
            String message
    ) throws IOException {

        if (response.isCommitted()) {
            return;
        }

        response.setStatus(
                HttpServletResponse.SC_UNAUTHORIZED
        );

        response.setContentType(
                MediaType.APPLICATION_JSON_VALUE
        );

        response.setCharacterEncoding("UTF-8");

        String safeMessage =
                message.replace("\"", "\\\"");

        response.getWriter().write(
                """
                {
                  "status": 401,
                  "error": "Unauthorized",
                  "message": "%s"
                }
                """.formatted(safeMessage)
        );

        response.getWriter().flush();
    }
}