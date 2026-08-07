import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useFocusEffect,
} from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

import api from "../services/api";

type JourSemaine =
  | "LUNDI"
  | "MARDI"
  | "MERCREDI"
  | "JEUDI"
  | "VENDREDI"
  | "SAMEDI"
  | "DIMANCHE";

interface PersonneCours {
  id?: number;
  nom?: string;
  prenom?: string;
  nomComplet?: string;
  fullName?: string;
}

interface ApiCours {
  id?: number;
  idCours?: number;

  titre?: string;
  nomCours?: string;
  libelle?: string;

  jour?: JourSemaine | string;
  jourSemaine?: JourSemaine | string;

  heureDebut?: string;
  heureFin?: string;
  heure?: string;

  instructeur?: string | PersonneCours | null;
  instructeurNom?: string | null;
  nomInstructeur?: string | null;
  coachNom?: string | null;
  coach?: string | PersonneCours | null;
  coachs?: Array<string | PersonneCours>;
  coaches?: Array<string | PersonneCours>;

  lieu?: string | null;
  salle?: string | null;

  niveau?: string | null;
  categorie?: string | null;
  trancheAge?: string | null;
  publicCible?: string | null;

  typeSeance?: string | null;
  typeCours?: string | null;
  discipline?: string | null;

  membreInscrit?: boolean;
}

interface Cours {
  id: number;
  titre: string;
  jour: JourSemaine | string;
  heureDebut: string;
  heureFin: string;
  instructeur?: string | null;
  lieu?: string | null;
  niveau?: string | null;
  typeSeance?: string | null;
  membreInscrit?: boolean;
}

interface PlanningDay {
  key: string;
  label: string;
  courses: Cours[];
}

const DAY_ORDER: Record<string, number> = {
  LUNDI: 1,
  MARDI: 2,
  MERCREDI: 3,
  JEUDI: 4,
  VENDREDI: 5,
  SAMEDI: 6,
  DIMANCHE: 7,
};

const DAY_LABELS: Record<string, string> = {
  LUNDI: "Lundi",
  MARDI: "Mardi",
  MERCREDI: "Mercredi",
  JEUDI: "Jeudi",
  VENDREDI: "Vendredi",
  SAMEDI: "Samedi",
  DIMANCHE: "Dimanche",
};

const FONT_REGULAR = "Inter_400Regular";
const FONT_MEDIUM = "Inter_500Medium";
const FONT_BOLD = "Inter_700Bold";

