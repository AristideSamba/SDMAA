import React, { useMemo } from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import api from "../../services/api";

export interface DashboardUser {
  nomComplet?: string;
  nom?: string;
  prenom?: string;
  photoUrl?: string;
  imageUrl?: string;
  avatarUrl?: string;
  ceintureNom?: string;
  ceintureCouleur?: string;
}

export interface DashboardCourse {
  id?: number;
  jour: string;
  heureDebut: string;
  heureFin: string;
  coachs?: string[];
  coach?: string;
  instructeur?: string;
}

interface DashboardHeaderProps {
  user: DashboardUser | null;
  prochainCours: DashboardCourse | null;
  notificationCount: number;
  competitionCount: number;
  weeklyCourseCount: number;
  weeklyActivityCount: number;
  weeklyAnnouncementCount: number;
  onPressNotifications: () => void;
}

const COLORS = {
  background: "#121212",
  card: "#1B1B1B",
  text: "#FFFFFF",
  textSecondary: "#B3B3B3",
  textMuted: "#7A7A7A",
  border: "#2F2F2F",
  red: "#E50914",
  weekBlue: "#182633",
  weekBlueAccent: "#60A5FA",
};

function getFirstName(fullName?: string): string {
  if (!fullName?.trim()) {
    return "membre";
  }

  return fullName.trim().split(/\s+/)[0];
}


function resolveImageUrl(value?: string): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const cleanedValue = value.trim();

  if (
    cleanedValue.startsWith("http://") ||
    cleanedValue.startsWith("https://") ||
    cleanedValue.startsWith("file://") ||
    cleanedValue.startsWith("content://")
  ) {
    return cleanedValue;
  }

  const baseUrl = String(api.defaults.baseURL || "")
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");

  const cleanedPath = cleanedValue
    .replace(/^\/+/, "")
    .replace(/^uploads\//, "");

  return `${baseUrl}/uploads/${cleanedPath}`;
}

function getDisplayName(user: DashboardUser | null): string {
  if (user?.prenom?.trim()) {
    return user.prenom.trim();
  }

  if (user?.nomComplet?.trim()) {
    return getFirstName(user.nomComplet);
  }

  if (user?.nom?.trim()) {
    return user.nom.trim();
  }

  return "membre";
}

function normalizeHexColor(color?: string): string | null {
  if (!color) {
    return null;
  }

  const value = color.trim();

  if (
    /^#[0-9A-F]{6}$/i.test(value) ||
    /^#[0-9A-F]{3}$/i.test(value)
  ) {
    return value;
  }

  return null;
}

function getBeltColor(
  belt?: string,
  databaseColor?: string
): string {
  const safeDatabaseColor =
    normalizeHexColor(databaseColor);

  if (safeDatabaseColor) {
    return safeDatabaseColor;
  }

  switch (belt?.trim().toLowerCase()) {
    case "blanche":
      return "#FFFFFF";
    case "jaune":
      return "#FFD60A";
    case "orange":
      return "#FF8A00";
    case "verte":
      return "#22C55E";
    case "bleue":
      return "#2563EB";
    case "rouge":
      return "#DC2626";
    case "marron":
      return "#8B4513";
    case "noire":
      return "#090909";
    default:
      return "#D1D5DB";
  }
}

function isLightColor(hex: string): boolean {
  let value = hex.replace("#", "");

  if (value.length === 3) {
    value = value
      .split("")
      .map((character) => character + character)
      .join("");
  }

  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);

  const luminance =
    (red * 299 + green * 587 + blue * 114) /
    1000;

  return luminance > 180;
}

function darkenHexColor(
  hex: string,
  amount = 0.22
): string {
  let value = hex.replace("#", "");

  if (value.length === 3) {
    value = value
      .split("")
      .map((character) => character + character)
      .join("");
  }

  const channels = [0, 2, 4].map((index) =>
    Math.max(
      0,
      Math.round(
        parseInt(value.slice(index, index + 2), 16) *
          (1 - amount)
      )
    )
  );

  return `#${channels
    .map((channel) =>
      channel.toString(16).padStart(2, "0")
    )
    .join("")}`;
}

function formatCourseTime(course: DashboardCourse | null): string {
  if (!course) {
    return "Horaire à confirmer";
  }

  const start = course.heureDebut?.slice(0, 5);
  const end = course.heureFin?.slice(0, 5);

  if (start && end) {
    return `${start} — ${end}`;
  }

  return start || end || "Horaire à confirmer";
}

function getCoachName(course: DashboardCourse | null): string {
  if (!course) {
    return "";
  }

  if (Array.isArray(course.coachs) && course.coachs.length > 0) {
    return course.coachs.join(", ");
  }

  return course.coach || course.instructeur || "";
}

