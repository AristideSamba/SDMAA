package com.taekwondo.sdmaa.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExpoPushNotificationService {

    private static final String EXPO_PUSH_URL =
            "https://exp.host/--/api/v2/push/send";

    private final ObjectMapper objectMapper;

    /**
     * Envoie une notification push Expo à un téléphone.
     *
     * L'échec de l'envoi push ne doit pas annuler
     * la création de l'annonce en base.
     */
    public void envoyerNotification(
            String expoPushToken,
            String titre,
            String message,
            Map<String, Object> donnees
    ) {
        if (
                expoPushToken == null
                        || expoPushToken.isBlank()
        ) {
            return;
        }

        if (!estTokenExpoValide(expoPushToken)) {
            System.err.println(
                    "Token Expo invalide ignoré : "
                            + expoPushToken
            );

            return;
        }

        try {
            RestTemplate restTemplate =
                    new RestTemplate();

            HttpHeaders headers =
                    new HttpHeaders();

            headers.setContentType(
                    MediaType.APPLICATION_JSON
            );

            headers.setAccept(
                    java.util.List.of(
                            MediaType.APPLICATION_JSON
                    )
            );

            Map<String, Object> payload =
                    new HashMap<>();

            payload.put(
                    "to",
                    expoPushToken
            );

            payload.put(
                    "title",
                    titre
            );

            payload.put(
                    "body",
                    message
            );

            payload.put(
                    "sound",
                    "default"
            );

            payload.put(
                    "priority",
                    "high"
            );

            if (
                    donnees != null
                            && !donnees.isEmpty()
            ) {
                payload.put(
                        "data",
                        donnees
                );
            }

            HttpEntity<Map<String, Object>> request =
                    new HttpEntity<>(
                            payload,
                            headers
                    );

            ResponseEntity<String> response =
                    restTemplate.exchange(
                            EXPO_PUSH_URL,
                            HttpMethod.POST,
                            request,
                            String.class
                    );

            verifierReponseExpo(
                    response.getBody(),
                    expoPushToken
            );
        } catch (RestClientException exception) {
            System.err.println(
                    "Erreur HTTP pendant l'envoi Expo au token "
                            + expoPushToken
                            + " : "
                            + exception.getMessage()
            );
        } catch (Exception exception) {
            System.err.println(
                    "Erreur pendant l'envoi de la notification Expo : "
                            + exception.getMessage()
            );
        }
    }

    /**
     * Surcharge pratique lorsque la notification
     * ne contient pas de données de navigation.
     */
    public void envoyerNotification(
            String expoPushToken,
            String titre,
            String message
    ) {
        envoyerNotification(
                expoPushToken,
                titre,
                message,
                Map.of()
        );
    }

    private boolean estTokenExpoValide(
            String token
    ) {
        return (
                token.startsWith(
                        "ExponentPushToken["
                )
                        || token.startsWith(
                        "ExpoPushToken["
                )
        )
                && token.endsWith("]");
    }

    /**
     * Un statut HTTP 200 ne garantit pas que le ticket
     * Expo soit accepté. On inspecte donc le champ
     * data.status de la réponse.
     */
    private void verifierReponseExpo(
            String responseBody,
            String expoPushToken
    ) {
        if (
                responseBody == null
                        || responseBody.isBlank()
        ) {
            System.err.println(
                    "Réponse Expo vide pour le token : "
                            + expoPushToken
            );

            return;
        }

        try {
            JsonNode root =
                    objectMapper.readTree(
                            responseBody
                    );

            JsonNode data =
                    root.path("data");

            String status =
                    data.path("status")
                            .asText("");

            if ("ok".equalsIgnoreCase(status)) {
                String ticketId =
                        data.path("id")
                                .asText("");

                System.out.println(
                        "Notification Expo acceptée. Ticket : "
                                + ticketId
                );

                return;
            }

            String message =
                    data.path("message")
                            .asText(
                                    "Erreur Expo inconnue"
                            );

            String errorCode =
                    data.path("details")
                            .path("error")
                            .asText("");

            System.err.println(
                    "Notification Expo refusée pour "
                            + expoPushToken
                            + " : "
                            + message
                            + (
                            errorCode.isBlank()
                                    ? ""
                                    : " (" + errorCode + ")"
                    )
            );
        } catch (Exception exception) {
            System.err.println(
                    "Impossible d'analyser la réponse Expo : "
                            + responseBody
            );
        }
    }
}