export default function PlanningScreen() {
  const insets = useSafeAreaInsets();

  const [courses, setCourses] = useState<Cours[]>([]);
  const [memberCourseIds, setMemberCourseIds] = useState<number[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyMyCourses, setShowOnlyMyCourses] =
    useState(false);

  const [selectedDay, setSelectedDay] =
    useState<string>("TOUS");

  const loadPlanning = useCallback(async () => {
    setError(null);

    try {
      /*
       * À adapter si tes routes sont différentes :
       * GET /cours       -> tous les cours du club
       * GET /cours/me    -> cours du membre connecté
       */
      const [clubCoursesResult, memberCoursesResult] =
        await Promise.allSettled([
          api.get<ApiCours[]>("/cours"),
          api.get<ApiCours[]>("/cours/me"),
        ]);

      if (clubCoursesResult.status === "rejected") {
        throw clubCoursesResult.reason;
      }

      const clubCourses = Array.isArray(
        clubCoursesResult.value.data
      )
        ? clubCoursesResult.value.data.map(normalizeCourse)
        : [];

      const memberCourses =
        memberCoursesResult.status === "fulfilled" &&
        Array.isArray(memberCoursesResult.value.data)
          ? memberCoursesResult.value.data.map(normalizeCourse)
          : [];

      const ids = memberCourses
        .map((course) => course.id)
        .filter((id) => Number.isFinite(id) && id > 0);

      setMemberCourseIds(ids);

      setCourses(
        clubCourses.map((course) => ({
          ...course,
          membreInscrit:
            course.membreInscrit === true ||
            ids.includes(course.id),
        }))
      );
    } catch (err) {
      console.error(
        "Erreur lors du chargement du planning :",
        err
      );

      setError(
        "Impossible de charger le planning pour le moment."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadPlanning();
    }, [loadPlanning])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPlanning();
  }, [loadPlanning]);

  const dayFilters = useMemo(() => {
    const availableDays = Array.from(
      new Set(
        courses
          .map((course) => normalizeDay(course.jour))
          .filter(
            (day) =>
              day.length > 0 &&
              DAY_ORDER[day] !== undefined
          )
      )
    ).sort(
      (first, second) =>
        getDayOrder(first) - getDayOrder(second)
    );

    return [
      {
        key: "TOUS",
        label: "Tous",
      },
      ...availableDays.map((day) => ({
        key: day,
        label: getDayShortLabel(day),
      })),
    ];
  }, [courses]);

  const visibleCourses = useMemo(() => {
    const membershipFilteredCourses =
      showOnlyMyCourses
        ? courses.filter(
            (course) =>
              course.membreInscrit === true ||
              memberCourseIds.includes(course.id)
          )
        : courses;

    const dayFilteredCourses =
      selectedDay === "TOUS"
        ? membershipFilteredCourses
        : membershipFilteredCourses.filter(
            (course) =>
              normalizeDay(course.jour) ===
              selectedDay
          );

    return [...dayFilteredCourses].sort((a, b) => {
      const dayDifference =
        getDayOrder(a.jour) - getDayOrder(b.jour);

      if (dayDifference !== 0) {
        return dayDifference;
      }

      return normalizeTime(a.heureDebut).localeCompare(
        normalizeTime(b.heureDebut)
      );
    });
  }, [
    courses,
    memberCourseIds,
    selectedDay,
    showOnlyMyCourses,
  ]);

  const planningDays = useMemo<PlanningDay[]>(() => {
    const groupedCourses = visibleCourses.reduce<
      Record<string, Cours[]>
    >((accumulator, course) => {
      const key = normalizeDay(course.jour);

      if (!accumulator[key]) {
        accumulator[key] = [];
      }

      accumulator[key].push(course);

      return accumulator;
    }, {});

    return Object.entries(groupedCourses)
      .sort(
        ([firstDay], [secondDay]) =>
          getDayOrder(firstDay) -
          getDayOrder(secondDay)
      )
      .map(([day, dayCourses]) => ({
        key: day,
        label: getDayLabel(day),
        courses: dayCourses,
      }));
  }, [visibleCourses]);

  const nextMemberCourse = useMemo(() => {
    const memberCourses = courses
      .filter(
        (course) =>
          course.membreInscrit === true ||
          memberCourseIds.includes(course.id)
      )
      .map((course) => ({
        ...course,
        nextOccurrence:
          getNextCourseOccurrence(course),
      }))
      .sort(
        (a, b) =>
          a.nextOccurrence.getTime() -
          b.nextOccurrence.getTime()
      );

    return memberCourses[0] ?? null;
  }, [courses, memberCourseIds]);

  if (loading) {
    return (
      <View
        style={[
          styles.safeArea,
          { paddingTop: insets.top },
        ]}
      >
        <View style={styles.centeredContainer}>
          <ActivityIndicator
            size="large"
            color="#800020"
          />
          <Text style={styles.loadingText}>
            Chargement du planning...
          </Text>
        </View>
      </View>
    );
  }

  if (error && courses.length === 0) {
    return (
      <View
        style={[
          styles.safeArea,
          { paddingTop: insets.top },
        ]}
      >
        <View style={styles.centeredContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons
              name="calendar-outline"
              size={30}
              color="#800020"
            />
          </View>

          <Text style={styles.errorTitle}>
            Planning indisponible
          </Text>

          <Text style={styles.errorMessage}>
            {error}
          </Text>

          <Pressable
            onPress={() => {
              setLoading(true);
              loadPlanning();
            }}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.retryButtonText}>
              Réessayer
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.safeArea,
        { paddingTop: insets.top },
      ]}
    >
      <StatusBar style="light" animated />
      <FlatList
        data={planningDays}
        keyExtractor={(item, index) =>
          `${item.key || "jour"}-${index}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#800020"
          />
        }
        ListHeaderComponent={
          <View>
            <LinearGradient
              colors={[
                "#343434",
                "#202020",
                "#171717",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerHero}
            >
              <View style={styles.heroGlowOne} />
              <View style={styles.heroGlowTwo} />

              <View style={styles.heroTopRow}>
                <View style={styles.heroPill}>
                  <View style={styles.heroPillDot} />
                  <Text style={styles.heroPillText}>
                    PLANNING DU CLUB
                  </Text>
                </View>

                <View style={styles.headerIconContainer}>
                  <Ionicons
                    name="calendar-outline"
                    size={24}
                    color="#FFFFFF"
                  />
                </View>
              </View>

              <View style={styles.headerTextContainer}>
                <Text style={styles.title}>
                  Planning
                </Text>

                <Text style={styles.subtitle}>
                  Retrouvez les horaires, les lieux et les
                  informations de tous les cours du club.
                </Text>
              </View>
            </LinearGradient>

            {nextMemberCourse ? (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Prochain cours
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    Votre prochaine séance
                  </Text>
                </View>

                <NextCourseCard
                  course={nextMemberCourse}
                />
              </>
            ) : null}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Planning hebdomadaire
              </Text>
              <Text style={styles.sectionSubtitle}>
                Consultez tous les cours ou seulement les vôtres
              </Text>
            </View>

            <View style={styles.filterContainer}>
              <Pressable
                onPress={() =>
                  setShowOnlyMyCourses(false)
                }
                style={[
                  styles.filterButton,
                  !showOnlyMyCourses &&
                    styles.activeFilterButton,
                ]}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    !showOnlyMyCourses &&
                      styles.activeFilterButtonText,
                  ]}
                >
                  Tous les cours
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  setShowOnlyMyCourses(true)
                }
                style={[
                  styles.filterButton,
                  showOnlyMyCourses &&
                    styles.activeFilterButton,
                ]}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    showOnlyMyCourses &&
                      styles.activeFilterButtonText,
                  ]}
                >
                  Mes cours
                </Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={
                styles.dayFilterContent
              }
              style={styles.dayFilterScroll}
            >
              {dayFilters.map((day) => {
                const isActive =
                  selectedDay === day.key;

                return (
                  <Pressable
                    key={day.key}
                    onPress={() =>
                      setSelectedDay(day.key)
                    }
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: isActive,
                    }}
                    accessibilityLabel={`Afficher les cours du jour ${day.label}`}
                    style={({ pressed }) => [
                      styles.dayFilterButton,
                      isActive &&
                        styles.dayFilterButtonActive,
                      pressed &&
                        styles.dayFilterButtonPressed,
                    ]}
                  >
                    {isActive ? (
                      <View
                        style={
                          styles.dayFilterActiveDot
                        }
                      />
                    ) : null}

                    <Text
                      style={[
                        styles.dayFilterText,
                        isActive &&
                          styles.dayFilterTextActive,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {error ? (
              <View style={styles.warningContainer}>
                <Ionicons
                  name="warning-outline"
                  size={17}
                  color="#F3B544"
                />
                <Text style={styles.warningText}>
                  Certaines informations n’ont pas pu être
                  actualisées.
                </Text>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <PlanningDaySection day={item} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="calendar-clear-outline"
                size={30}
                color="#800020"
              />
            </View>

            <Text style={styles.emptyTitle}>
              Aucun cours trouvé
            </Text>

            <Text style={styles.emptyMessage}>
              {selectedDay !== "TOUS"
                ? `Aucun cours n’est prévu le ${getDayLabel(
                    selectedDay
                  ).toLowerCase()}.`
                : showOnlyMyCourses
                  ? "Vous n’avez encore aucun cours associé."
                  : "Le planning du club n’est pas encore disponible."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

function NextCourseCard({
  course,
}: {
  course: Cours & { nextOccurrence: Date };
}) {
  return (
    <View style={styles.nextCourseCard}>
      <View style={styles.nextCourseTopRow}>
        <View style={styles.nextCourseLabelContainer}>
          <Ionicons
            name="flash-outline"
            size={15}
            color="#800020"
          />
          <Text style={styles.nextCourseLabel}>
            Prochain cours
          </Text>
        </View>

        <View style={styles.myCourseBadge}>
          <Ionicons
            name="checkmark-circle"
            size={15}
            color="#800020"
          />
          <Text style={styles.myCourseBadgeText}>
            Mon cours
          </Text>
        </View>
      </View>

      <Text style={styles.nextCourseTitle}>
        {course.titre}
      </Text>

      <View style={styles.nextCourseDetails}>
        <View style={styles.nextCourseDetail}>
          <Ionicons
            name="calendar-outline"
            size={17}
            color="#667085"
          />
          <Text style={styles.nextCourseDetailText}>
            {formatNextCourseDate(
              course.nextOccurrence
            )}
          </Text>
        </View>

        <View style={styles.nextCourseDetail}>
          <Ionicons
            name="time-outline"
            size={17}
            color="#667085"
          />
          <Text style={styles.nextCourseDetailText}>
            {formatTime(course.heureDebut)} -{" "}
            {formatTime(course.heureFin)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function PlanningDaySection({
  day,
}: {
  day: PlanningDay;
}) {
  return (
    <View style={styles.daySection}>
      <View style={styles.dayHeader}>
        <View style={styles.dayDot} />
        <Text style={styles.dayTitle}>
          {day.label}
        </Text>
        <View style={styles.dayLine} />
      </View>

      <View style={styles.coursesContainer}>
        {day.courses.map((course, index) => (
          <CourseCard
            key={`${day.key}-${course.id}-${course.heureDebut}-${index}`}
            course={course}
          />
        ))}
      </View>
    </View>
  );
}

function CourseCard({ course }: { course: Cours }) {
  const isMemberCourse =
    course.membreInscrit === true;

  return (
    <View
      style={[
        styles.courseCard,
        isMemberCourse && styles.memberCourseCard,
      ]}
    >
      <View style={styles.timeColumn}>
        <Text
          style={[
            styles.startTime,
            isMemberCourse &&
              styles.memberStartTime,
          ]}
        >
          {formatTime(course.heureDebut)}
        </Text>

        <View
          style={[
            styles.timeLine,
            isMemberCourse &&
              styles.memberTimeLine,
          ]}
        />

        <Text style={styles.endTime}>
          {formatTime(course.heureFin)}
        </Text>
      </View>

      <View style={styles.courseContent}>
        <View style={styles.courseHeader}>
          <Text
            style={styles.courseTitle}
            numberOfLines={2}
          >
            {course.titre}
          </Text>

          {isMemberCourse ? (
            <View style={styles.memberBadge}>
              <Ionicons
                name="checkmark"
                size={13}
                color="#800020"
              />
              <Text style={styles.memberBadgeText}>
                Mon cours
              </Text>
            </View>
          ) : null}
        </View>

        {course.niveau ? (
          <Text style={styles.courseLevel}>
            {course.niveau}
          </Text>
        ) : null}

        <View style={styles.courseMetadata}>
          {course.instructeur ? (
            <MetadataItem
              icon="person-outline"
              text={course.instructeur}
            />
          ) : null}

          {course.lieu ? (
            <MetadataItem
              icon="location-outline"
              text={course.lieu}
            />
          ) : null}

          {course.typeSeance ? (
            <MetadataItem
              icon="fitness-outline"
              text={course.typeSeance}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

function MetadataItem({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.metadataItem}>
      <Ionicons
        name={icon}
        size={15}
        color="#667085"
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

function firstNonEmptyString(
  ...values: Array<string | null | undefined>
): string | undefined {
  return values.find(
    (value) =>
      typeof value === "string" &&
      value.trim().length > 0
  )?.trim();
}

function formatPersonName(
  person?: string | PersonneCours | null
): string | undefined {
  if (!person) {
    return undefined;
  }

  if (typeof person === "string") {
    return person.trim() || undefined;
  }

  const directName = firstNonEmptyString(
    person.nomComplet,
    person.fullName
  );

  if (directName) {
    return directName;
  }

  const composedName = [
    person.prenom,
    person.nom,
  ]
    .filter(
      (value): value is string =>
        typeof value === "string" &&
        value.trim().length > 0
    )
    .map((value) => value.trim())
    .join(" ");

  return composedName || undefined;
}

function resolveCourseInstructor(
  course: ApiCours
): string | null {
  const directName = firstNonEmptyString(
    course.instructeurNom,
    course.nomInstructeur,
    course.coachNom
  );

  if (directName) {
    return directName;
  }

  const singlePerson =
    formatPersonName(course.instructeur) ??
    formatPersonName(course.coach);

  if (singlePerson) {
    return singlePerson;
  }

  const people = [
    ...(course.coachs ?? []),
    ...(course.coaches ?? []),
  ]
    .map(formatPersonName)
    .filter(
      (name): name is string =>
        typeof name === "string" &&
        name.length > 0
    );

  return people.length > 0
    ? people.join(", ")
    : null;
}

function normalizeCourse(
  course: ApiCours,
  index = 0
): Cours {
  return {
    id:
      Number(course.idCours ?? course.id) ||
      index + 1,

    titre:
      firstNonEmptyString(
        course.titre,
        course.nomCours,
        course.libelle,
        course.discipline
      ) ?? "Cours de taekwondo",

    jour:
      course.jour ??
      course.jourSemaine ??
      "Jour non renseigné",

    heureDebut:
      course.heureDebut ??
      course.heure ??
      "",

    heureFin:
      course.heureFin ?? "",

    instructeur:
      resolveCourseInstructor(course),

    lieu:
      firstNonEmptyString(
        course.lieu,
        course.salle
      ) ?? null,

    niveau:
      firstNonEmptyString(
        course.niveau,
        course.categorie,
        course.trancheAge,
        course.publicCible
      ) ?? null,

    typeSeance:
      firstNonEmptyString(
        course.typeSeance,
        course.typeCours,
        course.discipline
      ) ?? null,

    membreInscrit:
      course.membreInscrit === true,
  };
}

function normalizeDay(day?: string): string {
  return (day ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getDayOrder(day?: string): number {
  return DAY_ORDER[normalizeDay(day)] ?? 99;
}

function getDayLabel(day?: string): string {
  const normalizedDay = normalizeDay(day);

  return (
    DAY_LABELS[normalizedDay] ||
    day ||
    "Jour non renseigné"
  );
}

function getDayShortLabel(
  day?: string
): string {
  const normalizedDay = normalizeDay(day);

  const shortLabels: Record<string, string> = {
    LUNDI: "Lun",
    MARDI: "Mar",
    MERCREDI: "Mer",
    JEUDI: "Jeu",
    VENDREDI: "Ven",
    SAMEDI: "Sam",
    DIMANCHE: "Dim",
  };

  return (
    shortLabels[normalizedDay] ||
    getDayLabel(normalizedDay)
  );
}

function normalizeTime(time?: string): string {
  if (!time) {
    return "99:99";
  }

  return time.substring(0, 5);
}

function formatTime(time?: string): string {
  if (!time) {
    return "--:--";
  }

  return time.substring(0, 5);
}

function getNextCourseOccurrence(
  course: Cours
): Date {
  const now = new Date();
  const targetDay = getDayOrder(course.jour);
  const currentDay =
    now.getDay() === 0 ? 7 : now.getDay();

  let daysToAdd = targetDay - currentDay;

  const [hour, minute] = normalizeTime(
    course.heureDebut
  )
    .split(":")
    .map(Number);

  const occurrence = new Date(now);
  occurrence.setHours(hour || 0, minute || 0, 0, 0);

  if (
    daysToAdd < 0 ||
    (daysToAdd === 0 &&
      occurrence.getTime() <= now.getTime())
  ) {
    daysToAdd += 7;
  }

  occurrence.setDate(now.getDate() + daysToAdd);

  return occurrence;
}

function formatNextCourseDate(
  date: Date
): string {
  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const differenceInDays = Math.round(
    (targetDate.getTime() - today.getTime()) /
      86400000
  );

  if (differenceInDays === 0) {
    return "Aujourd’hui";
  }

  if (differenceInDays === 1) {
    return "Demain";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },

  listContent: {
    paddingBottom: 130,
  },

  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  loadingText: {
    marginTop: 13,
    color: "#B3B3B3",
    fontSize: 13,
    fontFamily: FONT_REGULAR,
  },

  headerHero: {
    minHeight: 250,
    overflow: "hidden",
    marginHorizontal: 16,
    marginTop: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#393939",
    borderRadius: 30,
  },

  heroGlowOne: {
    position: "absolute",
    top: -90,
    right: -70,
    width: 230,
    height: 230,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderRadius: 115,
  },

  heroGlowTwo: {
    position: "absolute",
    bottom: -100,
    left: -70,
    width: 220,
    height: 220,
    backgroundColor: "rgba(255,255,255,0.025)",
    borderRadius: 110,
  },

  heroTopRow: {
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: "rgba(10,10,10,0.34)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
  },

  heroPillDot: {
    width: 7,
    height: 7,
    backgroundColor: "#1DB954",
    borderRadius: 4,
  },

  heroPillText: {
    color: "#D8D8D8",
    fontSize: 9,
    letterSpacing: 0.8,
    fontFamily: FONT_BOLD,
  },

  headerTextContainer: {
    zIndex: 2,
    flex: 1,
    justifyContent: "flex-end",
    marginTop: 55,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -1,
    fontFamily: FONT_BOLD,
  },

  subtitle: {
    maxWidth: 300,
    marginTop: 9,
    color: "#B3B3B3",
    fontSize: 13,
    lineHeight: 20,
    fontFamily: FONT_REGULAR,
  },

  headerIconContainer: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(10,10,10,0.38)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 14,
  },

  sectionHeader: {
    marginTop: 29,
    marginBottom: 12,
    paddingHorizontal: 18,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: FONT_BOLD,
  },

  sectionSubtitle: {
    marginTop: 4,
    color: "#7C7C7C",
    fontSize: 11,
    fontFamily: FONT_REGULAR,
  },

  nextCourseCard: {
    minHeight: 190,
    marginHorizontal: 16,
    padding: 19,
    backgroundColor: "#1B1B1B",
    borderWidth: 1,
    borderColor: "#373737",
    borderRadius: 25,
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 9,
    },
    elevation: 6,
  },

  nextCourseTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  nextCourseLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  nextCourseLabel: {
    color: "#B3B3B3",
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    fontFamily: FONT_BOLD,
  },

  myCourseBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#302626",
    borderRadius: 999,
  },

  myCourseBadgeText: {
    color: "#E5B2B5",
    fontSize: 10,
    fontFamily: FONT_BOLD,
  },

  nextCourseTitle: {
    marginTop: 23,
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 30,
    fontFamily: FONT_BOLD,
  },

  nextCourseDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 17,
  },

  nextCourseDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  nextCourseDetailText: {
    color: "#B3B3B3",
    fontSize: 11,
    fontFamily: FONT_REGULAR,
  },

  filterContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 22,
    padding: 4,
    backgroundColor: "#1B1B1B",
    borderWidth: 1,
    borderColor: "#282828",
    borderRadius: 17,
  },

  filterButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 13,
  },

  activeFilterButton: {
    backgroundColor: "#292929",
    borderWidth: 1,
    borderColor: "#373737",
  },

  filterButtonText: {
    color: "#7C7C7C",
    fontSize: 12,
    fontFamily: FONT_MEDIUM,
  },

  activeFilterButtonText: {
    color: "#FFFFFF",
    fontFamily: FONT_BOLD,
  },

  dayFilterScroll: {
    marginBottom: 22,
  },

  dayFilterContent: {
    paddingHorizontal: 16,
    gap: 10,
  },

  dayFilterButton: {
    minWidth: 62,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    backgroundColor: "#1B1B1B",
    borderWidth: 1,
    borderColor: "#282828",
    borderRadius: 16,
  },

  dayFilterButtonActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 4,
  },

  dayFilterButtonPressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  dayFilterActiveDot: {
    width: 6,
    height: 6,
    marginRight: 7,
    backgroundColor: "#E50914",
    borderRadius: 3,
  },

  dayFilterText: {
    color: "#7C7C7C",
    fontSize: 12,
    fontFamily: FONT_BOLD,
  },

  dayFilterTextActive: {
    color: "#171717",
  },

  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 13,
    backgroundColor: "rgba(243,181,68,0.08)",
    borderWidth: 1,
    borderColor: "rgba(243,181,68,0.22)",
    borderRadius: 16,
  },

  warningText: {
    flex: 1,
    color: "#D7B76E",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: FONT_REGULAR,
  },

  daySection: {
    marginBottom: 27,
  },

  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 18,
  },

  dayDot: {
    width: 7,
    height: 7,
    backgroundColor: "#E50914",
    borderRadius: 4,
  },

  dayTitle: {
    marginLeft: 9,
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: FONT_BOLD,
  },

  dayLine: {
    flex: 1,
    height: 1,
    marginLeft: 12,
    backgroundColor: "#282828",
  },

  coursesContainer: {
    gap: 10,
    paddingHorizontal: 16,
  },

  courseCard: {
    flexDirection: "row",
    minHeight: 132,
    padding: 15,
    backgroundColor: "#1B1B1B",
    borderWidth: 1,
    borderColor: "#282828",
    borderRadius: 24,
    shadowColor: "#000000",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 4,
  },

  memberCourseCard: {
    backgroundColor: "#202020",
    borderColor: "#393939",
  },

  timeColumn: {
    width: 58,
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 14,
  },

  startTime: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: FONT_BOLD,
  },

  memberStartTime: {
    color: "#E5B2B5",
  },

  timeLine: {
    width: 2,
    height: 24,
    marginVertical: 5,
    backgroundColor: "#3A3A3A",
    borderRadius: 999,
  },

  memberTimeLine: {
    backgroundColor: "#E50914",
  },

  endTime: {
    color: "#7C7C7C",
    fontSize: 11,
    fontFamily: FONT_MEDIUM,
  },

  courseContent: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    paddingLeft: 15,
    borderLeftWidth: 1,
    borderLeftColor: "#282828",
  },

  courseHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  courseTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 21,
    fontFamily: FONT_BOLD,
  },

  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    backgroundColor: "#302626",
    borderRadius: 999,
  },

  memberBadgeText: {
    color: "#E5B2B5",
    fontSize: 9,
    fontFamily: FONT_BOLD,
  },

  courseLevel: {
    alignSelf: "flex-start",
    marginTop: 8,
    color: "#B3B3B3",
    fontSize: 11,
    fontFamily: FONT_BOLD,
  },

  courseMetadata: {
    gap: 8,
    marginTop: 12,
  },

  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  metadataText: {
    flex: 1,
    color: "#7C7C7C",
    fontSize: 11,
    fontFamily: FONT_REGULAR,
  },

  errorIconContainer: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1B1B1B",
    borderWidth: 1,
    borderColor: "#303030",
    borderRadius: 36,
  },

  errorTitle: {
    marginTop: 18,
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: FONT_BOLD,
  },

  errorMessage: {
    marginTop: 8,
    color: "#B3B3B3",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    fontFamily: FONT_REGULAR,
  },

  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#292929",
    borderWidth: 1,
    borderColor: "#393939",
    borderRadius: 14,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: FONT_BOLD,
  },

  buttonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },

  emptyContainer: {
    alignItems: "center",
    marginHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 45,
    paddingHorizontal: 26,
    backgroundColor: "#1B1B1B",
    borderWidth: 1,
    borderColor: "#282828",
    borderRadius: 24,
  },

  emptyIconContainer: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#292929",
    borderRadius: 20,
  },

  emptyTitle: {
    marginTop: 16,
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: FONT_BOLD,
  },

  emptyMessage: {
    marginTop: 7,
    color: "#7C7C7C",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    fontFamily: FONT_REGULAR,
  },
});