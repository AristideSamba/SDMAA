import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  LinearGradient,
} from "expo-linear-gradient";

import {
  StatusBar,
} from "expo-status-bar";

import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from "@react-navigation/native";

import Reanimated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import api from "../services/api";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

interface NotificationUtilisateur {
  id?: number;
  idNotification?: number;

  typeNotification?: string;

  titre?: string;
  titreCible?: string;
  coursTitre?: string;
  message?: string;

  activiteId?: number;
  annonceId?: number;
  coursId?: number;
  inscriptionId?: number;

  /*
   * Champs conservés en option pour rester
   * compatible avec d’anciennes réponses.
   */
  jour?: string;
  heureDebut?: string;
  heureFin?: string;

  dateCreation?: string;
  dateLecture?: string;

  estLue?: boolean;
  lu?: boolean;
}

interface NotificationCardProps {
  notification: NotificationUtilisateur;
  isUpdating: boolean;
  onPress: () => void;
}

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const COLORS = {
  background: "#121212",
  backgroundElevated: "#171717",
  card: "#1B1B1B",
  cardLight: "#232323",
  cardSoft: "#292929",
  border: "#303030",
  borderSoft: "#282828",
  text: "#FFFFFF",
  textSecondary: "#B3B3B3",
  textMuted: "#7C7C7C",
  red: "#E50914",
  black: "#080808",
};

/**
 * Adapte uniquement ces deux constantes si tes routes backend sont différentes.
 */
const NOTIFICATIONS_ENDPOINT =
  "/notifications";

const MARK_AS_READ_ENDPOINT = (
  notificationId: number
): string =>
  `/notifications/${notificationId}/lire`;

const MARK_ALL_AS_READ_ENDPOINT =
  "/notifications/lire-toutes";

function isNotificationRead(
  notification: NotificationUtilisateur
): boolean {
  return (
    notification.estLue === true ||
    notification.lu === true
  );
}

