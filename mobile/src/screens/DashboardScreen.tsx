import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";


import {
  ActivityIndicator,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  NavigationProp,
  ParamListBase,
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";

import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import Reanimated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import DashboardHeader, {
  DashboardCourse,
  DashboardUser,
} from "../components/dashboard/DashboardHeader";

import ActivityCard, {
  Activity,
} from "../components/dashboard/ActivityCard";

import api from "../services/api";

interface Annonce {
  id: number;
  titre?: string;
  message?: string;
  contenu?: string;
  image?: string;
  imageUrl?: string;
  statut?: string;
  datePublication?: string;
  dateCreation?: string;
  dateModification?: string;
  auteurId?: number;
  auteurNom?: string;
  createdAt?: string;
  lue?: boolean;
}

interface NotificationCountResponse {
  count?: number;
}

interface InscriptionActivite {
  id?: number;
  idInscription?: number;

  activiteId?: number;
  activiteTitre?: string;
  activiteDate?: string;
  activiteHeure?: string;
  activiteLieu?: string;

  date?: string;
  heure?: string;
  lieu?: string;

  typeActivite?: string;
  categorie?: string;

  statutInscription?: string;
  statutPaiement?: string;
}

interface ApiActivity {
  id?: number;
  titre?: string;
  description?: string;

  image?: string;
  imageActivite?: string;
  imageUrl?: string;
  nomImage?: string;

  date?: string;
  dateActivite?: string;

  heure?: string;
  heureDebut?: string;
  heureFin?: string;

  dureeActivite?: string;

  lieu?: string;
  typeActivite?: string;
  categorie?: string;
}

interface NavigationTarget {
  routeNames: string[];
  params?: Record<string, unknown>;
}

const COLORS = {
  background: "#121212",
  card: "#1B1B1B",
  cardSoft: "#232323",
  text: "#FFFFFF",
  textSecondary: "#B3B3B3",
  textMuted: "#7A7A7A",
  border: "#2F2F2F",
  red: "#E50914",
  green: "#34D399",
  amber: "#FBBF24",

  engagementCard: "#1A1A1A",
  engagementFeatured: "#222222",
  engagementAccent: "#A7A7A7",

};

const ANNOUNCEMENT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644";

const ROUTES = {
  notifications: [
    "MesNotifications",
    "Notifications",
    "NotificationsScreen",
  ],

  engagements: [
    "MesEngagements",
    "Engagements",
    "MesEngagementsScreen",
  ],

  activities: [
    "Activites",
    "Activités",
    "Activities",
  ],

  activityDetails: [
    "ActiviteDetails",
    "ActiviteDetail",
    "ActivityDetails",
  ],
};

const DAY_INDEX: Record<string, number> = {
  dimanche: 0,
  lundi: 1,
  mardi: 2,
  mercredi: 3,
  jeudi: 4,
  vendredi: 5,
  samedi: 6,
};

function normalizeText(value?: string): string {
  return (
    value
      ?.trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") ?? ""
  );
}

function normalizeActivity(
  rawActivity: ApiActivity,
  index: number
): Activity {
  return {
    id: Number(rawActivity.id) || index + 1,

    titre:
      rawActivity.titre ||
      "Activité sans titre",

    description:
      rawActivity.description,

    image:
      rawActivity.imageActivite ||
      rawActivity.image ||
      rawActivity.imageUrl ||
      rawActivity.nomImage,

    date:
      rawActivity.dateActivite ||
      rawActivity.date,

    heure:
      rawActivity.heureDebut ||
      rawActivity.heure,

    lieu:
      rawActivity.lieu,

    typeActivite:
      rawActivity.typeActivite,

    categorie:
      rawActivity.categorie,
  };
}

function parseDate(value?: string): number {
  if (!value) {
    return 0;
  }

  const parsed = new Date(value).getTime();

  return Number.isNaN(parsed) ? 0 : parsed;
}

function parseTime(
  value?: string
): {
  hours: number;
  minutes: number;
} | null {
  if (!value) {
    return null;
  }

  const match = value.match(/^(\d{1,2}):(\d{2})/);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return { hours, minutes };
}

function getCourseOccurrence(
  course: DashboardCourse,
  now: Date
): Date | null {
  const targetDay = DAY_INDEX[normalizeText(course.jour)];
  const startTime = parseTime(course.heureDebut);

  if (targetDay === undefined || !startTime) {
    return null;
  }

  const occurrence = new Date(now);

  occurrence.setHours(
    startTime.hours,
    startTime.minutes,
    0,
    0
  );

  const daysAhead =
    (targetDay - now.getDay() + 7) % 7;

  occurrence.setDate(
    occurrence.getDate() + daysAhead
  );

  if (occurrence.getTime() <= now.getTime()) {
    occurrence.setDate(
      occurrence.getDate() + 7
    );
  }

  return occurrence;
}

function findNextCourse(
  courses: DashboardCourse[],
  now = new Date()
): DashboardCourse | null {
  const candidates = courses
    .map((course) => {
      const occurrence = getCourseOccurrence(course, now);

      return occurrence
        ? {
            course,
            occurrence: occurrence.getTime(),
          }
        : null;
    })
    .filter(
      (
        candidate
      ): candidate is {
        course: DashboardCourse;
        occurrence: number;
      } => candidate !== null
    )
    .sort(
      (first, second) =>
        first.occurrence - second.occurrence
    );

  return candidates[0]?.course ?? null;
}

function getCurrentWeekRange(now = new Date()) {
  const start = new Date(now);
  const day = start.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  start.setDate(start.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return { start, end };
}

function countCoursesThisWeek(
  courses: DashboardCourse[],
  now = new Date()
): number {
  const { start, end } = getCurrentWeekRange(now);

  return courses.filter((course) => {
    const targetDay = DAY_INDEX[normalizeText(course.jour)];
    const startTime = parseTime(course.heureDebut);

    if (targetDay === undefined || !startTime) {
      return false;
    }

    const mondayIndex =
      targetDay === 0 ? 6 : targetDay - 1;

    const occurrence = new Date(start);

    occurrence.setDate(
      occurrence.getDate() + mondayIndex
    );

    occurrence.setHours(
      startTime.hours,
      startTime.minutes,
      0,
      0
    );

    return (
      occurrence.getTime() >= start.getTime() &&
      occurrence.getTime() < end.getTime()
    );
  }).length;
}

function countActivitiesThisWeek(
  activities: Activity[],
  now = new Date()
): number {
  const { start, end } = getCurrentWeekRange(now);

  return activities.filter((activity) => {
    const timestamp = parseDate(activity.date);

    return (
      timestamp >= start.getTime() &&
      timestamp < end.getTime()
    );
  }).length;
}

function getAnnouncementDate(announcement: Annonce): string | undefined {
  return (
    announcement.datePublication ||
    announcement.dateCreation ||
    announcement.createdAt
  );
}


function getAnnouncementImage(
  announcement: Annonce
): string {
  const image =
    announcement.imageUrl ||
    announcement.image;

  if (!image?.trim()) {
    return ANNOUNCEMENT_FALLBACK_IMAGE;
  }

  const cleanedImage =
    image
      .trim()
      .replace(/\\/g, "/");

  if (
    cleanedImage.startsWith("http://") ||
    cleanedImage.startsWith("https://")
  ) {
    return cleanedImage;
  }

  const apiBase =
    api.defaults.baseURL
      ?.trim()
      .replace(/\/api\/?$/i, "")
      .replace(/\/+$/, "") || "";

  if (!apiBase) {
    return ANNOUNCEMENT_FALLBACK_IMAGE;
  }

  if (
    cleanedImage.startsWith("/uploads/")
  ) {
    return `${apiBase}${cleanedImage}`;
  }

  if (
    cleanedImage.startsWith("uploads/")
  ) {
    return `${apiBase}/${cleanedImage}`;
  }

  return `${apiBase}/uploads/${cleanedImage.replace(
    /^\/+/,
    ""
  )}`;
}

function formatAnnouncementDate(
  announcement: Annonce
): string {
  const value =
    getAnnouncementDate(
      announcement
    );

  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

function countAnnouncementsThisWeek(
  announcements: Annonce[],
  now = new Date()
): number {
  const { start, end } = getCurrentWeekRange(now);

  return announcements.filter((announcement) => {
    const timestamp = parseDate(
      getAnnouncementDate(announcement)
    );

    return (
      timestamp >= start.getTime() &&
      timestamp < end.getTime()
    );
  }).length;
}

function getEngagementDate(
  engagement: InscriptionActivite
): string | undefined {
  return (
    engagement.activiteDate ||
    engagement.date
  );
}

function getEngagementTime(
  engagement: InscriptionActivite
): string | undefined {
  return (
    engagement.activiteHeure ||
    engagement.heure
  );
}

function getEngagementLocation(
  engagement: InscriptionActivite
): string | undefined {
  return (
    engagement.activiteLieu ||
    engagement.lieu
  );
}

function formatEngagementDate(
  value?: string
): string {
  if (!value) {
    return "Date à confirmer";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const compared = new Date(date);
  compared.setHours(0, 0, 0, 0);

  if (compared.getTime() === today.getTime()) {
    return "Aujourd’hui";
  }

  if (compared.getTime() === tomorrow.getTime()) {
    return "Demain";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function getStatusPresentation(status?: string): {
  label: string;
  color: string;
  backgroundColor: string;
} {
  const normalized = normalizeText(status);

  if (
    normalized.includes("confirm") ||
    normalized.includes("valid")
  ) {
    return {
      label: "Confirmé",
      color: COLORS.green,
      backgroundColor: "rgba(52,211,153,0.12)",
    };
  }

  if (
    normalized.includes("refus") ||
    normalized.includes("annul")
  ) {
    return {
      label: "Refusé",
      color: "#F87171",
      backgroundColor: "rgba(248,113,113,0.12)",
    };
  }

  return {
    label: "En attente",
    color: COLORS.amber,
    backgroundColor: "rgba(251,191,36,0.12)",
  };
}

function isCompetition(
  inscription: InscriptionActivite
): boolean {
  const value = [
    inscription.typeActivite,
    inscription.categorie,
    inscription.activiteTitre,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    value.includes("compétition") ||
    value.includes("competition") ||
    value.includes("comp")
  );
}

function navigateThroughHierarchy(
  navigation: NavigationProp<ParamListBase>,
  target: NavigationTarget
): boolean {
  let currentNavigation:
    | NavigationProp<ParamListBase>
    | undefined = navigation;

  while (currentNavigation) {
    const state =
      currentNavigation.getState();

    const routeName =
      target.routeNames.find((name) =>
        state.routeNames.includes(name)
      );

    if (routeName) {
      if (target.params) {
        currentNavigation.navigate(
          routeName,
          target.params
        );
      } else {
        currentNavigation.navigate(
          routeName
        );
      }

      return true;
    }

    currentNavigation =
      currentNavigation.getParent();
  }

  console.warn(
    `Route introuvable : ${target.routeNames.join(", ")}`
  );

  return false;
}

export default function DashboardScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [showStatusBarBlur, setShowStatusBarBlur] =
    useState(false);

  const navigation =
    useNavigation<NavigationProp<ParamListBase>>();

  const [user, setUser] =
    useState<DashboardUser | null>(null);

  const [cours, setCours] =
    useState<DashboardCourse[]>([]);

  const [annonces, setAnnonces] =
    useState<Annonce[]>([]);

  const [notificationCount, setNotificationCount] =
    useState(0);

  const [activities, setActivities] =
    useState<Activity[]>([]);

  const [inscriptions, setInscriptions] =
    useState<InscriptionActivite[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const logRequestError = (
    label: string,
    reason: unknown
  ): void => {
    const axiosError = reason as {
      message?: string;
      response?: {
        status?: number;
        data?: unknown;
      };
      config?: {
        url?: string;
        method?: string;
      };
    };

    console.error(label, {
      message: axiosError?.message,
      status: axiosError?.response?.status,
      response: axiosError?.response?.data,
      url: axiosError?.config?.url,
      method: axiosError?.config?.method,
    });
  };

  const fetchNotificationCount =
    useCallback(async (): Promise<void> => {
      try {
        const response = await api.get("/notifications/non-lues/count");

        const countData = response.data as
          | NotificationCountResponse
          | number
          | null
          | undefined;

        const count =
          typeof countData === "number"
            ? countData
            : countData?.count;

        setNotificationCount(
          typeof count === "number" &&
            Number.isFinite(count)
            ? count
            : 0
        );
      } catch (reason) {
        const axiosError = reason as {
          message?: string;
          response?: {
            status?: number;
            data?: unknown;
          };
          config?: {
            url?: string;
            method?: string;
          };
        };

        console.error(
          "Erreur actualisation compteur notifications :",
          {
            message: axiosError?.message,
            status: axiosError?.response?.status,
            response: axiosError?.response?.data,
            url: axiosError?.config?.url,
            method: axiosError?.config?.method,
          }
        );
      }
    }, []);

  const fetchDashboard =
    useCallback(async (): Promise<void> => {
      try {
        setError("");

        const [
          userResult,
          coursResult,
          annoncesResult,
          notificationCountResult,
          activitiesResult,
          inscriptionsResult,
        ] = await Promise.allSettled([
          api.get("/me"),
          api.get("/cours/me"),
          api.get("/annonces/dernieres"),
          api.get("/notifications/non-lues/count"),
          api.get("/activites"),
          api.get("/inscriptions-activites/me"),
        ]);

        if (userResult.status === "fulfilled") {
          setUser(userResult.value.data ?? null);
        } else {
          logRequestError(
            "Erreur utilisateur :",
            userResult.reason
          );
          setUser(null);
        }

        if (coursResult.status === "fulfilled") {
          setCours(
            Array.isArray(coursResult.value.data)
              ? coursResult.value.data
              : []
          );
        } else {
          logRequestError(
            "Erreur cours :",
            coursResult.reason
          );
          setCours([]);
        }

        if (annoncesResult.status === "fulfilled") {
          setAnnonces(
            Array.isArray(annoncesResult.value.data)
              ? annoncesResult.value.data
              : []
          );
        } else {
          logRequestError(
            "Erreur annonces :",
            annoncesResult.reason
          );
          setAnnonces([]);
        }

        if (
          notificationCountResult.status ===
          "fulfilled"
        ) {
          const countData =
            notificationCountResult.value.data as
              | NotificationCountResponse
              | number
              | null
              | undefined;

          const count =
            typeof countData === "number"
              ? countData
              : countData?.count;

          setNotificationCount(
            typeof count === "number" &&
              Number.isFinite(count)
              ? count
              : 0
          );
        } else {
          logRequestError(
            "Erreur compteur notifications :",
            notificationCountResult.reason
          );
          setNotificationCount(0);
        }

        if (activitiesResult.status === "fulfilled") {
          const responseData =
            activitiesResult.value.data;

          const rawActivities = Array.isArray(responseData)
            ? responseData
            : Array.isArray(responseData?.content)
              ? responseData.content
              : [];

          const normalized = rawActivities
            .map(
              (
                rawActivity: ApiActivity,
                index: number
              ) =>
                normalizeActivity(
                  rawActivity,
                  index
                )
            )
            .sort((first: Activity, second: Activity) => {
              const firstDate = parseDate(first.date);
              const secondDate = parseDate(second.date);

              if (firstDate === 0) {
                return 1;
              }

              if (secondDate === 0) {
                return -1;
              }

              return firstDate - secondDate;
            });

          setActivities(normalized);
        } else {
          logRequestError(
            "Erreur activités :",
            activitiesResult.reason
          );
          setActivities([]);
        }

        if (
          inscriptionsResult.status ===
          "fulfilled"
        ) {
          setInscriptions(
            Array.isArray(
              inscriptionsResult.value.data
            )
              ? inscriptionsResult.value.data
              : []
          );
        } else {
          logRequestError(
            "Erreur inscriptions :",
            inscriptionsResult.reason
          );
          setInscriptions([]);
        }

        const failures = [
          userResult,
          coursResult,
          annoncesResult,
          notificationCountResult,
          activitiesResult,
          inscriptionsResult,
        ].filter(
          (result) => result.status === "rejected"
        ).length;

        if (failures > 0) {
          setError(
            "Certaines informations n’ont pas pu être chargées."
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard])
  );

  useEffect(() => {
    const receivedSubscription =
      Notifications.addNotificationReceivedListener(
        () => {
          /*
           * Mise à jour visuelle immédiate du badge,
           * puis synchronisation avec la valeur réelle
           * enregistrée dans le backend.
           */
          setNotificationCount(
            (currentCount) => currentCount + 1
          );

          void fetchNotificationCount();
        }
      );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(
        () => {
          /*
           * Lorsqu'une notification est ouverte depuis
           * le centre de notifications, on resynchronise
           * également le compteur.
           */
          void fetchNotificationCount();
        }
      );

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [fetchNotificationCount]);

  const nextCourse = useMemo(
    () => findNextCourse(cours),
    [cours]
  );

  const competitionCount = useMemo(
    () => inscriptions.filter(isCompetition).length,
    [inscriptions]
  );

  const weeklyCourseCount = useMemo(
    () => countCoursesThisWeek(cours),
    [cours]
  );

  const weeklyActivityCount = useMemo(
    () => countActivitiesThisWeek(activities),
    [activities]
  );

  const weeklyAnnouncementCount = useMemo(
    () => countAnnouncementsThisWeek(annonces),
    [annonces]
  );

  const upcomingEngagements = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return inscriptions
      .filter((engagement) => {
        const date = getEngagementDate(engagement);

        if (!date) {
          return true;
        }

        return parseDate(date) >= today.getTime();
      })
      .sort((first, second) => {
        const firstDate = parseDate(
          getEngagementDate(first)
        );

        const secondDate = parseDate(
          getEngagementDate(second)
        );

        if (firstDate === 0) {
          return 1;
        }

        if (secondDate === 0) {
          return -1;
        }

        return firstDate - secondDate;
      })
      .slice(0, 3);
  }, [inscriptions]);

  const upcomingActivities = useMemo(() => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return activities
      .filter((activity) => {
        if (!activity.date) {
          return true;
        }

        return (
          parseDate(activity.date) >= today.getTime()
        );
      })
      .slice(0, 6);
  }, [activities]);

  const recentAnnouncements = useMemo(
    () =>
      [...annonces]
        .sort(
          (first, second) =>
            parseDate(
              getAnnouncementDate(second)
            ) -
            parseDate(
              getAnnouncementDate(first)
            )
        )
        .slice(0, 3),
    [annonces]
  );

  const openNotifications =
    useCallback(() => {
      navigateThroughHierarchy(navigation, {
        routeNames: ROUTES.notifications,
      });
    }, [navigation]);

  const openEngagements =
    useCallback(() => {
      navigateThroughHierarchy(navigation, {
        routeNames: ROUTES.engagements,
      });
    }, [navigation]);

  const openActivities =
    useCallback(() => {
      navigateThroughHierarchy(navigation, {
        routeNames: ROUTES.activities,
      });
    }, [navigation]);

  const openAnnouncementDetails =
  useCallback(
    (announcement: Annonce) => {
      navigateThroughHierarchy(navigation, {
        routeNames: [
          "AnnonceDetails",
          "AnnonceDetail",
          "AnnouncementDetails",
        ],
        params: {
          annonceId: announcement.id,
          annonce: announcement,
        },
      });
    },
    [navigation]
  );

  const openActivityDetails =
  useCallback(
    (activiteId?: number) => {
      if (!activiteId) {
        openEngagements();
        return;
      }

      navigateThroughHierarchy(navigation, {
        routeNames: ROUTES.activityDetails,
        params: {
          activiteId,
        },
      });
    },
    [navigation, openEngagements]
  );

    

  const handleRefresh =
    useCallback(() => {
      setRefreshing(true);
      fetchDashboard();
    }, [fetchDashboard]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const shouldShowBlur =
        event.nativeEvent.contentOffset.y > 8;

      setShowStatusBarBlur((currentValue) =>
        currentValue === shouldShowBlur
          ? currentValue
          : shouldShowBlur
      );
    },
    []
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        {isFocused ? (
          <StatusBar style="light" />
        ) : null}

        <ActivityIndicator
          size="large"
          color={COLORS.red}
        />

        <Text style={styles.loadingText}>
          Préparation de votre espace…
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      {isFocused ? (
        <StatusBar
          style="light"
          animated
          translucent
          backgroundColor="transparent"
        />
      ) : null}

      {showStatusBarBlur ? (
        <View
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: insets.top + 5,
    backgroundColor: "rgba(18, 18, 18, 0.64)",
    zIndex: 99,
  }}
>
  <BlurView
    intensity={100}
    tint="dark"
    style={StyleSheet.absoluteFillObject}
  />
</View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.red}
            colors={[COLORS.red]}
            progressBackgroundColor={COLORS.card}
          />
        }
        contentContainerStyle={{
          paddingBottom: tabBarHeight + 30,
        }}
      >
        <DashboardHeader
          user={user}
          prochainCours={nextCourse}
          notificationCount={notificationCount}
          competitionCount={competitionCount}
          weeklyCourseCount={weeklyCourseCount}
          weeklyActivityCount={weeklyActivityCount}
          weeklyAnnouncementCount={
            weeklyAnnouncementCount
          }
          onPressNotifications={
            openNotifications
          }
        />

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={COLORS.red}
            />

            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              onPress={fetchDashboard}
              accessibilityRole="button"
              accessibilityLabel="Réessayer le chargement"
              style={styles.retryButton}
            >
              <Ionicons
                name="refresh"
                size={17}
                color={COLORS.text}
              />
            </Pressable>
          </View>
        ) : null}

        <Reanimated.View
          entering={FadeInUp.duration(450).delay(80)}
          style={styles.section}
        >
          <SectionHeader
            eyebrow="VOTRE AGENDA"
            title="Mes engagements"
            actionLabel="Voir tous"
            onPressAction={openEngagements}
          />

          {upcomingEngagements.length > 0 ? (
            <View style={styles.engagementList}>
              {upcomingEngagements.map(
                (engagement, index) => (
                  <EngagementPreviewCard
                    key={
                      engagement.id ??
                      engagement.idInscription ??
                      `${engagement.activiteId}-${index}`
                    }
                    engagement={engagement}
                    featured={index === 0}
                    onPress={() =>
                      openActivityDetails(
                        engagement.activiteId
                      )
                    }
                  />
                )
              )}
            </View>
          ) : (
            <EmptySection
              icon="clipboard-outline"
              title="Aucun engagement à venir"
              description="Vos prochaines inscriptions aux activités et compétitions apparaîtront ici."
              actionLabel="Voir mes engagements"
              onPressAction={openEngagements}
            />
          )}
        </Reanimated.View>

        <Reanimated.View
          entering={FadeInUp.duration(450).delay(150)}
          style={styles.section}
        >
          <SectionHeader
            eyebrow="À DÉCOUVRIR"
            title="Activités à venir"
            actionLabel="Tout voir"
            onPressAction={openActivities}
          />

          {upcomingActivities.length > 0 ? (
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={
                styles.horizontalList
              }
            >
              {upcomingActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  showClubLogo
                  onPress={() =>
                    openActivityDetails(activity.id)
                  }
                />
              ))}
            </ScrollView>
          ) : (
            <EmptySection
              icon="calendar-clear-outline"
              title="Aucune activité à venir"
              description="Les prochaines activités du club apparaîtront ici."
            />
          )}
        </Reanimated.View>

        <Reanimated.View
          entering={FadeInDown.duration(450).delay(220)}
          style={styles.section}
        >
          <SectionHeader
            eyebrow="INFORMATIONS DU CLUB"
            title="Dernières annonces"
          />

          {recentAnnouncements.length > 0 ? (
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={
                styles.announcementHorizontalList
              }
            >
              {recentAnnouncements.map(
                (announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    onPress={() =>
                      openAnnouncementDetails(
                        announcement
                      )
                    }
                  />
                )
              )}
            </ScrollView>
          ) : (
            <EmptySection
              icon="megaphone-outline"
              title="Aucune annonce"
              description="Les nouvelles du club seront affichées ici."
            />
          )}
        </Reanimated.View>
      </ScrollView>
    </View>
  );
}

