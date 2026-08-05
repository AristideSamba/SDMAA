package com.taekwondo.sdmaa.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
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

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    JwtAuthenticationFilter.class
            );

    private final JwtService jwtService;

    private final CustomUserDetailsService
            userDetailsService;

    /**
     * Les requêtes OPTIONS correspondent généralement
     * aux vérifications CORS envoyées par le navigateur.
     *
     * Elles ne nécessitent pas de validation JWT.
     */
    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request
    ) {
        return HttpMethod.OPTIONS.matches(
                request.getMethod()
        );
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader =
                request.getHeader(
                        "Authorization"
                );

        /*
         * Aucun token :
         * Spring Security décidera ensuite si la route
         * est publique ou protégée.
         */
        if (
                authHeader == null
                        || !authHeader.startsWith(
                        "Bearer "
                )
        ) {
            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        String jwt =
                authHeader.substring(7);

        /*
         * Ce bloc traite uniquement la validation JWT.
         *
         * La suite de la requête ne doit pas rester
         * dans ce try, sinon une erreur Cloudinary,
         * PostgreSQL ou métier deviendrait un faux 401.
         */
        try {
            authentifierUtilisateur(
                    jwt,
                    request
            );

        } catch (ExpiredJwtException exception) {
            SecurityContextHolder.clearContext();

            writeUnauthorizedResponse(
                    response,
                    "Votre session a expiré. "
                            + "Veuillez vous reconnecter."
            );

            return;

        } catch (JwtException exception) {
            SecurityContextHolder.clearContext();

            LOGGER.warn(
                    "JWT invalide pour {} {} : {}",
                    request.getMethod(),
                    request.getRequestURI(),
                    exception.getMessage()
            );

            writeUnauthorizedResponse(
                    response,
                    "Le token d'authentification "
                            + "est invalide."
            );

            return;

        } catch (Exception exception) {
            SecurityContextHolder.clearContext();

            LOGGER.error(
                    "Erreur pendant la validation JWT "
                            + "pour {} {}",
                    request.getMethod(),
                    request.getRequestURI(),
                    exception
            );

            writeUnauthorizedResponse(
                    response,
                    "Impossible de valider la session."
            );

            return;
        }

        /*
         * Très important :
         * cette ligne est en dehors du try/catch JWT.
         *
         * Les erreurs provenant du contrôleur, du service
         * ou de Cloudinary seront maintenant traitées
         * comme de vraies erreurs backend.
         */
        filterChain.doFilter(
                request,
                response
        );
    }

    /**
     * Valide le JWT et remplit le contexte Spring Security.
     */
    private void authentifierUtilisateur(
            String jwt,
            HttpServletRequest request
    ) {
        String email =
                jwtService.extractEmail(jwt);

        if (
                email == null
                        || email.isBlank()
        ) {
            throw new JwtException(
                    "Le token ne contient pas d'email."
            );
        }

        if (
                SecurityContextHolder
                        .getContext()
                        .getAuthentication() != null
        ) {
            return;
        }

        UserDetails userDetails =
                userDetailsService
                        .loadUserByUsername(
                                email
                        );

        boolean tokenValide =
                jwtService.isTokenValid(
                        jwt,
                        userDetails.getUsername()
                );

        if (!tokenValide) {
            throw new JwtException(
                    "La validation du token a échoué."
            );
        }

        UsernamePasswordAuthenticationToken
                authentication =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

        authentication.setDetails(
                new WebAuthenticationDetailsSource()
                        .buildDetails(request)
        );

        SecurityContextHolder
                .getContext()
                .setAuthentication(
                        authentication
                );
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

        response.setCharacterEncoding(
                "UTF-8"
        );

        String safeMessage =
                message.replace(
                        "\"",
                        "\\\""
                );

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