function normalizeNotificationType(
  value?: string
): string {
  return String(value || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");
}

function getNotificationPresentation(
  typeNotification?: string
): {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
} {
  const type =
    normalizeNotificationType(
      typeNotification
    );

  if (type === "ANNONCE_COURS") {
    return {
      icon: "megaphone-outline",
      color: "#60A5FA",
      backgroundColor:
        "rgba(96,165,250,0.12)",
    };
  }

  if (
  type === "ANNONCE" ||
  type === "NOUVELLE_ANNONCE"
) {
  return {
    icon: "newspaper-outline",
    color: "#60A5FA",
    backgroundColor:
      "rgba(96,165,250,0.12)",
  };
}

  if (type === "NOUVELLE_ACTIVITE") {
    return {
      icon: "fitness-outline",
      color: COLORS.red,
      backgroundColor:
        "rgba(229,9,20,0.12)",
    };
  }

  if (type === "VALIDATION_INSCRIPTION") {
    return {
      icon: "checkmark-circle-outline",
      color: "#34D399",
      backgroundColor:
        "rgba(52,211,153,0.12)",
    };
  }

  if (type === "REFUS_INSCRIPTION") {
    return {
      icon: "close-circle-outline",
      color: "#F87171",
      backgroundColor:
        "rgba(248,113,113,0.12)",
    };
  }

  if (
    type === "RAPPEL_ACTIVITE_J3" ||
    type === "RAPPEL_ACTIVITE_H3"
  ) {
    return {
      icon: "alarm-outline",
      color: "#FBBF24",
      backgroundColor:
        "rgba(251,191,36,0.12)",
    };
  }

  return {
    icon: "notifications-outline",
    color: COLORS.red,
    backgroundColor:
      "rgba(229,9,20,0.12)",
  };
}

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function MesNotificationsScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NavigationProp<ParamListBase>>();

  const [
    notifications,
    setNotifications,
  ] = useState<NotificationUtilisateur[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    updatingId,
    setUpdatingId,
  ] = useState<number | null>(null);

  const [
    markingAllAsRead,
    setMarkingAllAsRead,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const loadNotifications =
    useCallback(async (): Promise<void> => {
      try {
        setError("");

        const response =
          await api.get<NotificationUtilisateur[]>(
            NOTIFICATIONS_ENDPOINT
          );

        const data = Array.isArray(
          response.data
        )
          ? response.data
          : [];

        setNotifications(data);
      } catch (requestError) {
        console.error(
          "Erreur lors du chargement des notifications :",
          requestError
        );

        setError(
          "Impossible de charger vos notifications pour le moment."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleRefresh =
    useCallback((): void => {
      setRefreshing(true);
      loadNotifications();
    }, [loadNotifications]);

  const markNotificationAsRead =
    useCallback(
      async (
        notification: NotificationUtilisateur
      ): Promise<boolean> => {
        if (isNotificationRead(notification)) {
          return true;
        }

        const notificationId =
          notification.idNotification ??
          notification.id;

        if (!notificationId) {
          setError(
            "Impossible d’identifier cette notification."
          );

          return false;
        }

        try {
          setError("");
          setUpdatingId(notificationId);

          await api.put(
            MARK_AS_READ_ENDPOINT(
              notificationId
            )
          );

          setNotifications(
            (currentNotifications) =>
              currentNotifications.map(
                (currentNotification) => {
                  const currentId =
                    currentNotification.idNotification ??
                    currentNotification.id;

                  return currentId ===
                    notificationId
                    ? {
                        ...currentNotification,
                        estLue: true,
                        lu: true,
                        dateLecture:
                          new Date().toISOString(),
                      }
                    : currentNotification;
                }
              )
          );

          return true;
        } catch (requestError) {
          console.error(
            "Erreur lors de la mise à jour de la notification :",
            requestError
          );

          setError(
            "La notification n’a pas pu être marquée comme lue."
          );

          return false;
        } finally {
          setUpdatingId(null);
        }
      },
      []
    );

  const navigateFromNotification =
    useCallback(
      (
        notification: NotificationUtilisateur
      ): void => {
        const type =
          normalizeNotificationType(
            notification.typeNotification
          );

       if (type === "ANNONCE_COURS") {
  /*
   * Aucun écran de détail spécifique
   * n’existe pour les annonces de cours.
   *
   * La notification est simplement marquée
   * comme lue et reste visible dans le centre
   * de notifications.
   */
  return;
}

if (type === "ANNONCE_COURS") {
  return;
}

if (
  (
    type === "ANNONCE" ||
    type === "NOUVELLE_ANNONCE"
  ) &&
  notification.annonceId
) {
  navigation.navigate(
    "AnnonceDetails",
    {
      annonceId:
        notification.annonceId,
    }
  );

  return;
}

        const activityTypes = [
          "NOUVELLE_ACTIVITE",
          "VALIDATION_INSCRIPTION",
          "REFUS_INSCRIPTION",
          "RAPPEL_ACTIVITE_J3",
          "RAPPEL_ACTIVITE_H3",
        ];

        if (
          activityTypes.includes(type) &&
          notification.activiteId
        ) {
          navigation.navigate(
            "ActiviteDetails",
            {
              activiteId:
                notification.activiteId,
            }
          );

          return;
        }

        console.warn(
          "Aucune destination associée à la notification :",
          {
            type,
            notification,
          }
        );
      },
      [navigation]
    );

  const handleNotificationPress =
    useCallback(
      async (
        notification: NotificationUtilisateur
      ): Promise<void> => {
        const success =
          await markNotificationAsRead(
            notification
          );

        if (!success) {
          return;
        }

        navigateFromNotification(
          notification
        );
      },
      [
        markNotificationAsRead,
        navigateFromNotification,
      ]
    );

  const handleMarkAllAsRead =
    useCallback(async (): Promise<void> => {
      if (markingAllAsRead) {
        return;
      }

      try {
        setError("");
        setMarkingAllAsRead(true);

        await api.put(
          MARK_ALL_AS_READ_ENDPOINT
        );

        const now =
          new Date().toISOString();

        setNotifications(
          (currentNotifications) =>
            currentNotifications.map(
              (notification) => ({
                ...notification,
                estLue: true,
                lu: true,
                dateLecture:
                  notification.dateLecture ??
                  now,
              })
            )
        );
      } catch (requestError) {
        console.error(
          "Erreur lors du marquage global :",
          requestError
        );

        setError(
          "Impossible de marquer toutes les notifications comme lues."
        );
      } finally {
        setMarkingAllAsRead(false);
      }
    }, [markingAllAsRead]);

  const sortedNotifications =
    useMemo(() => {
      return [...notifications].sort(
        (first, second) => {
          const firstUnread =
            !isNotificationRead(first);

          const secondUnread =
            !isNotificationRead(second);

          if (
            firstUnread !== secondUnread
          ) {
            return firstUnread ? -1 : 1;
          }

          const firstDate =
            new Date(
              first.dateCreation ?? 0
            ).getTime();

          const secondDate =
            new Date(
              second.dateCreation ?? 0
            ).getTime();

          return secondDate - firstDate;
        }
      );
    }, [notifications]);

  const unreadCount =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            !isNotificationRead(notification)
        ).length,
      [notifications]
    );

  if (loading) {
    return <NotificationsLoading />;
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <StatusBar style="light" />

      <View style={styles.container}>
        <FlatList
          data={sortedNotifications}
          keyExtractor={(
            notification,
            index
          ) =>
            String(
              notification.idNotification ??
                notification.id ??
                index
            )
          }
          renderItem={({
            item,
            index,
          }) => {
            const itemId =
              item.idNotification ??
              item.id ??
              -1;

            return (
              <Reanimated.View
                entering={FadeInDown
                  .duration(420)
                  .delay(index * 55)}
              >
                <NotificationCard
                  notification={item}
                  isUpdating={
                    updatingId === itemId
                  }
                  onPress={() =>
                    handleNotificationPress(item)
                  }
                />
              </Reanimated.View>
            );
          }}
          ListHeaderComponent={
            <View>
              <Reanimated.View
                entering={FadeInUp.duration(
                  350
                )}
                style={styles.topNavigation}
              >
                <Pressable
                  onPress={() =>
                    navigation.goBack()
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Retour à l’écran précédent"
                  hitSlop={10}
                  style={({ pressed }) => [
                    styles.backButton,
                    pressed &&
                      styles.backButtonPressed,
                  ]}
                >
                  <Ionicons
                    name="chevron-back"
                    size={23}
                    color={COLORS.text}
                  />
                </Pressable>

                <Text style={styles.pageTitle}>
                  Notifications
                </Text>

                <View
                  style={
                    styles.headerRightSpacer
                  }
                  accessible={false}
                />
              </Reanimated.View>

              <Reanimated.View
                entering={FadeInUp
                  .duration(450)
                  .delay(70)}
              >
                <NotificationsHeader
                  total={
                    notifications.length
                  }
                  unreadCount={unreadCount}
                />
              </Reanimated.View>

              {error ? (
                <ErrorBanner
                  message={error}
                  onRetry={
                    loadNotifications
                  }
                />
              ) : null}

              <View
                style={styles.sectionHeader}
              >
                <View>
                  <Text
                    style={
                      styles.sectionEyebrow
                    }
                  >
                    BOÎTE DE RÉCEPTION
                  </Text>

                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Mes notifications
                  </Text>
                </View>

                <View
                  style={
                    styles.sectionActions
                  }
                >
                  {unreadCount > 0 ? (
                    <Pressable
                      onPress={
                        handleMarkAllAsRead
                      }
                      disabled={
                        markingAllAsRead
                      }
                      accessibilityRole="button"
                      accessibilityLabel="Tout marquer comme lu"
                      style={({ pressed }) => [
                        styles.markAllButton,
                        pressed &&
                          styles.buttonPressed,
                        markingAllAsRead &&
                          styles.markAllButtonDisabled,
                      ]}
                    >
                      {markingAllAsRead ? (
                        <ActivityIndicator
                          size="small"
                          color={COLORS.text}
                        />
                      ) : (
                        <>
                          <Ionicons
                            name="checkmark-done"
                            size={15}
                            color={COLORS.text}
                          />

                          <Text
                            style={
                              styles.markAllButtonText
                            }
                          >
                            Tout lire
                          </Text>
                        </>
                      )}
                    </Pressable>
                  ) : null}

                  <View
                    style={styles.countPill}
                  >
                    <Text
                      style={styles.countText}
                    >
                      {
                        sortedNotifications.length
                      }
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          }
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom:
                insets.bottom + 110,
            },
            sortedNotifications.length ===
              0 &&
              styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={
            false
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.red}
              colors={[COLORS.red]}
              progressBackgroundColor={
                COLORS.card
              }
            />
          }
          ListEmptyComponent={
            <EmptyNotifications />
          }
        />
      </View>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/*                                SUBCOMPONENTS                               */
/* -------------------------------------------------------------------------- */

function NotificationsHeader({
  total,
  unreadCount,
}: {
  total: number;
  unreadCount: number;
}) {
  return (
    <LinearGradient
      colors={[
        "#2B1012",
        COLORS.card,
        COLORS.backgroundElevated,
      ]}
      start={{
        x: 0,
        y: 0,
      }}
      end={{
        x: 1,
        y: 1,
      }}
      style={styles.heroCard}
    >
      <View style={styles.heroGlow} />

      <View style={styles.heroTopRow}>
        <View style={styles.heroIcon}>
          <Ionicons
            name="notifications"
            size={23}
            color={COLORS.text}
          />
        </View>

        <View style={styles.heroBadge}>
          <View
            style={[
              styles.heroBadgeDot,
              unreadCount === 0 &&
                styles.heroBadgeDotRead,
            ]}
          />

          <Text style={styles.heroBadgeText}>
            {unreadCount > 0
              ? `${unreadCount} NON LUE${
                  unreadCount > 1 ? "S" : ""
                }`
              : "À JOUR"}
          </Text>
        </View>
      </View>

      <View style={styles.heroContent}>
        <Text style={styles.heroEyebrow}>
          SDMAA
        </Text>

        <Text style={styles.heroTitle}>
          Restez informé
        </Text>

        <Text style={styles.heroSubtitle}>
          Retrouvez ici les changements,
          rappels et informations importantes
          concernant le club.
        </Text>
      </View>

      <View style={styles.heroFooter}>
        <View style={styles.heroStats}>
          <View>
            <Text
              style={styles.heroStatValue}
            >
              {total}
            </Text>

            <Text
              style={styles.heroStatLabel}
            >
              notifications
            </Text>
          </View>

          <View
            style={styles.heroStatDivider}
          />

          <View>
            <Text
              style={styles.heroStatValue}
            >
              {unreadCount}
            </Text>

            <Text
              style={styles.heroStatLabel}
            >
              à consulter
            </Text>
          </View>
        </View>

        <View style={styles.heroFooterIcon}>
          <Ionicons
            name="mail-unread-outline"
            size={21}
            color={COLORS.textSecondary}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

function NotificationCard({
  notification,
  isUpdating,
  onPress,
}: NotificationCardProps) {
  const isUnread =
    !isNotificationRead(notification);

  const readAnimation = useRef(
    new Animated.Value(
      isUnread ? 0 : 1
    )
  ).current;

  const previousUnreadState =
    useRef(isUnread);

  useEffect(() => {
    if (
      previousUnreadState.current &&
      !isUnread
    ) {
      Animated.timing(readAnimation, {
        toValue: 1,
        duration: 350,
        useNativeDriver: false,
      }).start();

      previousUnreadState.current =
        false;
    }
  }, [isUnread, readAnimation]);

  const courseTime = formatCourseTime(
    notification.heureDebut,
    notification.heureFin
  );

  const animatedBackgroundColor =
    readAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        "#241416",
        COLORS.card,
      ],
    });

  const animatedBorderColor =
    readAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        "rgba(229,9,20,0.30)",
        COLORS.borderSoft,
      ],
    });

  const animatedOpacity =
    readAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    });

  const animatedScale =
    readAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.7],
    });

  const title =
    notification.titre ||
    notification.titreCible ||
    notification.coursTitre ||
    "Notification SDMAA";

  const presentation =
    getNotificationPresentation(
      notification.typeNotification
    );

  return (
    <Pressable
      onPress={onPress}
      disabled={isUpdating}
      accessibilityRole="button"
      accessibilityLabel={
        isUnread
          ? `Ouvrir la notification : ${title}`
          : `Ouvrir la notification lue : ${title}`
      }
      accessibilityState={{
        disabled: isUpdating,
        busy: isUpdating,
      }}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.notificationCard,
            {
              backgroundColor:
                animatedBackgroundColor,
              borderColor:
                animatedBorderColor,
            },
            pressed &&
              styles.notificationCardPressed,
            isUpdating &&
              styles.notificationCardUpdating,
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  presentation.backgroundColor,
              },
              isUnread &&
                styles.unreadIconContainer,
            ]}
          >
            <Ionicons
              name={presentation.icon}
              size={21}
              color={
                isUnread
                  ? presentation.color
                  : COLORS.textMuted
              }
            />
          </View>

          <View
            style={
              styles.notificationContent
            }
          >
            <View
              style={
                styles.notificationHeader
              }
            >
              <View style={styles.titleArea}>
                {isUnread ? (
                  <Text
                    style={
                      styles.unreadLabel
                    }
                  >
                    NOUVEAU
                  </Text>
                ) : null}

                <Text
                  style={
                    styles.notificationTitle
                  }
                  numberOfLines={2}
                >
                  {title}
                </Text>
              </View>

              <Animated.View
                accessibilityLabel={
                  isUnread
                    ? "Notification non lue"
                    : undefined
                }
                style={[
                  styles.unreadDot,
                  {
                    opacity:
                      animatedOpacity,
                    transform: [
                      {
                        scale:
                          animatedScale,
                      },
                    ],
                  },
                ]}
              />
            </View>

            {notification.message ? (
              <Text
                style={
                  styles.notificationMessage
                }
                numberOfLines={4}
              >
                {notification.message}
              </Text>
            ) : null}

            {notification.jour ||
            courseTime ? (
              <View
                style={styles.courseDetails}
              >
                {notification.jour ? (
                  <DetailPill
                    icon="calendar-outline"
                    label={
                      notification.jour
                    }
                  />
                ) : null}

                {courseTime ? (
                  <DetailPill
                    icon="time-outline"
                    label={courseTime}
                  />
                ) : null}
              </View>
            ) : null}

            <View style={styles.cardFooter}>
              <Text
                style={
                  styles.notificationDate
                }
              >
                {formatRelativeNotificationDate(
                  notification.dateCreation
                )}
              </Text>

              {isUpdating ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.red}
                />
              ) : isUnread ? (
                <View
                  style={styles.readHint}
                >
                  <Text
                    style={
                      styles.readHintText
                    }
                  >
                    Ouvrir
                  </Text>

                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={COLORS.red}
                  />
                </View>
              ) : (
                <View
                  style={styles.readState}
                >
                  <Ionicons
                    name="checkmark-done"
                    size={15}
                    color={
                      COLORS.textMuted
                    }
                  />

                  <Text
                    style={
                      styles.readStateText
                    }
                  >
                    Lue
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      )}
    </Pressable>
  );
}

