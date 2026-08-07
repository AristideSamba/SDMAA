// src/screens/AnnonceDetailsScreen.tsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import api from "../services/api";

const COLORS = {
  background: "#121212",
  card: "#1B1B1B",
  cardSoft: "#232323",

  text: "#FFFFFF",
  textSecondary: "#B3B3B3",
  textMuted: "#7A7A7A",

  border: "#2F2F2F",
  red: "#E50914",

  errorBackground: "#281719",
  errorText: "#F5A0A5",
};

interface Annonce {
  id: number;
  titre?: string;
  contenu?: string;
  message?: string;

  image?: string;
  imageUrl?: string;

  auteurId?: number;
  auteurNom?: string;

  datePublication?: string;
  dateCreation?: string;
  createdAt?: string;
}

type AnnonceDetailsRouteParams = {
  annonceId: number;
  annonce?: Annonce;
};

type AnnonceDetailsRoute = RouteProp<
  {
    AnnonceDetails: AnnonceDetailsRouteParams;
  },
  "AnnonceDetails"
>;

function getAnnouncementContent(
  announcement?: Annonce | null
): string {
  return (
    announcement?.contenu ||
    announcement?.message ||
    "Aucun contenu disponible pour cette annonce."
  );
}

function getAnnouncementDate(
  announcement?: Annonce | null
): string | undefined {
  return (
    announcement?.datePublication ||
    announcement?.dateCreation ||
    announcement?.createdAt
  );
}

