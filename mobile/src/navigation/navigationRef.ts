// src/navigation/navigationRef.ts

import {
  createNavigationContainerRef,
} from "@react-navigation/native";

import type {
  RootStackParamList,
} from "./RootNavigator";

/**
 * Référence globale du NavigationContainer.
 *
 * Elle permet de naviguer depuis le gestionnaire
 * des notifications, qui se trouve hors des écrans.
 */
export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();

/**
 * Ouvre le détail d'une annonce de cours.
 */
export function navigateToAnnonce(
  annonceId: number
): void {
  if (!navigationRef.isReady()) {
    console.warn(
      "Navigation non prête pour ouvrir l'annonce."
    );

    return;
  }

  navigationRef.navigate(
    "AnnonceDetails",
    {
      annonceId,
    }
  );
}

/**
 * Ouvre le détail d'une activité.
 */
export function navigateToActivite(
  activiteId: number
): void {
  if (!navigationRef.isReady()) {
    console.warn(
      "Navigation non prête pour ouvrir l'activité."
    );

    return;
  }

  navigationRef.navigate(
    "ActiviteDetails",
    {
      activiteId,
    }
  );
}

/**
 * Ouvre la liste des engagements.
 */
export function navigateToEngagements(): void {
  if (!navigationRef.isReady()) {
    return;
  }

  navigationRef.navigate(
    "MesEngagements"
  );
}

/**
 * Ouvre le centre des notifications.
 */
export function navigateToNotifications(): void {
  if (!navigationRef.isReady()) {
    return;
  }

  navigationRef.navigate(
    "Notifications"
  );
}