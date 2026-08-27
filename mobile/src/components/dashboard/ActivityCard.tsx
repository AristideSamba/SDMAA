// src/components/.../ActivityCard.tsx

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

import type {
  RootStackParamList,
} from "../../navigation/RootNavigator";

import api from "../../services/api";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

type ActivityCardNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

export interface Activity {
  id?: number;
  idActivite?: number;

  titre: string;
  description?: string;

  image?: string;

  date?: string;
  heure?: string;

  lieu?: string;

  typeActivite?: string;
  categorie?: string;
}

interface ActivityCardProps {
  activity: Activity;

  onPress?: () => void;

  showClubLogo?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                   COLORS                                   */
/* -------------------------------------------------------------------------- */

const COLORS = {
  text: "#FFFFFF",

  textSecondary: "#B3B3B3",

  textMuted: "#7C7C7C",

  border: "#2F2F2F",
};

/**
 * Couleurs opaques utilisées
 * pour les bandes de titre.
 */
const TITLE_COLORS = [
  "#315A6B", // bleu ardoise
  "#6A3D52", // prune
  "#4E6248", // vert sauge
  "#735735", // brun doré
  "#51476B", // violet
  "#376067", // bleu pétrole
  "#6B4440", // terracotta
  "#4D5668", // bleu gris
];

/* -------------------------------------------------------------------------- */
/*                              FALLBACK IMAGE                                */
/* -------------------------------------------------------------------------- */

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1555597673-b21d5c935865";

/* -------------------------------------------------------------------------- */
/*                            SERVER BASE URL                                 */
/* -------------------------------------------------------------------------- */

function getServerBaseUrl(): string {
  const axiosBaseUrl =
    api.defaults.baseURL?.trim() ?? "";

  return axiosBaseUrl
    .replace(
      /\/api\/?$/i,
      ""
    )
    .replace(
      /\/+$/,
      ""
    );
}

/* -------------------------------------------------------------------------- */
/*                              IMAGE URL                                     */
/* -------------------------------------------------------------------------- */

function buildActivityImageUrl(
  image?: string
): string {
  if (!image?.trim()) {
    return FALLBACK_IMAGE;
  }

  const cleanedImage =
    image
      .trim()
      .replace(
        /\\/g,
        "/"
      );

  const serverBaseUrl =
    getServerBaseUrl();

  if (!serverBaseUrl) {
    return FALLBACK_IMAGE;
  }

  if (
    cleanedImage.startsWith(
      "http://localhost:8080"
    ) ||
    cleanedImage.startsWith(
      "http://127.0.0.1:8080"
    )
  ) {
    return cleanedImage.replace(
      /^http:\/\/(localhost|127\.0\.0\.1):8080/i,
      serverBaseUrl
    );
  }

  if (
    cleanedImage.startsWith(
      "http://"
    ) ||
    cleanedImage.startsWith(
      "https://"
    )
  ) {
    return cleanedImage;
  }

  if (
    cleanedImage.startsWith(
      "/uploads/"
    )
  ) {
    return `${serverBaseUrl}${cleanedImage}`;
  }

  if (
    cleanedImage.startsWith(
      "uploads/"
    )
  ) {
    return `${serverBaseUrl}/${cleanedImage}`;
  }

  return `${serverBaseUrl}/uploads/${cleanedImage.replace(
    /^\/+/,
    ""
  )}`;
}

/* -------------------------------------------------------------------------- */
/*                                FORMAT DATE                                 */
/* -------------------------------------------------------------------------- */

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
      year: "numeric",
    }
  ).format(parsedDate);
}

/* -------------------------------------------------------------------------- */
/*                             ACTIVITY TYPE                                  */
/* -------------------------------------------------------------------------- */

function getTypeLabel(
  activity: Activity
): string {
  return (
    activity.typeActivite ||
    activity.categorie ||
    "Activité"
  );
}