function EngagementPreviewCard({
  engagement,
  featured,
  onPress,
}: {
  engagement: InscriptionActivite;
  featured: boolean;
  onPress: () => void;
}) {
  const status = getStatusPresentation(
    engagement.statutInscription
  );

  const date = getEngagementDate(engagement);
  const time = getEngagementTime(engagement);
  const location = getEngagementLocation(engagement);

  const isCompetitionEngagement =
    isCompetition(engagement);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Voir ${engagement.activiteTitre || "cet engagement"}`}
      style={({ pressed }) => [
        styles.engagementCard,
        featured &&
          styles.engagementCardFeatured,
        featured &&
          isCompetitionEngagement &&
          styles.engagementCompetitionFeatured,
        pressed &&
          styles.pressablePressed,
      ]}
    >
      <View
        style={[
          styles.engagementIcon,
          featured &&
            styles.engagementIconFeatured,
          featured &&
            isCompetitionEngagement &&
            styles.engagementCompetitionIconFeatured,
        ]}
      >
        <Ionicons
          name={
            isCompetitionEngagement
              ? "trophy-outline"
              : "fitness-outline"
          }
          size={22}
          color={
            featured &&
            isCompetitionEngagement
              ? COLORS.amber
              : featured
                ? COLORS.text
                : COLORS.engagementAccent
          }
        />
      </View>

      <View style={styles.engagementContent}>
        <View style={styles.engagementTopRow}>
          <Text
            style={styles.engagementTitle}
            numberOfLines={1}
          >
            {engagement.activiteTitre ||
              "Activité du club"}
          </Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  status.backgroundColor,
              },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                {
                  color: status.color,
                },
              ]}
            >
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.engagementMetadata}>
          <MetadataItem
            icon="calendar-outline"
            text={formatEngagementDate(date)}
          />

          {time ? (
            <MetadataItem
              icon="time-outline"
              text={time.slice(0, 5)}
            />
          ) : null}

          {location ? (
            <MetadataItem
              icon="location-outline"
              text={location}
              flexible
            />
          ) : null}
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={19}
        color={COLORS.textMuted}
      />
    </Pressable>
  );
}

function MetadataItem({
  icon,
  text,
  flexible = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  flexible?: boolean;
}) {
  return (
    <View
      style={[
        styles.metadataItem,
        flexible && styles.metadataItemFlexible,
      ]}
    >
      <Ionicons
        name={icon}
        size={13}
        color={COLORS.textMuted}
      />

      <Text
        style={styles.metadataText}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  );
}

function SectionHeader({
  eyebrow,
  title,
  actionLabel,
  onPressAction,
}: {
  eyebrow: string;
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleBlock}>
        <Text style={styles.sectionEyebrow}>
          {eyebrow}
        </Text>

        <Text style={styles.sectionTitle}>
          {title}
        </Text>
      </View>

      {actionLabel && onPressAction ? (
        <Pressable
          onPress={onPressAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => [
            styles.sectionAction,
            pressed && styles.pressablePressed,
          ]}
        >
          <Text style={styles.sectionActionText}>
            {actionLabel}
          </Text>

          <Ionicons
            name="arrow-forward"
            size={15}
            color={COLORS.text}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

function AnnouncementCard({
  announcement,
  onPress,
}: {
  announcement: Annonce;
  onPress: () => void;
}) {
  const content =
    announcement.message ||
    announcement.contenu ||
    "Nouvelle information du club.";

  const imageUrl =
    getAnnouncementImage(
      announcement
    );

  const [
    currentImage,
    setCurrentImage,
  ] = useState(imageUrl);

  useEffect(() => {
    setCurrentImage(
      imageUrl
    );
  }, [imageUrl]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Voir l’annonce ${
        announcement.titre || ""
      }`}
      style={({ pressed }) => [
        styles.announcementCard,
        pressed &&
          styles.pressablePressed,
      ]}
    >
      <View
        style={
          styles.announcementImageContainer
        }
      >
        <Image
          source={{
            uri: currentImage,
          }}
          style={
            styles.announcementImage
          }
          resizeMode="cover"
          onError={() => {
            if (
              currentImage !==
              ANNOUNCEMENT_FALLBACK_IMAGE
            ) {
              setCurrentImage(
                ANNOUNCEMENT_FALLBACK_IMAGE
              );
            }
          }}
        />
      </View>

      <Text
        style={
          styles.announcementTitle
        }
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {announcement.titre ||
          "Annonce du club"}
      </Text>

      <Text
        style={
          styles.announcementText
        }
        numberOfLines={3}
        ellipsizeMode="tail"
      >
        {content}
      </Text>

      <Text
        style={
          styles.announcementDate
        }
        numberOfLines={1}
      >
        {formatAnnouncementDate(
          announcement
        )}
      </Text>
    </Pressable>
  );
}

