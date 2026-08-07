import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useNavigation,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  LinearGradient,
} from "expo-linear-gradient";

import type {
  RootStackParamList,
} from "../../navigation/RootNavigator";

import api from "../../services/api";
// Adapte uniquement ces chemins selon l’emplacement réel de ActivityCard.

type ActivityCardNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

export interface Activity {
  id?: number;
  idActivite?: number;

  titre: string;
  description?: string;

  /**
   * Peut contenir :
   * - une URL complète ;
   * - /uploads/image.jpg ;
   * - uploads/image.jpg ;
   * - seulement image.jpg.
   */
  image?: string;

  date?: string;
  heure?: string;
  lieu?: string;
  typeActivite?: string;
  categorie?: string;
}

interface ActivityCardProps {
  activity: Activity;

  /**
   * Si onPress est fourni par le parent,
   * il reste prioritaire.
   *
   * Sinon, la carte ouvre automatiquement
   * l’écran ActiviteDetails.
   */
  onPress?: () => void;

  showClubLogo?: boolean;
}

const COLORS = {
  card: "#1B1B1B",
  text: "#FFFFFF",
  textSecondary: "#B3B3B3",
  border: "#2F2F2F",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1555597673-b21d5c935865";

/**
 * Retourne l’adresse du serveur sans le suffixe /api.
 *
 * Exemple :
 * http://192.168.1.20:8080/api
 * devient :
 * http://192.168.1.20:8080
 */
function getServerBaseUrl(): string {
  const axiosBaseUrl =
    api.defaults.baseURL?.trim() ?? "";

  return axiosBaseUrl
    .replace(/\/api\/?$/i, "")
    .replace(/\/+$/, "");
}

/**
 * Transforme le chemin d’image renvoyé par Spring Boot
 * en URL exploitable par React Native.
 */
function buildActivityImageUrl(image?: string): string {
  if (!image?.trim()) {
    return FALLBACK_IMAGE;
  }

  const cleanedImage = image
    .trim()
    .replace(/\\/g, "/");

  const serverBaseUrl =
    getServerBaseUrl();

  if (!serverBaseUrl) {
    return FALLBACK_IMAGE;
  }

  if (
    cleanedImage.startsWith("http://localhost:8080") ||
    cleanedImage.startsWith("http://127.0.0.1:8080")
  ) {
    return cleanedImage.replace(
      /^http:\/\/(localhost|127\.0\.0\.1):8080/i,
      serverBaseUrl
    );
  }

  if (
    cleanedImage.startsWith("http://") ||
    cleanedImage.startsWith("https://")
  ) {
    return cleanedImage;
  }

  if (cleanedImage.startsWith("/uploads/")) {
    return `${serverBaseUrl}${cleanedImage}`;
  }

  if (cleanedImage.startsWith("uploads/")) {
    return `${serverBaseUrl}/${cleanedImage}`;
  }

  return `${serverBaseUrl}/uploads/${cleanedImage.replace(
    /^\/+/,
    ""
  )}`;
}

function formatDate(
  date?: string
): string {
  if (!date) {
    return "Date à confirmer";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return date;
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "short",
    }
  ).format(parsedDate);
}

function getTypeLabel(
  activity: Activity
): string {
  return (
    activity.typeActivite ||
    activity.categorie ||
    "Activité"
  );
}

function getActivityId(
  activity: Activity
): number | null {
  const rawActivityId =
    activity.idActivite ??
    activity.id;

  if (
    rawActivityId === undefined ||
    rawActivityId === null
  ) {
    return null;
  }

  const numericActivityId =
    Number(rawActivityId);

  if (
    !Number.isInteger(numericActivityId) ||
    numericActivityId <= 0
  ) {
    return null;
  }

  return numericActivityId;
}