function DetailPill({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.detailPill}>
      <Ionicons
        name={icon}
        size={14}
        color={COLORS.textSecondary}
      />

      <Text
        style={styles.detailText}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.errorBox}>
      <View style={styles.errorIcon}>
        <Ionicons
          name="alert-circle-outline"
          size={20}
          color={COLORS.red}
        />
      </View>

      <Text style={styles.errorText}>
        {message}
      </Text>

      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Réessayer de charger les notifications"
        style={({ pressed }) => [
          styles.retryButton,
          pressed &&
            styles.buttonPressed,
        ]}
      >
        <Ionicons
          name="refresh"
          size={17}
          color={COLORS.text}
        />
      </Pressable>
    </View>
  );
}

function EmptyNotifications() {
  return (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[
          "rgba(229,9,20,0.17)",
          "rgba(229,9,20,0.05)",
        ]}
        style={styles.emptyIconContainer}
      >
        <Ionicons
          name="notifications-off-outline"
          size={34}
          color={COLORS.red}
        />
      </LinearGradient>

      <Text style={styles.emptyTitle}>
        Aucune notification
      </Text>

      <Text
        style={styles.emptyDescription}
      >
        Les informations importantes
        concernant le club apparaîtront ici.
      </Text>

      <View style={styles.emptyBadge}>
        <Ionicons
          name="checkmark-circle-outline"
          size={15}
          color={COLORS.textSecondary}
        />

        <Text
          style={styles.emptyBadgeText}
        >
          Vous êtes à jour
        </Text>
      </View>
    </View>
  );
}