export default function DashboardHeader({
  user,
  prochainCours,
  notificationCount,
  competitionCount,
  weeklyCourseCount,
  weeklyActivityCount,
  weeklyAnnouncementCount,
  onPressNotifications,
}: DashboardHeaderProps) {
  const insets = useSafeAreaInsets();

  const avatarUrl = resolveImageUrl(
    user?.photoUrl || user?.imageUrl || user?.avatarUrl
  );

  const firstName = getDisplayName(user);
  const initial = firstName.charAt(0).toUpperCase();
  const beltColor = getBeltColor(
    user?.ceintureNom,
    user?.ceintureCouleur
  );
  const courseTime = formatCourseTime(prochainCours);
  const coachName = getCoachName(prochainCours);

  const competitionLabel = useMemo(() => {
    if (competitionCount === 0) {
      return "Aucune compétition";
    }

    if (competitionCount === 1) {
      return "1 compétition";
    }

    return `${competitionCount} compétitions`;
  }, [competitionCount]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 18,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.greetingBlock}>
          <Text style={styles.eyebrow}>
            SAINT-DENIS MARTIAL ART ACADEMY
          </Text>

          <View style={styles.userContainer}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
                accessibilityLabel={`Photo de profil de ${firstName}`}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarLetter}>
                  {initial}
                </Text>
              </View>
            )}

            <View style={styles.greetingTextBlock}>
              <Text style={styles.greeting}>
                Bonjour {firstName}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={onPressNotifications}
          accessibilityRole="button"
          accessibilityLabel="Voir mes notifications"
          accessibilityHint="Ouvre l’écran de vos notifications"
          hitSlop={8}
          style={({ pressed }) => [
            styles.notificationButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={COLORS.text}
          />

          {notificationCount > 0 ? (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {notificationCount > 9 ? "9+" : notificationCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <LinearGradient
        colors={["#351012", "#211617", "#191919"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroGlow} />

        <View style={styles.heroHeader}>
          <View style={styles.beltIconContainer}>
            <Ionicons
              name="ribbon-outline"
              size={23}
              color={COLORS.text}
            />
          </View>

          <View style={styles.competitionPill}>
            <Ionicons
              name="trophy-outline"
              size={14}
              color="#FFD166"
            />

            <Text style={styles.competitionText}>
              {competitionLabel}
            </Text>
          </View>
        </View>

        <View style={styles.beltBlock}>
          <Text style={styles.beltLabel}>
            Ceinture actuelle
          </Text>

          <DashboardBeltBadge
            name={user?.ceintureNom}
            color={beltColor}
          />
        </View>

        <View style={styles.heroDivider} />

        <View style={styles.courseBlock}>
          <View style={styles.courseInformation}>
            <Text style={styles.courseLabel}>
              PROCHAIN ENTRAÎNEMENT
            </Text>

            <Text style={styles.courseDay}>
              {prochainCours?.jour || "Aucun cours prévu"}
            </Text>

            <Text style={styles.courseTime}>
              {courseTime}
            </Text>

            {coachName ? (
              <Text style={styles.courseCoach} numberOfLines={1}>
                Coach {coachName}
              </Text>
            ) : null}
          </View>

          <View style={styles.courseIcon}>
            <Ionicons
              name="calendar-outline"
              size={21}
              color={COLORS.text}
            />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.weekCard}>
        <View style={styles.weekHeader}>
          <View>
            <Text style={styles.weekEyebrow}>
              VOTRE RYTHME
            </Text>

            <Text style={styles.weekTitle}>
              Cette semaine
            </Text>
          </View>

          <View style={styles.weekIcon}>
            <Ionicons
              name="pulse-outline"
              size={21}
              color={COLORS.weekBlueAccent}
            />
          </View>
        </View>

        <View style={styles.weekStats}>
          <WeeklyStat
            icon="fitness-outline"
            value={weeklyCourseCount}
            label="Entraînements"
          />

          <View style={styles.statDivider} />

          <WeeklyStat
            icon="flag-outline"
            value={weeklyActivityCount}
            label="Activités"
          />

          <View style={styles.statDivider} />

          <WeeklyStat
            icon="megaphone-outline"
            value={weeklyAnnouncementCount}
            label="Annonces"
          />
        </View>
      </View>
    </View>
  );
}

interface DashboardBeltBadgeProps {
  name?: string;
  color: string;
}

function DashboardBeltBadge({
  name,
  color,
}: DashboardBeltBadgeProps) {
  const darkColor = darkenHexColor(color);
  const lightColor = isLightColor(color);
  const displayName = name?.trim()
    ? `Ceinture ${name.trim()}`
    : "Ceinture non renseignée";

  return (
    <View style={styles.beltBadge}>
      <LinearGradient
        colors={[color, darkColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.beltColorBar,
          lightColor && styles.beltColorBarLight,
        ]}
      >
        <View style={styles.beltHighlight} />

        
      </LinearGradient>

      <View style={styles.beltTextBlock}>
        

        <Text style={styles.beltName}>
          {displayName}
        </Text>
      </View>
    </View>
  );
}

function WeeklyStat({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
}) {
  return (
    <View style={styles.weekStat}>
      <Ionicons
        name={icon}
        size={18}
        color={COLORS.textSecondary}
      />

      <Text style={styles.weekStatValue}>
        {value}
      </Text>

      <Text style={styles.weekStatLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: COLORS.background,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  greetingBlock: {
    flex: 1,
    paddingRight: 16,
  },

  eyebrow: {
    color: "#ffffff",
    fontSize: 9,
    letterSpacing: 1.35,
    fontFamily: "Inter_700Bold",
  },

  greeting: {
    marginTop: 8,
    color: COLORS.text,
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: -1,
    fontFamily: "Inter_700Bold",
  },

  subtitle: {
    marginTop: 5,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },

  notificationButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
  },

  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    backgroundColor: COLORS.red,
    borderWidth: 2,
    borderColor: COLORS.background,
    borderRadius: 10,
  },

  notificationBadgeText: {
    color: COLORS.text,
    fontSize: 9,
    fontFamily: "Inter_700Bold",
  },

  heroCard: {
    minHeight: 310,
    overflow: "hidden",
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 30,
  },

  heroGlow: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    backgroundColor: "rgba(229,9,20,0.14)",
    borderRadius: 110,
  },

  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  beltIconContainer: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 17,
  },

  competitionPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 11,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 999,
  },

  competitionText: {
    marginLeft: 7,
    color: COLORS.textSecondary,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },

  beltBlock: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 26,
  },

  beltLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 1.2,
    fontFamily: "Inter_700Bold",
  },

  beltBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 12,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 20,
  },

  beltColorBar: {
    position: "relative",
    width: 74,
    height: 30,
    justifyContent: "center",
    overflow: "visible",
    marginRight: 13,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.32)",
    borderRadius: 9,
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  beltColorBarLight: {
    borderColor: "rgba(0,0,0,0.18)",
  },

  beltHighlight: {
    position: "absolute",
    top: 4,
    left: 7,
    right: 7,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.24)",
    borderRadius: 999,
  },


  beltTextBlock: {
    flexShrink: 1,
  },

  beltBadgeLabel: {
    color: COLORS.textMuted,
    fontSize: 8,
    letterSpacing: 1.15,
    fontFamily: "Inter_700Bold",
  },

  beltName: {
    marginTop: 3,
    flexShrink: 1,
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.45,
    textTransform: "capitalize",
    fontFamily: "Inter_700Bold",
  },

  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  courseBlock: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: 18,
  },

  courseInformation: {
    flex: 1,
    paddingRight: 14,
  },

  courseLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 1.15,
    fontFamily: "Inter_700Bold",
  },

  courseDay: {
    marginTop: 6,
    color: COLORS.text,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },

  courseTime: {
    marginTop: 3,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },

  courseCoach: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },

  courseIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
  },

  weekCard: {
    marginTop: 14,
    padding: 18,
    backgroundColor: COLORS.weekBlue,
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.18)",
    borderRadius: 24,
  },

  weekHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  weekEyebrow: {
    color: "#8DB9E8",
    fontSize: 9,
    letterSpacing: 1.15,
    fontFamily: "Inter_700Bold",
  },

  weekTitle: {
    marginTop: 5,
    color: COLORS.text,
    fontSize: 19,
    letterSpacing: -0.4,
    fontFamily: "Inter_700Bold",
  },

  weekIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(96,165,250,0.14)",
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.16)",
    borderRadius: 14,
  },

  weekStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  weekStat: {
    flex: 1,
    alignItems: "center",
  },

  weekStatValue: {
    marginTop: 8,
    color: COLORS.text,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },

  weekStatLabel: {
    marginTop: 4,
    color: "#9AB4CC",
    fontSize: 9,
    textAlign: "center",
    fontFamily: "Inter_500Medium",
  },

  statDivider: {
    width: 1,
    height: 45,
    backgroundColor: "rgba(148,183,216,0.18)",
  },

  buttonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },

  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  greetingTextBlock: {
    flex: 1,
  },

  avatar: {
    width: 48,
    height: 48,
    marginRight: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
  },

  avatarFallback: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: COLORS.red,
    borderRadius: 24,
  },

  avatarLetter: {
    color: COLORS.text,
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
});