export default function ActivityCard({
  activity,
  onPress,
  showClubLogo = false,
}: ActivityCardProps) {
  const navigation =
    useNavigation<ActivityCardNavigationProp>();

  /**
   * L’URL est reconstruite dès que le chemin de l’image change.
   */
  const activityImageUrl =
    useMemo(
      () =>
        buildActivityImageUrl(
          activity.image
        ),
      [activity.image]
    );

  /**
   * On sécurise l’identifiant avant la navigation.
   *
   * Le backend peut renvoyer :
   * - id ;
   * - ou idActivite.
   */
  const activityId =
    useMemo(
      () =>
        getActivityId(
          activity
        ),
      [
        activity.id,
        activity.idActivite,
      ]
    );

  const [
    imageUri,
    setImageUri,
  ] = useState(
    activityImageUrl
  );

  useEffect(() => {
    setImageUri(
      activityImageUrl
    );
  }, [activityImageUrl]);

  const handlePress =
    useCallback((): void => {
      /**
       * Si le parent fournit une action personnalisée,
       * on l’exécute en priorité.
       */
      if (onPress) {
        onPress();
        return;
      }

      if (activityId === null) {
        console.error(
          "Impossible d’ouvrir les détails : identifiant d’activité invalide.",
          {
            id: activity.id,
            idActivite:
              activity.idActivite,
            titre:
              activity.titre,
          }
        );

        return;
      }

      navigation.navigate(
        "ActiviteDetails",
        {
          activiteId:
            activityId,
        }
      );
    }, [
      activity.id,
      activity.idActivite,
      activity.titre,
      activityId,
      navigation,
      onPress,
    ]);

  const cardIsPressable =
    Boolean(onPress) ||
    activityId !== null;

  return (
    <Pressable
      onPress={
        cardIsPressable
          ? handlePress
          : undefined
      }
      disabled={!cardIsPressable}
      accessibilityRole={
        cardIsPressable
          ? "button"
          : undefined
      }
      accessibilityLabel={
        cardIsPressable
          ? `Voir l'activité ${activity.titre}`
          : undefined
      }
      accessibilityHint={
        cardIsPressable
          ? "Ouvre les détails de l’activité"
          : undefined
      }
      style={({ pressed }) => [
        styles.container,

        pressed &&
          cardIsPressable &&
          styles.containerPressed,
      ]}
    >
      <View
        style={
          styles.imageContainer
        }
      >
        <Image
          source={{
            uri: imageUri,
          }}
          style={styles.image}
          resizeMode="cover"
          onError={(event) => {
            console.error(
              "Erreur de chargement de l’image de l’activité :",
              {
                titre:
                  activity.titre,

                imageBackend:
                  activity.image,

                urlConstruite:
                  imageUri,

                erreur:
                  event.nativeEvent
                    .error,
              }
            );

            if (
              imageUri !==
              FALLBACK_IMAGE
            ) {
              setImageUri(
                FALLBACK_IMAGE
              );
            }
          }}
        />

        <LinearGradient
          colors={[
            "transparent",
            "rgba(0,0,0,0.88)",
          ]}
          style={styles.overlay}
        />

        <View
          style={
            styles.typeBadge
          }
        >
          <Text
            style={
              styles.typeBadgeText
            }
            numberOfLines={1}
          >
            {getTypeLabel(
              activity
            )}
          </Text>
        </View>

        {showClubLogo ? (
          <View
            style={
              styles.logoContainer
            }
          >
            <Image
              source={require(
                "../../../assets/sdmma.png"
              )}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
        ) : null}

        <View
          style={styles.imageText}
        >
          <Text
            style={styles.title}
            numberOfLines={2}
          >
            {activity.titre}
          </Text>

          <View
            style={
              styles.metadataRow
            }
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={
                COLORS.textSecondary
              }
            />

            <Text
              style={
                styles.metadata
              }
            >
              {formatDate(
                activity.date
              )}
            </Text>
          </View>

          {activity.lieu ? (
            <View
              style={
                styles.metadataRow
              }
            >
              <Ionicons
                name="location-outline"
                size={14}
                color={
                  COLORS.textSecondary
                }
              />

              <Text
                style={
                  styles.metadata
                }
                numberOfLines={1}
              >
                {activity.lieu}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    container: {
      width: 240,
      marginRight: 14,

      backgroundColor:
        COLORS.card,

      borderWidth: 1,
      borderColor:
        COLORS.border,

      borderRadius: 24,

      shadowColor:
        "#000000",

      shadowOpacity: 0.22,

      shadowRadius: 12,

      shadowOffset: {
        width: 0,
        height: 8,
      },

      elevation: 5,
    },

    containerPressed: {
      opacity: 0.84,

      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    imageContainer: {
      position: "relative",

      height: 200,

      overflow: "hidden",

      borderRadius: 23,
    },

    image: {
      width: "100%",
      height: "100%",

      backgroundColor:
        "#2A2A2A",
    },

    overlay: {
      ...StyleSheet.absoluteFillObject,
    },

    typeBadge: {
      position: "absolute",

      top: 13,
      right: 13,

      maxWidth: 125,

      paddingVertical: 7,
      paddingHorizontal: 10,

      backgroundColor:
        "rgba(0,0,0,0.58)",

      borderWidth: 1,

      borderColor:
        "rgba(255,255,255,0.11)",

      borderRadius: 999,
    },

    typeBadgeText: {
      color: COLORS.text,

      fontSize: 9,

      letterSpacing: 0.8,

      textTransform:
        "uppercase",

      fontFamily:
        "Inter_700Bold",
    },

    logoContainer: {
      position: "absolute",

      top: 13,
      left: 13,

      width: 35,
      height: 35,

      alignItems: "center",
      justifyContent: "center",

      overflow: "hidden",

      borderWidth: 2,

      borderColor:
        "rgba(255,255,255,0.65)",

      borderRadius: 50,
    },

    logo: {
      width: "100%",
      height: "100%",
    },

    imageText: {
      position: "absolute",

      right: 16,
      bottom: 16,
      left: 16,
    },

    title: {
      color: COLORS.text,

      fontSize: 20,
      lineHeight: 25,

      letterSpacing: -0.4,

      fontFamily:
        "Inter_700Bold",
    },

    metadataRow: {
      flexDirection: "row",

      alignItems: "center",

      marginTop: 8,
    },

    metadata: {
      flexShrink: 1,

      marginLeft: 6,

      color:
        COLORS.textSecondary,

      fontSize: 11,

      fontFamily:
        "Inter_600SemiBold",
    },
  });