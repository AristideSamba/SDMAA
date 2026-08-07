// src/services/NotificationNavigationService.ts

import type {
  Notification,
} from "expo-notifications";

import {
  navigateToActivite,
  navigateToAnnonce,
  navigateToEngagements,
  navigateToNotifications,
} from "../navigation/navigationRef";

/**
 * Types de notifications autorisés
 * par l'application mobile.
 */
type NotificationType =
  | "ANNONCE_COURS"
  | "ACTIVITE"
  | "INSCRIPTION_ACTIVITE"
  | "VALIDATION_INSCRIPTION"
  | "PAIEMENT"
  | "COMMANDE"
  | "NOTIFICATIONS";

interface NotificationData {
  type?: unknown;

  annonceId?: unknown;
  activiteId?: unknown;
  inscriptionId?: unknown;
  commandeId?: unknown;

  /**
   * Compatibilité avec d'anciens payloads
   * qui utiliseraient simplement "id".
   */
  id?: unknown;
}

/**
 * Convertit une valeur reçue dans le payload
 * en identifiant numérique fiable.
 */
function toValidId(
  value: unknown
): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim() !== ""
  ) {
    const parsed = Number(value);

    if (
      Number.isFinite(parsed) &&
      parsed > 0
    ) {
      return parsed;
    }
  }

  return null;
}

/**
 * Normalise le type envoyé par le backend.
 */
function normalizeType(
  value: unknown
): NotificationType | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized =
    value.trim().toUpperCase();

  switch (normalized) {
    case "ANNONCE":
    case "ANNONCE_COURS":
      return "ANNONCE_COURS";

    case "ACTIVITY":
    case "NOUVELLE_ACTIVITE":
    case "ACTIVITE":
      return "ACTIVITE";

    case "INSCRIPTION":
    case "INSCRIPTION_ACTIVITE":
      return "INSCRIPTION_ACTIVITE";

    case "VALIDATION_INSCRIPTION":
      return "VALIDATION_INSCRIPTION";

    case "PAIEMENT":
      return "PAIEMENT";

    case "COMMANDE":
      return "COMMANDE";

    case "NOTIFICATION":
    case "NOTIFICATIONS":
      return "NOTIFICATIONS";

    default:
      return null;
  }
}

/**
 * Analyse la notification sélectionnée
 * et ouvre la page correspondante.
 */
export function handleNotificationNavigation(
  notification: Notification
): void {
  const rawData =
    notification.request.content
      .data as NotificationData;

  const type =
    normalizeType(rawData?.type);

  console.log(
    "Navigation depuis notification :",
    {
      type,
      data: rawData,
    }
  );

  switch (type) {
    case "ANNONCE_COURS": {
      const annonceId =
        toValidId(
          rawData.annonceId ??
            rawData.id
        );

      if (!annonceId) {
        console.warn(
          "La notification d'annonce ne contient pas d'annonceId valide."
        );

        navigateToNotifications();
        return;
      }

      navigateToAnnonce(
        annonceId
      );

      return;
    }

    case "ACTIVITE": {
      const activiteId =
        toValidId(
          rawData.activiteId ??
            rawData.id
        );

      if (!activiteId) {
        console.warn(
          "La notification d'activité ne contient pas d'activiteId valide."
        );

        navigateToNotifications();
        return;
      }

      navigateToActivite(
        activiteId
      );

      return;
    }

    case "INSCRIPTION_ACTIVITE":
    case "VALIDATION_INSCRIPTION":
    case "PAIEMENT":
      navigateToEngagements();
      return;

    case "COMMANDE":
      /*
       * Lorsque tu auras une route MesCommandes,
       * on pourra l'ouvrir ici.
       *
       * Pour le moment, on redirige vers
       * le centre des notifications.
       */
      navigateToNotifications();
      return;

    case "NOTIFICATIONS":
      navigateToNotifications();
      return;

    default:
      /*
       * Une notification inconnue ne doit
       * jamais provoquer un écran blanc.
       */
      console.warn(
        "Type de notification inconnu :",
        rawData?.type
      );

      navigateToNotifications();
  }
}