function formatAnnouncementDate(
  value?: string
): string {
  if (!value) {
    return "Date non précisée";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getApiOrigin(): string {
  const baseUrl = api.defaults.baseURL || "";

  return baseUrl
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");
}

function getAnnouncementImageUrl(
  announcement?: Annonce | null
): string | null {
  if (!announcement) {
    return null;
  }

  if (announcement.imageUrl) {
    return announcement.imageUrl;
  }

  if (!announcement.image) {
    return null;
  }

  if (
    announcement.image.startsWith("http://") ||
    announcement.image.startsWith("https://")
  ) {
    return announcement.image;
  }

  const apiOrigin = getApiOrigin();

  const normalizedImage = announcement.image
    .replace(/^\/+/, "")
    .replace(/^uploads\/annonces\//, "");

  return `${apiOrigin}/uploads/annonces/${normalizedImage}`;
}

export default function AnnonceDetailsScreen() {
  const insets = useSafeAreaInsets();

  const navigation =
    useNavigation<NavigationProp<ParamListBase>>();

  const route = useRoute<AnnonceDetailsRoute>();

  const { annonceId, annonce: initialAnnouncement } =
    route.params;

  const [announcement, setAnnouncement] =
    useState<Annonce | null>(
      initialAnnouncement || null
    );

  const [loading, setLoading] = useState(
    !initialAnnouncement
  );

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const imageUrl = useMemo(
    () => getAnnouncementImageUrl(announcement),
    [announcement]
  );

  const publicationDate = useMemo(
    () =>
      formatAnnouncementDate(
        getAnnouncementDate(announcement)
      ),
    [announcement]
  );

  const fetchAnnouncement =
    useCallback(async (): Promise<void> => {
      try {
        setError("");

        const response = await api.get(
          `/annonces/${annonceId}`
        );

        setAnnouncement(response.data);
      } catch (reason) {
        const axiosError = reason as {
          message?: string;
          response?: {
            status?: number;
            data?: unknown;
          };
        };

        console.error(
          "Erreur chargement annonce :",
          {
            message: axiosError?.message,
            status: axiosError?.response?.status,
            response: axiosError?.response?.data,
          }
        );

        setError(
          "Impossible de charger cette annonce."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [annonceId]);

  useEffect(() => {
    fetchAnnouncement();
  }, [fetchAnnouncement]);

  const handleRefresh =
    useCallback((): void => {
      setRefreshing(true);
      fetchAnnouncement();
    }, [fetchAnnouncement]);

  const handleGoBack =
    useCallback((): void => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }

      navigation.navigate("Accueil" as never);
    }, [navigation]);

  if (loading && !announcement) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />

        <ActivityIndicator
          size="large"
          color={COLORS.red}
        />

        <Text style={styles.loadingText}>
          Chargement de l’annonce…
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        style="light"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
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
          paddingBottom:
            Math.max(insets.bottom, 20) + 30,
        }}
      >
        <View style={styles.hero}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.heroFallback}>
              <Ionicons
                name="megaphone-outline"
                size={66}
                color={COLORS.red}
              />
            </View>
          )}

          <LinearGradient
            colors={[
              "rgba(18,18,18,0.20)",
              "rgba(18,18,18,0.35)",
              "rgba(18,18,18,0.95)",
              COLORS.background,
            ]}
            locations={[0, 0.45, 0.82, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          <View
            style={[
              styles.heroHeader,
              {
                paddingTop: insets.top + 10,
              },
            ]}
          >
            <Pressable
              onPress={handleGoBack}
              accessibilityRole="button"
              accessibilityLabel="Retour"
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.pressed,
              ]}
            >
              <BlurView
                intensity={90}
                tint="dark"
                style={StyleSheet.absoluteFillObject}
              />

              <View
                style={
                  StyleSheet.absoluteFillObject
                }
              />

              <Ionicons
                name="arrow-back"
                size={22}
                color={COLORS.text}
              />
            </Pressable>
          </View>

          <View style={styles.heroContent}>
            <View style={styles.categoryBadge}>
              <Ionicons
                name="megaphone"
                size={13}
                color={COLORS.text}
              />

              <Text style={styles.categoryText}>
                ANNONCE DU CLUB
              </Text>
            </View>

            <Text style={styles.title}>
              {announcement?.titre ||
                "Annonce du club"}
            </Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={21}
                color={COLORS.red}
              />

              <Text style={styles.errorText}>
                {error}
              </Text>

              <Pressable
                onPress={fetchAnnouncement}
                accessibilityRole="button"
                accessibilityLabel="Réessayer"
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="refresh"
                  size={17}
                  color={COLORS.text}
                />
              </Pressable>
            </View>
          ) : null}

          <View style={styles.metadataCard}>
            <View style={styles.metadataRow}>
              <View style={styles.metadataIcon}>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={COLORS.red}
                />
              </View>

              <View style={styles.metadataContent}>
                <Text style={styles.metadataLabel}>
                  PUBLIÉE PAR
                </Text>

                <Text style={styles.metadataValue}>
                  {announcement?.auteurNom ||
                    "Administration du club"}
                </Text>
              </View>
            </View>

            <View style={styles.metadataSeparator} />

            <View style={styles.metadataRow}>
              <View style={styles.metadataIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={COLORS.red}
                />
              </View>

              <View style={styles.metadataContent}>
                <Text style={styles.metadataLabel}>
                  DATE DE PUBLICATION
                </Text>

                <Text
                  style={styles.metadataValue}
                >
                  {publicationDate}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.article}>
            <Text style={styles.articleEyebrow}>
              INFORMATIONS
            </Text>

            <Text style={styles.articleTitle}>
              Détails de l’annonce
            </Text>

            <View style={styles.articleDivider} />

            <Text style={styles.articleText}>
              {getAnnouncementContent(
                announcement
              )}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={COLORS.red}
              />
            </View>

            <Text style={styles.infoText}>
              Cette annonce a été publiée par le
              club. Consultez régulièrement votre
              espace pour ne manquer aucune
              information importante.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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

  hero: {
    position: "relative",
    height: 430,
    backgroundColor: COLORS.card,
    overflow: "hidden",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  heroFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cardSoft,
  },

  heroHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },

  headerButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(18,18,18,0.42)",
  },

  heroContent: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 25,
  },

  categoryBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: COLORS.red,
    borderRadius: 999,
  },

  categoryText: {
    marginLeft: 6,
    color: COLORS.text,
    fontSize: 9,
    letterSpacing: 0.8,
    fontFamily: "Inter_700Bold",
  },

  title: {
    marginTop: 15,
    color: COLORS.text,
    fontSize: 32,
    lineHeight: 39,
    letterSpacing: -0.9,
    fontFamily: "Inter_700Bold",
  },

  contentContainer: {
    paddingHorizontal: 16,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    padding: 13,
    backgroundColor: COLORS.errorBackground,
    borderWidth: 1,
    borderColor: "rgba(229,9,20,0.22)",
    borderRadius: 17,
  },

  errorText: {
    flex: 1,
    marginHorizontal: 10,
    color: COLORS.errorText,
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

  metadataCard: {
    marginTop: 4,
    padding: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
  },

  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  metadataIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "rgba(229,9,20,0.10)",
    borderRadius: 14,
  },

  metadataContent: {
    flex: 1,
  },

  metadataLabel: {
    color: COLORS.textMuted,
    fontSize: 8,
    letterSpacing: 0.9,
    fontFamily: "Inter_700Bold",
  },

  metadataValue: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "Inter_600SemiBold",
  },

  metadataSeparator: {
    height: 1,
    marginVertical: 14,
    marginLeft: 54,
    backgroundColor: COLORS.border,
  },

  article: {
    marginTop: 22,
    padding: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
  },

  articleEyebrow: {
    color: COLORS.red,
    fontSize: 9,
    letterSpacing: 1.25,
    fontFamily: "Inter_700Bold",
  },

  articleTitle: {
    marginTop: 7,
    color: COLORS.text,
    fontSize: 22,
    letterSpacing: -0.45,
    fontFamily: "Inter_700Bold",
  },

  articleDivider: {
    width: 42,
    height: 3,
    marginTop: 14,
    marginBottom: 18,
    backgroundColor: COLORS.red,
    borderRadius: 999,
  },

  articleText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 24,
    fontFamily: "Inter_400Regular",
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 18,
    padding: 16,
    backgroundColor: "#181818",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
  },

  infoIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "rgba(229,9,20,0.10)",
    borderRadius: 13,
  },

  infoText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
});