function EmptySection({
  icon,
  title,
  description,
  actionLabel,
  onPressAction,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onPressAction?: () => void;
}) {
  return (
    <View style={styles.emptySection}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name={icon}
          size={25}
          color={COLORS.red}
        />
      </View>

      <Text style={styles.emptyTitle}>
        {title}
      </Text>

      <Text style={styles.emptyDescription}>
        {description}
      </Text>

      {actionLabel && onPressAction ? (
        <Pressable
          onPress={onPressAction}
          style={({ pressed }) => [
            styles.emptyAction,
            pressed && styles.pressablePressed,
          ]}
        >
          <Text style={styles.emptyActionText}>
            {actionLabel}
          </Text>

          <Ionicons
            name="arrow-forward"
            size={16}
            color={COLORS.text}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  statusBarBlur: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 100,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  loadingText: {
    marginTop: 14,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginHorizontal: 16,
    padding: 13,
    backgroundColor: "#281719",
    borderWidth: 1,
    borderColor: "rgba(229,9,20,0.22)",
    borderRadius: 17,
  },

  errorText: {
    flex: 1,
    marginHorizontal: 10,
    color: "#F5A0A5",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
  },

  retryButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.red,
    borderRadius: 11,
  },

  section: {
    marginTop: 30,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingHorizontal: 16,
  },

  sectionTitleBlock: {
    flex: 1,
    paddingRight: 12,
  },

  sectionEyebrow: {
    marginBottom: 5,
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 1.35,
    fontFamily: "Inter_700Bold",
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 23,
    letterSpacing: -0.6,
    fontFamily: "Inter_700Bold",
  },

  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 11,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
  },

  sectionActionText: {
    marginRight: 6,
    color: COLORS.text,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },

  engagementList: {
    paddingHorizontal: 16,
  },

  engagementCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 11,
    padding: 14,
    backgroundColor: COLORS.engagementCard,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 20,
  },

  engagementCardFeatured: {
    backgroundColor: COLORS.engagementFeatured,
    borderColor: "#363636",
  },

  engagementCompetitionFeatured: {
    backgroundColor: "#24211B",
    borderColor: "rgba(251,191,36,0.20)",
  },

  engagementIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#242424",
    borderWidth: 1,
    borderColor: "#303030",
    borderRadius: 16,
  },

  engagementIconFeatured: {
    backgroundColor: "#2D2D2D",
    borderColor: "#3A3A3A",
  },

  engagementCompetitionIconFeatured: {
    backgroundColor: "rgba(251,191,36,0.08)",
    borderColor: "rgba(251,191,36,0.18)",
  },

  engagementContent: {
    flex: 1,
    paddingRight: 10,
  },

  engagementTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  engagementTitle: {
    flex: 1,
    paddingRight: 8,
    color: COLORS.text,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },

  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 999,
  },

  statusBadgeText: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    fontFamily: "Inter_700Bold",
  },

  engagementMetadata: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 9,
    gap: 9,
  },

  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  metadataItemFlexible: {
    flexShrink: 1,
  },

  metadataText: {
    flexShrink: 1,
    marginLeft: 4,
    color: "#A7A7A7",
    fontSize: 9,
    fontFamily: "Inter_500Medium",
  },

  horizontalList: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },

  announcementHorizontalList: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },

  announcementCard: {
    width: 220,

    marginRight: 14,
  },

  announcementImageContainer: {
    width: "100%",
    height: 165,

    overflow: "hidden",

    backgroundColor: "#242424",

    borderRadius: 10,
  },

  announcementImage: {
    width: "100%",
    height: "100%",

    backgroundColor: "#242424",
  },

  announcementTitle: {
    marginTop: 10,

    color: COLORS.text,

    fontSize: 14,
    lineHeight: 19,

    letterSpacing: -0.2,

    fontFamily: "Inter_700Bold",
  },

  announcementText: {
    marginTop: 5,

    color: COLORS.textSecondary,

    fontSize: 11,
    lineHeight: 17,

    fontFamily: "Inter_400Regular",
  },

  announcementDate: {
    marginTop: 7,

    color: COLORS.textMuted,

    fontSize: 9,

    fontFamily: "Inter_500Medium",
  },

  emptySection: {
    alignItems: "center",
    marginHorizontal: 16,
    paddingVertical: 34,
    paddingHorizontal: 24,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
  },

  emptyIcon: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(229,9,20,0.10)",
    borderRadius: 19,
  },

  emptyTitle: {
    marginTop: 14,
    color: COLORS.text,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },

  emptyDescription: {
    maxWidth: 280,
    marginTop: 7,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },

  emptyAction: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.red,
    borderRadius: 13,
  },

  emptyActionText: {
    marginRight: 7,
    color: COLORS.text,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },

  pressablePressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
});