/* -------------------------------------------------------------------------- */
/*                              ACTIVITY ID                                   */
/* -------------------------------------------------------------------------- */

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
    Number(
      rawActivityId
    );

  if (
    !Number.isInteger(
      numericActivityId
    ) ||
    numericActivityId <= 0
  ) {
    return null;
  }

  return numericActivityId;
}

/* -------------------------------------------------------------------------- */
/*                           TITLE BAND COLOR                                 */
/* -------------------------------------------------------------------------- */

function getTitleColor(
  activity: Activity
): string {
  const id =
    getActivityId(
      activity
    );

  /**
   * Une activité avec un id garde
   * toujours la même couleur.
   */
  if (id !== null) {
    return TITLE_COLORS[
      id % TITLE_COLORS.length
    ];
  }

  /**
   * Fallback déterministe basé
   * sur le titre.
   */
  const titleValue =
    activity.titre
      .split("")
      .reduce(
        (
          total,
          character
        ) =>
          total +
          character.charCodeAt(0),
        0
      );

  return TITLE_COLORS[
    titleValue %
      TITLE_COLORS.length
  ];
}

/* -------------------------------------------------------------------------- */
/*                               COMPONENT                                    */
/* -------------------------------------------------------------------------- */

export default function ActivityCard({
  activity,
  onPress,
  showClubLogo = false,
}: ActivityCardProps) {
  const navigation =
    useNavigation<ActivityCardNavigationProp>();

  /* ------------------------------------------------------------------------ */
  /*                               IMAGE URL                                  */
  /* ------------------------------------------------------------------------ */

  const activityImageUrl =
    useMemo(
      () =>
        buildActivityImageUrl(
          activity.image
        ),
      [
        activity.image,
      ]
    );

  /* ------------------------------------------------------------------------ */
  /*                              ACTIVITY ID                                 */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /*                              TITLE COLOR                                 */
  /* ------------------------------------------------------------------------ */

  const titleColor =
    useMemo(
      () =>
        getTitleColor(
          activity
        ),
      [
        activity.id,
        activity.idActivite,
        activity.titre,
      ]
    );

  /* ------------------------------------------------------------------------ */
  /*                                 IMAGE                                    */
  /* ------------------------------------------------------------------------ */

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
  }, [
    activityImageUrl,
  ]);

  /* ------------------------------------------------------------------------ */
  /*                               NAVIGATION                                 */
  /* ------------------------------------------------------------------------ */

  const handlePress =
    useCallback(() => {
      /**
       * Une action du parent
       * reste prioritaire.
       */
      if (onPress) {
        onPress();

        return;
      }

      if (
        activityId === null
      ) {
        console.error(
          "Impossible d’ouvrir les détails : identifiant d’activité invalide.",
          {
            id:
              activity.id,

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

  /* ------------------------------------------------------------------------ */
  /*                                  RENDER                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <Pressable
      onPress={
        cardIsPressable
          ? handlePress
          : undefined
      }
      disabled={
        !cardIsPressable
      }
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
      style={({
        pressed,
      }) => [
        styles.container,

        pressed &&
          cardIsPressable &&
          styles.containerPressed,
      ]}
    >
      {/* ---------------------------------------------------------------- */}
      {/* IMAGE                                                            */}
      {/* ---------------------------------------------------------------- */}

      <View
        style={
          styles.imageCard
        }
      >
        <Image
          source={{
            uri: imageUri,
          }}
          style={
            styles.image
          }
          resizeMode="cover"
          onError={(
            event
          ) => {
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
                  event
                    .nativeEvent
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

        {/* -------------------------------------------------------------- */}
        {/* TYPE BADGE                                                     */}
        {/* -------------------------------------------------------------- */}

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
            ellipsizeMode="tail"
          >
            {getTypeLabel(
              activity
            )}
          </Text>
        </View>

        {/* -------------------------------------------------------------- */}
        {/* CLUB LOGO                                                      */}
        {/* -------------------------------------------------------------- */}

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
              style={
                styles.logo
              }
              resizeMode="cover"
            />
          </View>
        ) : null}

        {/* -------------------------------------------------------------- */}
        {/* TITRE SUR L'IMAGE                                              */}
        {/* -------------------------------------------------------------- */}

        <View
  style={[
    styles.titleBand,
    {
      backgroundColor: titleColor,
    },
  ]}
>
  <View style={styles.titleAccent} />

  <Text
    style={styles.title}
    numberOfLines={1}
    ellipsizeMode="tail"
  >
    {activity.titre}
  </Text>
</View>
      </View>

      {/* ---------------------------------------------------------------- */}
      {/* DATE + LIEU                                                      */}
      {/* ---------------------------------------------------------------- */}

      <View
        style={
          styles.metadataContainer
        }
      >
        <Text
          style={
            styles.dateText
          }
          numberOfLines={1}
        >
          {formatDate(
            activity.date
          )}
        </Text>

        {activity.lieu ? (
          <Text
            style={
              styles.locationText
            }
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {activity.lieu}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const styles =
  StyleSheet.create({
    /* ------------------------------------------------------------------ */
    /* GLOBAL                                                             */
    /* ------------------------------------------------------------------ */

    container: {
      width: 220,

      marginRight: 14,
    },

    containerPressed: {
      opacity: 0.88,

      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    /* IMAGE                                                              */
    /* ------------------------------------------------------------------ */

    imageCard: {
      position: "relative",

      height: 165,

      overflow: "hidden",

      backgroundColor:
        "#2A2A2A",

      borderRadius: 10,
    },

    image: {
      width: "100%",

      height: "100%",

      backgroundColor:
        "#2A2A2A",
    },

    /* ------------------------------------------------------------------ */
    /* TYPE BADGE                                                         */
    /* ------------------------------------------------------------------ */

    typeBadge: {
      position: "absolute",

      top: 12,

      right: 12,

      maxWidth: 125,

      paddingVertical: 5,

      paddingHorizontal: 9,

      backgroundColor:
        "#181818",

      borderWidth: 1,

      borderColor:
        "#353535",

      borderRadius: 999,
    },

    typeBadgeText: {
      color:
        COLORS.text,

      fontSize: 8,

      letterSpacing: 0.7,

      textTransform:
        "uppercase",

      fontFamily:
        "Inter_700Bold",
    },

    /* ------------------------------------------------------------------ */
    /* LOGO                                                               */
    /* ------------------------------------------------------------------ */

    logoContainer: {
      position: "absolute",

      top: 12,

      left: 12,

      width: 34,

      height: 34,

      alignItems: "center",

      justifyContent:
        "center",

      overflow: "hidden",

      backgroundColor:
        "#FFFFFF",

      borderWidth: 2,

      borderColor:
        "#FFFFFF",

      borderRadius: 50,
    },

    logo: {
      width: "100%",

      height: "100%",
    },

    /* ------------------------------------------------------------------ */
    /* TITLE BAND                                                         */
    /* ------------------------------------------------------------------ */

   titleBand: {
  position: "absolute",

  left: 0,
  right: 0,
  bottom: 8,

  height: 36,

  flexDirection: "row",
  alignItems: "center",

  paddingHorizontal: 10,
},

titleAccent: {
  width: 3,
  height: 17,

  marginRight: 8,

  backgroundColor: "#FFFFFF",

},

title: {
  flex: 1,

  color: COLORS.text,

  fontSize: 13,
  lineHeight: 17,

  letterSpacing: -0.15,

  fontFamily: "Inter_700Bold",
},

    /* ------------------------------------------------------------------ */
    /* DATE + LIEU                                                        */
    /* ------------------------------------------------------------------ */

    metadataContainer: {
      marginTop: 9,

      paddingHorizontal: 2,
    },

    dateText: {
      color:
        COLORS.textSecondary,

      fontSize: 11,

      lineHeight: 15,

      fontFamily:
        "Inter_600SemiBold",
    },

    locationText: {
      marginTop: 3,

      color:
        COLORS.textMuted,

      fontSize: 10,

      lineHeight: 14,

      fontFamily:
        "Inter_400Regular",
    },
  });