function NotificationsLoading() {
  return (
    <SafeAreaView
      style={styles.loadingScreen}
      edges={["top"]}
    >
      <StatusBar style="light" />

      <View style={styles.loaderContainer}>
        <LinearGradient
          colors={[
            COLORS.red,
            "#79080D",
          ]}
          style={styles.loadingLogo}
        >
          <Ionicons
            name="notifications"
            size={27}
            color={COLORS.text}
          />
        </LinearGradient>

        <ActivityIndicator
          size="small"
          color={COLORS.text}
        />

        <Text style={styles.loadingText}>
          Chargement des notifications…
        </Text>
      </View>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function formatCourseTime(
  heureDebut?: string,
  heureFin?: string
): string | null {
  if (!heureDebut && !heureFin) {
    return null;
  }

  const start =
    heureDebut?.slice(0, 5);

  const end =
    heureFin?.slice(0, 5);

  if (start && end) {
    return `${start} - ${end}`;
  }

  return start || end || null;
}

function formatRelativeNotificationDate(
  date?: string
): string {
  if (!date) {
    return "Date non renseignée";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "Date non renseignée";
  }

  const now = new Date();

  const differenceInMilliseconds =
    now.getTime() -
    parsedDate.getTime();

  const differenceInMinutes =
    Math.floor(
      differenceInMilliseconds /
        60000
    );

  if (differenceInMinutes < 1) {
    return "À l’instant";
  }

  if (differenceInMinutes < 60) {
    return `Il y a ${differenceInMinutes} min`;
  }

  const differenceInHours =
    Math.floor(
      differenceInMinutes / 60
    );

  if (differenceInHours < 24) {
    return differenceInHours === 1
      ? "Il y a 1 h"
      : `Il y a ${differenceInHours} h`;
  }

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const startOfNotificationDay =
    new Date(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      parsedDate.getDate()
    );

  const differenceInDays =
    Math.round(
      (
        startOfToday.getTime() -
        startOfNotificationDay.getTime()
      ) / 86400000
    );

  if (differenceInDays === 1) {
    return "Hier";
  }

  if (differenceInDays < 7) {
    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        weekday: "long",
      }
    ).format(parsedDate);
  }

  if (
    parsedDate.getFullYear() ===
    now.getFullYear()
  ) {
    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        day: "numeric",
        month: "long",
      }
    ).format(parsedDate);
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(parsedDate);
}

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  listContent: {
    paddingTop: 14,
    paddingHorizontal: 16,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  topNavigation: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  backButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    shadowColor: COLORS.black,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 3,
  },

  backButtonPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  pageTitle: {
    color: COLORS.text,
    fontSize: 17,
    letterSpacing: -0.25,
    fontFamily: "Inter_700Bold",
  },

  headerRightSpacer: {
    width: 46,
    height: 46,
  },

  heroCard: {
    minHeight: 310,
    overflow: "hidden",
    padding: 22,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.06)",
    borderRadius: 30,
    shadowColor: COLORS.black,
    shadowOpacity: 0.34,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 8,
  },

  heroGlow: {
    position: "absolute",
    top: -72,
    right: -52,
    width: 190,
    height: 190,
    backgroundColor:
      "rgba(229,9,20,0.13)",
    borderRadius: 95,
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.08)",
    borderRadius: 17,
  },

  heroBadge: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor:
      "rgba(0,0,0,0.24)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.07)",
    borderRadius: 999,
  },

  heroBadgeDot: {
    width: 6,
    height: 6,
    marginRight: 8,
    backgroundColor: COLORS.red,
    borderRadius: 3,
  },

  heroBadgeDotRead: {
    backgroundColor: COLORS.textMuted,
  },

  heroBadgeText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    letterSpacing: 1.1,
    fontFamily: "Inter_700Bold",
  },

  heroContent: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 28,
  },

  heroEyebrow: {
    marginBottom: 8,
    color: COLORS.red,
    fontSize: 11,
    letterSpacing: 2.1,
    fontFamily: "Inter_700Bold",
  },

  heroTitle: {
    maxWidth: 280,
    color: COLORS.text,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1.2,
    fontFamily: "Inter_700Bold",
  },

  heroSubtitle: {
    maxWidth: 300,
    marginTop: 13,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },

  heroFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  heroStats: {
    flexDirection: "row",
    alignItems: "center",
  },

  heroStatDivider: {
    width: 1,
    height: 35,
    marginHorizontal: 18,
    backgroundColor:
      "rgba(255,255,255,0.10)",
  },

  heroStatValue: {
    color: COLORS.text,
    fontSize: 24,
    letterSpacing: -0.7,
    fontFamily: "Inter_700Bold",
  },

  heroStatLabel: {
    marginTop: 2,
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },

  heroFooterIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,255,255,0.05)",
    borderRadius: 14,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 31,
    marginBottom: 14,
    marginHorizontal: 2,
  },

  sectionEyebrow: {
    marginBottom: 5,
    color: COLORS.textMuted,
    fontSize: 10,
    letterSpacing: 1.5,
    fontFamily: "Inter_700Bold",
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 23,
    letterSpacing: -0.55,
    fontFamily: "Inter_700Bold",
  },

  sectionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  markAllButton: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 11,
    backgroundColor: COLORS.red,
    borderRadius: 12,
  },

  markAllButtonDisabled: {
    opacity: 0.6,
  },

  markAllButtonText: {
    marginLeft: 6,
    color: COLORS.text,
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },

  countPill: {
    minWidth: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
  },

  countText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    padding: 13,
    backgroundColor: "#281719",
    borderRadius: 17,
    borderWidth: 1,
    borderColor:
      "rgba(229,9,20,0.24)",
  },

  errorIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor:
      "rgba(229,9,20,0.10)",
    borderRadius: 11,
  },

  errorText: {
    flex: 1,
    color: "#F7A0A5",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
  },

  retryButton: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    backgroundColor: COLORS.red,
    borderRadius: 11,
  },

  buttonPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  notificationCard: {
    flexDirection: "row",
    marginBottom: 12,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: COLORS.black,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 4,
  },

  notificationCardPressed: {
    opacity: 0.86,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  notificationCardUpdating: {
    opacity: 0.72,
  },

  iconContainer: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    backgroundColor: COLORS.cardLight,
    borderRadius: 16,
  },

  unreadIconContainer: {
    backgroundColor:
      "rgba(229,9,20,0.12)",
    borderWidth: 1,
    borderColor:
      "rgba(229,9,20,0.16)",
  },

  notificationContent: {
    flex: 1,
  },

  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  titleArea: {
    flex: 1,
  },

  unreadLabel: {
    marginBottom: 5,
    color: COLORS.red,
    fontSize: 9,
    letterSpacing: 1.1,
    fontFamily: "Inter_700Bold",
  },

  notificationTitle: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
    fontFamily: "Inter_700Bold",
  },

  unreadDot: {
    width: 9,
    height: 9,
    marginTop: 5,
    marginLeft: 10,
    backgroundColor: COLORS.red,
    borderRadius: 999,
  },

  notificationMessage: {
    marginTop: 8,
    color: "#D1D1D1",
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },

  courseDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
  },

  detailPill: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 10,
  },

  detailText: {
    marginLeft: 6,
    color: COLORS.textSecondary,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },

  notificationDate: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },

  readHint: {
    flexDirection: "row",
    alignItems: "center",
  },

  readHintText: {
    marginRight: 5,
    color: COLORS.red,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },

  readState: {
    flexDirection: "row",
    alignItems: "center",
  },

  readStateText: {
    marginLeft: 4,
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 70,
    paddingHorizontal: 30,
    paddingVertical: 42,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 26,
  },

  emptyIconContainer: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
  },

  emptyTitle: {
    marginTop: 19,
    color: COLORS.text,
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },

  emptyDescription: {
    maxWidth: 260,
    marginTop: 9,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },

  emptyBadge: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 12,
    backgroundColor: COLORS.cardLight,
    borderRadius: 999,
  },

  emptyBadgeText: {
    marginLeft: 7,
    color: COLORS.textSecondary,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingLogo: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    borderRadius: 24,
  },

  loadingText: {
    marginTop: 14,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});