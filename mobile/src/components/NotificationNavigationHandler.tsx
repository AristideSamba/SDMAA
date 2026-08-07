// src/components/NotificationNavigationHandler.tsx

import React, {
  useCallback,
  useEffect,
  useRef,
} from "react";

import * as Notifications
  from "expo-notifications";

import {
  useNavigation,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  useAuth,
} from "../context/AuthContext";

import type {
  RootStackParamList,
} from "../navigation/RootNavigator";

type RootNavigation =
  NativeStackNavigationProp<RootStackParamList>;

interface NotificationData {
  type?: unknown;

  activiteId?: unknown;
  activityId?: unknown;

  annonceId?: unknown;
  announcementId?: unknown;

  coursId?: unknown;
  inscriptionId?: unknown;

  id?: unknown;
}

function toValidId(
  value: unknown
): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value > 0
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim() !== ""
  ) {
    const parsed = Number(
      value.trim()
    );

    if (
      Number.isFinite(parsed) &&
      Number.isInteger(parsed) &&
      parsed > 0
    ) {
      return parsed;
    }
  }

  return null;
}

function normalizeType(
  value: unknown
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(/[\s-]+/g, "_");
}

function isActivityNotification(
  type: string
): boolean {
  return [
    "ACTIVITE",
    "NOUVELLE_ACTIVITE",
    "RAPPEL_ACTIVITE",
    "VALIDATION_INSCRIPTION",
    "VALIDATION_INSCRIPTION_ACTIVITE",
    "INSCRIPTION_VALIDEE",
    "REFUS_INSCRIPTION",
    "REFUS_INSCRIPTION_ACTIVITE",
    "INSCRIPTION_REFUSEE",
  ].includes(type);
}

function isAnnouncementNotification(
  type: string
): boolean {
  return [
    "ANNONCE",
    "ANNONCE_COURS",
    "NOUVELLE_ANNONCE",
  ].includes(type);
}

export default function NotificationNavigationHandler() {
  const navigation =
    useNavigation<RootNavigation>();

  const {
    loading,
    isAuthenticated,
  } = useAuth();

  const lastNotificationResponse =
    Notifications.useLastNotificationResponse();

  const processedNotificationIdRef =
    useRef<string | null>(null);

  const handleResponse =
    useCallback(
      (
        response:
          Notifications.NotificationResponse
      ): void => {
        if (
          loading ||
          !isAuthenticated
        ) {
          return;
        }

        const notification =
          response.notification;

        const notificationId =
          notification.request.identifier;

        if (
          processedNotificationIdRef.current ===
          notificationId
        ) {
          return;
        }

        const rawData =
          notification.request.content.data;

        const data =
          (
            rawData &&
            typeof rawData === "object"
          )
            ? rawData as NotificationData
            : {};

        const type =
          normalizeType(data.type);

        console.log(
          "Notification sélectionnée :",
          {
            notificationId,
            type,
            data,
          }
        );

        if (
          isActivityNotification(type)
        ) {
          /*
           * activiteId est le nom officiel.
           * activityId reste accepté temporairement
           * pour les anciens pushes ou anciens builds.
           */
          const activiteId =
            toValidId(
              data.activiteId ??
                data.activityId ??
                data.id
            );

          if (!activiteId) {
            console.warn(
              "activiteId absent ou invalide :",
              data
            );

            processedNotificationIdRef.current =
              notificationId;

            navigation.navigate(
              "Notifications"
            );

            return;
          }

          processedNotificationIdRef.current =
            notificationId;

          navigation.navigate(
            "ActiviteDetails",
            {
              activiteId,
            }
          );

          return;
        }

        if (
          isAnnouncementNotification(type)
        ) {
          const annonceId =
            toValidId(
              data.annonceId ??
                data.announcementId ??
                data.id
            );

          if (!annonceId) {
            console.warn(
              "annonceId absent ou invalide :",
              data
            );

            processedNotificationIdRef.current =
              notificationId;

            navigation.navigate(
              "Notifications"
            );

            return;
          }

          processedNotificationIdRef.current =
            notificationId;

          navigation.navigate(
            "AnnonceDetails",
            {
              annonceId,
            }
          );

          return;
        }

        console.warn(
          "Type de notification non reconnu :",
          {
            type,
            data,
          }
        );

        processedNotificationIdRef.current =
          notificationId;

        navigation.navigate(
          "Notifications"
        );
      },
      [
        isAuthenticated,
        loading,
        navigation,
      ]
    );

  /**
   * Gère le clic lorsque l’application est
   * ouverte ou placée en arrière-plan.
   */
  useEffect(() => {
    const subscription =
      Notifications
        .addNotificationResponseReceivedListener(
          handleResponse
        );

    return () => {
      subscription.remove();
    };
  }, [handleResponse]);

  /**
   * Gère le clic lorsque l’application
   * était complètement fermée.
   */
  useEffect(() => {
    if (
      !lastNotificationResponse ||
      loading ||
      !isAuthenticated
    ) {
      return;
    }

    handleResponse(
      lastNotificationResponse
    );

    Notifications
      .clearLastNotificationResponseAsync()
      .catch((error) => {
        console.error(
          "Impossible d’effacer la dernière notification :",
          error
        );
      });
  }, [
    handleResponse,
    isAuthenticated,
    lastNotificationResponse,
    loading,
  ]);

  return null;
}