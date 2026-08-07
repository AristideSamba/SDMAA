import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
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
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import Reanimated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import {
  LineChart,
} from "react-native-gifted-charts";

import api from "../services/api";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

type RootStackParamList = {
  MesEngagements: undefined;
  Main: undefined;
};

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    "MesEngagements"
  >;

type FilterType =
  | "TOUS"
  | "ACTIVITES"
  | "COMPETITIONS";

interface InscriptionActivite {
  id?: number;
  idInscription?: number;

  dateDemande?: string;
  dateValidationAdmin?: string;

  commentaire?: string;

  statutInscription?: string;
  statutPaiement?: string;
  modePaiement?: string;

  activiteId?: number;
  activiteTitre?: string;
  activiteDate?: string;
  activiteHeure?: string;
  activiteLieu?: string;

  typeActivite?: string;
  categorie?: string;
  discipline?: string;
  image?: string;
  dureeActivite?: string;

  lienExterne?: string;
}

type TypeMedaille =
  | "OR"
  | "ARGENT"
  | "BRONZE"
  | "AUCUNE";

interface ResultatCompetition {
  idResultat: number;
  idInscription: number;

  idUtilisateur: number;
  nomUtilisateur: string;
  prenomUtilisateur: string;

  idActivite: number;
  titreCompetition: string;
  dateCompetition: string;
  lieuCompetition: string;

  rang: number;
  nombreParticipants?: number;
  medaille?: TypeMedaille;
  commentaireCoach?: string;
}

type StatusVariant =
  | "waiting"
  | "success"
  | "danger"
  | "neutral";

interface StatusInfo {
  label: string;
  variant: StatusVariant;
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
  green: "#3DDC84",
  amber: "#F5B942",
};

const FILTERS: Array<{
  id: FilterType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  {
    id: "TOUS",
    label: "Tous",
    icon: "grid-outline",
  },
  {
    id: "ACTIVITES",
    label: "Activités",
    icon: "flash-outline",
  },
  {
    id: "COMPETITIONS",
    label: "Compétitions",
    icon: "trophy-outline",
  },
];

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function MesEngagementsScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  const isFocused =
    useIsFocused();

  const insets =
    useSafeAreaInsets();

  const [
    inscriptions,
    setInscriptions,
  ] = useState<InscriptionActivite[]>([]);

  const [
    resultats,
    setResultats,
  ] = useState<ResultatCompetition[]>([]);

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState<FilterType>("TOUS");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const fetchEngagements =
    useCallback(async (): Promise<void> => {
      try {
        setError("");

        const [
          inscriptionsResponse,
          resultatsResponse,
        ] = await Promise.all([
          api.get(
            "/inscriptions-activites/me"
          ),
          api.get(
            "/resultats-competitions/me"
          ),
        ]);

        const inscriptionsData =
          Array.isArray(
            inscriptionsResponse.data
          )
            ? inscriptionsResponse.data
            : [];

        const resultatsData =
          Array.isArray(
            resultatsResponse.data
          )
            ? resultatsResponse.data
            : [];

        setInscriptions(
          inscriptionsData
        );

        setResultats(
          resultatsData
        );
      } catch (requestError) {
        const axiosError =
          requestError as {
            message?: string;
            response?: {
              status?: number;
              data?: unknown;
            };
          };

        console.error(
          "Erreur pendant le chargement des engagements :",
          {
            message:
              axiosError.message,
            status:
              axiosError.response
                ?.status,
            response:
              axiosError.response
                ?.data,
          }
        );

        setError(
          "Impossible de charger vos engagements pour le moment."
        );

        setInscriptions([]);
        setResultats([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);

  useEffect(() => {
    fetchEngagements();
  }, [fetchEngagements]);

  const handleRefresh =
    useCallback((): void => {
      setRefreshing(true);
      fetchEngagements();
    }, [fetchEngagements]);

  const handleGoBack =
    useCallback((): void => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }

      navigation.navigate("Main");
    }, [navigation]);

  const isCompetition =
    useCallback(
      (
        inscription:
          InscriptionActivite
      ): boolean => {
        const type = [
          inscription.typeActivite,
          inscription.categorie,
          inscription.activiteTitre,
        ]
          .filter(Boolean)
          .join(" ")
          .trim()
          .toLowerCase();

        return (
          type.includes(
            "compétition"
          ) ||
          type.includes(
            "competition"
          ) ||
          type.includes("comp")
        );
      },
      []
    );

  const filteredInscriptions =
    useMemo(() => {
      const filtered =
        inscriptions.filter(
          (inscription) => {
            if (
              selectedFilter ===
              "TOUS"
            ) {
              return true;
            }

            const competition =
              isCompetition(
                inscription
              );

            if (
              selectedFilter ===
              "COMPETITIONS"
            ) {
              return competition;
            }

            return !competition;
          }
        );

      return [...filtered].sort(
        (first, second) => {
          const firstDate =
            parseDateValue(
              first.activiteDate
            );

          const secondDate =
            parseDateValue(
              second.activiteDate
            );

          return (
            secondDate -
            firstDate
          );
        }
      );
    }, [
      inscriptions,
      selectedFilter,
      isCompetition,
    ]);

  const statistics =
    useMemo(() => {
      const activities =
        inscriptions.filter(
          (item) =>
            !isCompetition(item)
        ).length;

      const competitions =
        inscriptions.filter(
          (item) =>
            isCompetition(item)
        ).length;

      const confirmed =
        inscriptions.filter(
          (item) =>
            normalizeValue(
              item.statutInscription
            ) === "CONFIRME"
        ).length;

      return {
        total:
          inscriptions.length,
        activities,
        competitions,
        confirmed,
      };
    }, [
      inscriptions,
      isCompetition,
    ]);

  const resultatsParInscription =
    useMemo(() => {
      return new Map(
        resultats.map(
          (resultat) => [
            resultat.idInscription,
            resultat,
          ]
        )
      );
    }, [resultats]);

  if (loading) {
    return (
      <EngagementsLoading
        isFocused={isFocused}
      />
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      {isFocused ? (
        <StatusBar
          style="light"
          animated
        />
      ) : null}

      <FlatList
        data={filteredInscriptions}
        keyExtractor={(
          item,
          index
        ) =>
          String(
            item.idInscription ??
              item.id ??
              index
          )
        }
        renderItem={({
          item,
          index,
        }) => {
          const id =
            item.idInscription ??
            item.id ??
            -1;

          return (
            <Reanimated.View
              entering={FadeInDown
                .duration(420)
                .delay(index * 55)}
            >
              <EngagementCard
                inscription={item}
                competition={
                  isCompetition(item)
                }
                resultat={
                  resultatsParInscription.get(
                    id
                  )
                }
              />
            </Reanimated.View>
          );
        }}
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
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom:
              insets.bottom + 110,
          },
          filteredInscriptions.length ===
            0 &&
            styles.emptyListContent,
        ]}
        ListHeaderComponent={
          <View>
            <Reanimated.View
              entering={FadeInUp.duration(
                350
              )}
            >
              <ScreenHeader
                onGoBack={handleGoBack}
              />
            </Reanimated.View>

            <Reanimated.View
              entering={FadeInUp
                .duration(450)
                .delay(60)}
            >
              <EngagementsHero
                total={
                  statistics.total
                }
                confirmed={
                  statistics.confirmed
                }
              />
            </Reanimated.View>

            <StatisticsSection
              total={statistics.total}
              activities={
                statistics.activities
              }
              competitions={
                statistics.competitions
              }
            />

            <PerformanceChartSection
              resultats={resultats}
            />

            <FilterSection
              selectedFilter={
                selectedFilter
              }
              onSelectFilter={
                setSelectedFilter
              }
            />

            {error ? (
              <ErrorBox
                message={error}
                onRetry={
                  fetchEngagements
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
                  MES INSCRIPTIONS
                </Text>

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Engagements récents
                </Text>
              </View>

              <View
                style={styles.countPill}
              >
                <Text
                  style={styles.countText}
                >
                  {
                    filteredInscriptions.length
                  }
                </Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            hasError={Boolean(error)}
            selectedFilter={
              selectedFilter
            }
          />
        }
      />
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/*                                SUBCOMPONENTS                               */
/* -------------------------------------------------------------------------- */

function ScreenHeader({
  onGoBack,
}: {
  onGoBack: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onGoBack}
        accessibilityRole="button"
        accessibilityLabel="Retour"
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

      <Text style={styles.headerTitle}>
        Mes engagements
      </Text>

      <View
        style={styles.headerSpacer}
        accessible={false}
      />
    </View>
  );
}

function EngagementsHero({
  total,
  confirmed,
}: {
  total: number;
  confirmed: number;
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
            name="ribbon-outline"
            size={24}
            color={COLORS.text}
          />
        </View>

        <View style={styles.heroBadge}>
          <View
            style={styles.heroBadgeDot}
          />

          <Text
            style={styles.heroBadgeText}
          >
            MON ESPACE
          </Text>
        </View>
      </View>

      <View style={styles.heroContent}>
        <Text style={styles.heroEyebrow}>
          SDMAA
        </Text>

        <Text style={styles.heroTitle}>
          Mes inscriptions
        </Text>

        <Text
          style={styles.heroSubtitle}
        >
          Retrouvez vos activités,
          stages, compétitions et
          performances dans un seul
          espace.
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
              engagements
            </Text>
          </View>

          <View
            style={styles.heroStatDivider}
          />

          <View>
            <Text
              style={styles.heroStatValue}
            >
              {confirmed}
            </Text>

            <Text
              style={styles.heroStatLabel}
            >
              confirmés
            </Text>
          </View>
        </View>

        <View
          style={styles.heroFooterIcon}
        >
          <Ionicons
            name="checkmark-done-outline"
            size={22}
            color={
              COLORS.textSecondary
            }
          />
        </View>
      </View>
    </LinearGradient>
  );
}

function StatisticsSection({
  total,
  activities,
  competitions,
}: {
  total: number;
  activities: number;
  competitions: number;
}) {
  return (
    <View
      style={
        styles.statisticsContainer
      }
    >
      <StatisticCard
        icon="layers-outline"
        value={total}
        label="Total"
      />

      <StatisticCard
        icon="flash-outline"
        value={activities}
        label="Activités"
      />

      <StatisticCard
        icon="trophy-outline"
        value={competitions}
        label="Compétitions"
      />
    </View>
  );
}

function StatisticCard({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
}) {
  return (
    <View style={styles.statisticCard}>
      <View
        style={styles.statisticIcon}
      >
        <Ionicons
          name={icon}
          size={17}
          color={COLORS.red}
        />
      </View>

      <Text
        style={styles.statisticValue}
      >
        {value}
      </Text>

      <Text
        style={styles.statisticLabel}
      >
        {label}
      </Text>
    </View>
  );
}

function PerformanceChartSection({
  resultats,
}: {
  resultats:
    ResultatCompetition[];
}) {
  const chartData =
    useMemo(() => {
      const validResults =
        resultats
          .map((resultat) => ({
            ...resultat,
            normalizedRank:
              Number(resultat.rang),
          }))
          .filter(
            (resultat) =>
              Number.isFinite(
                resultat.normalizedRank
              ) &&
              resultat.normalizedRank >
                0
          )
          .sort(
            (first, second) =>
              parseDateValue(
                first.dateCompetition
              ) -
              parseDateValue(
                second.dateCompetition
              )
          );

      if (
        validResults.length === 0
      ) {
        return [];
      }

      const worstRank = Math.max(
        ...validResults.map(
          (resultat) =>
            resultat.normalizedRank
        )
      );

      return validResults.map(
        (resultat) => ({
          value:
            worstRank -
            resultat.normalizedRank +
            1,
          label: formatShortDate(
            resultat.dateCompetition
          ),
          dataPointText:
            formatRank(
              resultat.normalizedRank
            ),
          rank:
            resultat.normalizedRank,
        })
      );
    }, [resultats]);

  const bestRank =
    useMemo(() => {
      if (
        chartData.length === 0
      ) {
        return null;
      }

      return Math.min(
        ...chartData.map(
          (item) => item.rank
        )
      );
    }, [chartData]);

  return (
    <View
      style={styles.performanceSection}
    >
      <View
        style={styles.performanceHeader}
      >
        <View
          style={
            styles.performanceHeaderText
          }
        >
          <Text
            style={
              styles.performanceEyebrow
            }
          >
            MES RÉSULTATS
          </Text>

          <Text
            style={
              styles.performanceTitle
            }
          >
            Mes performances
          </Text>

          <Text
            style={
              styles.performanceDescription
            }
          >
            Plus la courbe monte,
            meilleur est votre
            classement.
          </Text>
        </View>

        {bestRank !== null ? (
          <View
            style={styles.bestRankBadge}
          >
            <Text
              style={
                styles.bestRankLabel
              }
            >
              MEILLEUR
            </Text>

            <Text
              style={
                styles.bestRankValue
              }
            >
              {formatRank(bestRank)}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.chartCard}>
        {chartData.length > 0 ? (
          <LineChart
            data={chartData}
            height={180}
            width={278}
            spacing={
              chartData.length === 1
                ? 140
                : Math.max(
                    70,
                    255 /
                      Math.max(
                        chartData.length -
                          1,
                        1
                      )
                  )
            }
            initialSpacing={
              chartData.length === 1
                ? 135
                : 20
            }
            endSpacing={20}
            thickness={3}
            color={COLORS.text}
            dataPointsColor={
              COLORS.red
            }
            dataPointsRadius={5}
            textColor={COLORS.text}
            textFontSize={11}
            xAxisColor={
              COLORS.border
            }
            yAxisColor={
              COLORS.border
            }
            rulesColor={
              COLORS.borderSoft
            }
            yAxisTextStyle={
              styles.chartAxisText
            }
            xAxisLabelTextStyle={
              styles.chartAxisText
            }
            hideYAxisText
            noOfSections={4}
            curved={
              chartData.length > 2
            }
            isAnimated
            animationDuration={700}
          />
        ) : (
          <View
            style={
              styles.chartEmptyState
            }
          >
            <View
              style={
                styles.chartEmptyIcon
              }
            >
              <Ionicons
                name="analytics-outline"
                size={28}
                color={COLORS.red}
              />
            </View>

            <Text
              style={
                styles.chartEmptyTitle
              }
            >
              Aucun résultat
            </Text>

            <Text
              style={
                styles.chartEmptyDescription
              }
            >
              Le graphique apparaîtra
              dès qu’un résultat de
              compétition sera
              disponible.
            </Text>
          </View>
        )}
      </View>

      <Text
        style={styles.performanceCount}
      >
        {chartData.length} résultat
        {chartData.length > 1
          ? "s"
          : ""}{" "}
        pris en compte
      </Text>
    </View>
  );
}

function FilterSection({
  selectedFilter,
  onSelectFilter,
}: {
  selectedFilter: FilterType;
  onSelectFilter: (
    filter: FilterType
  ) => void;
}) {
  return (
    <View style={styles.filterSection}>
      <View
        style={styles.filterHeader}
      >
        <View>
          <Text
            style={
              styles.filterEyebrow
            }
          >
            FILTRES
          </Text>

          <Text
            style={styles.filterTitle}
          >
            Afficher
          </Text>
        </View>
      </View>

      <View style={styles.filters}>
        {FILTERS.map((filter) => {
          const selected =
            selectedFilter ===
            filter.id;

          return (
            <Pressable
              key={filter.id}
              onPress={() =>
                onSelectFilter(
                  filter.id
                )
              }
              accessibilityRole="button"
              accessibilityLabel={`Afficher : ${filter.label}`}
              accessibilityState={{
                selected,
              }}
              style={({ pressed }) => [
                styles.filterButton,
                selected &&
                  styles.filterButtonSelected,
                pressed &&
                  styles.filterButtonPressed,
              ]}
            >
              <Ionicons
                name={filter.icon}
                size={15}
                color={
                  selected
                    ? COLORS.text
                    : COLORS.textSecondary
                }
              />

              <Text
                style={[
                  styles.filterButtonText,
                  selected &&
                    styles.filterButtonTextSelected,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function EngagementCard({
  inscription,
  competition,
  resultat,
}: {
  inscription:
    InscriptionActivite;
  competition: boolean;
  resultat?:
    ResultatCompetition;
}) {
  const formattedDate =
    formatDate(
      inscription.activiteDate
    );

  const formattedTime =
    formatTime(
      inscription.activiteHeure
    );

  const registrationStatus =
    getRegistrationStatus(
      inscription.statutInscription
    );

  const paymentStatus =
    getPaymentStatus(
      inscription.statutPaiement
    );

  return (
    <View style={styles.card}>
      <View
        style={styles.cardAccent}
      />

      <View style={styles.cardTopRow}>
        <View
          style={[
            styles.typeBadge,
            competition
              ? styles.competitionBadge
              : styles.activityBadge,
          ]}
        >
          <Ionicons
            name={
              competition
                ? "trophy-outline"
                : "flash-outline"
            }
            size={13}
            color={
              competition
                ? "#FFD166"
                : COLORS.red
            }
          />

          <Text
            style={[
              styles.typeBadgeText,
              competition
                ? styles.competitionBadgeText
                : styles.activityBadgeText,
            ]}
          >
            {competition
              ? "COMPÉTITION"
              : "ACTIVITÉ"}
          </Text>
        </View>

        <StatusBadge
          label={
            registrationStatus.label
          }
          variant={
            registrationStatus.variant
          }
        />
      </View>

      <Text
        style={styles.cardTitle}
        numberOfLines={2}
      >
        {inscription.activiteTitre ||
          "Activité sans titre"}
      </Text>

      {inscription.discipline ? (
        <Text
          style={styles.discipline}
        >
          {inscription.discipline}
        </Text>
      ) : null}

      <View
        style={styles.informationList}
      >
        <InformationRow
          icon="calendar-outline"
          label="Date"
          value={formattedDate}
        />

        {formattedTime ? (
          <InformationRow
            icon="time-outline"
            label="Heure"
            value={formattedTime}
          />
        ) : null}

        <InformationRow
          icon="location-outline"
          label="Lieu"
          value={
            inscription.activiteLieu ||
            "Lieu non communiqué"
          }
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.paymentRow}>
        <View>
          <Text
            style={styles.paymentLabel}
          >
            Paiement
          </Text>

          {inscription.modePaiement ? (
            <Text
              style={styles.paymentMode}
            >
              {formatPaymentMode(
                inscription.modePaiement
              )}
            </Text>
          ) : (
            <Text
              style={styles.paymentMode}
            >
              Mode non renseigné
            </Text>
          )}
        </View>

        <StatusBadge
          label={paymentStatus.label}
          variant={
            paymentStatus.variant
          }
        />
      </View>

      {competition && resultat ? (
        <CompetitionResultSection
          resultat={resultat}
        />
      ) : null}

      {inscription.commentaire ? (
        <View
          style={styles.commentBox}
        >
          <View
            style={
              styles.commentHeader
            }
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={15}
              color={
                COLORS.textSecondary
              }
            />

            <Text
              style={
                styles.commentLabel
              }
            >
              MON COMMENTAIRE
            </Text>
          </View>

          <Text
            style={styles.commentText}
          >
            {inscription.commentaire}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function CompetitionResultSection({
  resultat,
}: {
  resultat:
    ResultatCompetition;
}) {
  const medaille =
    getMedalLabel(
      resultat.medaille
    );

  return (
    <LinearGradient
      colors={[
        "rgba(229,9,20,0.12)",
        "rgba(229,9,20,0.035)",
      ]}
      style={styles.resultBox}
    >
      <View
        style={styles.resultHeader}
      >
        <View>
          <Text
            style={styles.resultLabel}
          >
            RÉSULTAT
          </Text>

          <Text
            style={styles.resultRank}
          >
            {formatRank(
              resultat.rang
            )}
            {resultat.nombreParticipants
              ? ` sur ${resultat.nombreParticipants}`
              : ""}
          </Text>
        </View>

        <View
          style={styles.medalBadge}
        >
          <Text
            style={styles.medalEmoji}
          >
            {medaille.emoji}
          </Text>

          <Text
            style={styles.medalText}
          >
            {medaille.label}
          </Text>
        </View>
      </View>

      {resultat.commentaireCoach ? (
        <View
          style={
            styles.coachCommentBox
          }
        >
          <Text
            style={
              styles.coachCommentLabel
            }
          >
            COMMENTAIRE DU COACH
          </Text>

          <Text
            style={
              styles.coachCommentText
            }
          >
            {
              resultat.commentaireCoach
            }
          </Text>
        </View>
      ) : null}
    </LinearGradient>
  );
}

function InformationRow({
  icon,
  label,
  value,
}: {
  icon:
    keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View
      style={styles.informationRow}
    >
      <View
        style={styles.symbolContainer}
      >
        <Ionicons
          name={icon}
          size={17}
          color={
            COLORS.textSecondary
          }
        />
      </View>

      <View
        style={styles.informationText}
      >
        <Text
          style={styles.informationLabel}
        >
          {label}
        </Text>

        <Text
          style={styles.informationValue}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: StatusVariant;
}) {
  return (
    <View
      style={[
        styles.statusBadge,
        styles[
          `statusBadge_${variant}`
        ],
      ]}
    >
      <Text
        style={[
          styles.statusBadgeText,
          styles[
            `statusBadgeText_${variant}`
          ],
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function ErrorBox({
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
        accessibilityLabel="Réessayer"
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

function EmptyState({
  hasError,
  selectedFilter,
}: {
  hasError: boolean;
  selectedFilter: FilterType;
}) {
  const title = hasError
    ? "Chargement impossible"
    : selectedFilter ===
        "TOUS"
      ? "Aucun engagement"
      : "Aucun résultat";

  const description = hasError
    ? "Actualisez la page ou réessayez dans quelques instants."
    : selectedFilter ===
        "TOUS"
      ? "Vos prochaines inscriptions apparaîtront ici."
      : "Aucune inscription ne correspond au filtre sélectionné.";

  return (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[
          "rgba(229,9,20,0.17)",
          "rgba(229,9,20,0.05)",
        ]}
        style={
          styles.emptyIconContainer
        }
      >
        <Ionicons
          name={
            hasError
              ? "cloud-offline-outline"
              : "calendar-clear-outline"
          }
          size={34}
          color={COLORS.red}
        />
      </LinearGradient>

      <Text style={styles.emptyTitle}>
        {title}
      </Text>

      <Text
        style={styles.emptyDescription}
      >
        {description}
      </Text>
    </View>
  );
}

function EngagementsLoading({
  isFocused,
}: {
  isFocused: boolean;
}) {
  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      {isFocused ? (
        <StatusBar
          style="light"
          animated
        />
      ) : null}

      <View
        style={styles.loadingContainer}
      >
        <LinearGradient
          colors={[
            COLORS.red,
            "#79080D",
          ]}
          style={styles.loadingLogo}
        >
          <Ionicons
            name="ribbon-outline"
            size={28}
            color={COLORS.text}
          />
        </LinearGradient>

        <ActivityIndicator
          size="small"
          color={COLORS.text}
        />

        <Text
          style={styles.loadingText}
        >
          Chargement de vos
          engagements…
        </Text>
      </View>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function normalizeValue(
  value?: string
): string {
  return (
    value
      ?.trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      ) ?? ""
  );
}

function parseDateValue(
  value?: string
): number {
  if (!value) {
    return 0;
  }

  const parsed =
    new Date(value).getTime();

  return Number.isNaN(parsed)
    ? 0
    : parsed;
}

function formatDate(
  value?: string
): string {
  if (!value) {
    return "Date non communiquée";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(date.getTime())
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

function formatShortDate(
  value?: string
): string {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
    }
  ).format(date);
}

function formatTime(
  value?: string
): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 5);
}

function formatPaymentMode(
  value?: string
): string {
  switch (
    normalizeValue(value)
  ) {
    case "ESPECES":
      return "Espèces";

    case "CARTE":
      return "Carte bancaire";

    case "VIREMENT":
      return "Virement";

    case "CHEQUE":
      return "Chèque";

    default:
      return (
        value ??
        "Mode non renseigné"
      );
  }
}

function getRegistrationStatus(
  value?: string
): StatusInfo {
  switch (
    normalizeValue(value)
  ) {
    case "CONFIRME":
    case "VALIDEE":
    case "VALIDE":
      return {
        label: "Confirmée",
        variant: "success",
      };

    case "REFUSE":
    case "ANNULEE":
    case "ANNULE":
      return {
        label: "Refusée",
        variant: "danger",
      };

    case "EN_ATTENTE":
    case "ATTENTE":
      return {
        label: "En attente",
        variant: "waiting",
      };

    default:
      return {
        label:
          value ||
          "Statut inconnu",
        variant: "neutral",
      };
  }
}

function getPaymentStatus(
  value?: string
): StatusInfo {
  switch (
    normalizeValue(value)
  ) {
    case "PAYE":
    case "REGLE":
      return {
        label: "Payé",
        variant: "success",
      };

    case "NON_PAYE":
    case "IMPAYE":
      return {
        label: "Non payé",
        variant: "danger",
      };

    case "EN_ATTENTE":
    case "ATTENTE":
      return {
        label: "En attente",
        variant: "waiting",
      };

    default:
      return {
        label:
          value ||
          "Non renseigné",
        variant: "neutral",
      };
  }
}

function formatRank(
  rank: number
): string {
  return rank === 1
    ? "1er"
    : `${rank}e`;
}

function getMedalLabel(
  medaille?: TypeMedaille
): {
  label: string;
  emoji: string;
} {
  switch (medaille) {
    case "OR":
      return {
        label: "Or",
        emoji: "🥇",
      };

    case "ARGENT":
      return {
        label: "Argent",
        emoji: "🥈",
      };

    case "BRONZE":
      return {
        label: "Bronze",
        emoji: "🥉",
      };

    default:
      return {
        label: "Participation",
        emoji: "🏅",
      };
  }
}

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  listContent: {
    paddingTop: 14,
    paddingHorizontal: 16,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  header: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
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

  headerTitle: {
    color: COLORS.text,
    fontSize: 17,
    letterSpacing: -0.25,
    fontFamily: "Inter_700Bold",
  },

  headerSpacer: {
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
    justifyContent:
      "space-between",
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

  heroBadgeText: {
    color:
      COLORS.textSecondary,
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
    maxWidth: 290,
    color: COLORS.text,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1.2,
    fontFamily: "Inter_700Bold",
  },

  heroSubtitle: {
    maxWidth: 305,
    marginTop: 13,
    color:
      COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontFamily:
      "Inter_400Regular",
  },

  heroFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent:
      "space-between",
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
    fontFamily:
      "Inter_600SemiBold",
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

  statisticsContainer: {
    flexDirection: "row",
    marginTop: 16,
  },

  statisticCard: {
    flex: 1,
    minHeight: 118,
    marginHorizontal: 4,
    padding: 13,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor:
      COLORS.borderSoft,
    borderRadius: 20,
  },

  statisticIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(229,9,20,0.10)",
    borderRadius: 11,
  },

  statisticValue: {
    marginTop: 13,
    color: COLORS.text,
    fontSize: 24,
    letterSpacing: -0.7,
    fontFamily: "Inter_700Bold",
  },

  statisticLabel: {
    marginTop: 3,
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily:
      "Inter_600SemiBold",
  },

  performanceSection: {
    marginTop: 24,
    padding: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor:
      COLORS.borderSoft,
    borderRadius: 25,
  },

  performanceHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent:
      "space-between",
  },

  performanceHeaderText: {
    flex: 1,
    paddingRight: 12,
  },

  performanceEyebrow: {
    color: COLORS.red,
    fontSize: 10,
    letterSpacing: 1.4,
    fontFamily: "Inter_700Bold",
  },

  performanceTitle: {
    marginTop: 6,
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.45,
    fontFamily: "Inter_700Bold",
  },

  performanceDescription: {
    marginTop: 7,
    color:
      COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    fontFamily:
      "Inter_400Regular",
  },

  bestRankBadge: {
    minWidth: 76,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 11,
    backgroundColor:
      "rgba(229,9,20,0.10)",
    borderWidth: 1,
    borderColor:
      "rgba(229,9,20,0.18)",
    borderRadius: 15,
  },

  bestRankLabel: {
    color: COLORS.red,
    fontSize: 8,
    letterSpacing: 0.8,
    fontFamily: "Inter_700Bold",
  },

  bestRankValue: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 19,
    fontFamily: "Inter_700Bold",
  },

  chartCard: {
    minHeight: 230,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    paddingTop: 14,
    paddingBottom: 6,
    overflow: "hidden",
    backgroundColor:
      COLORS.backgroundElevated,
    borderWidth: 1,
    borderColor:
      COLORS.borderSoft,
    borderRadius: 20,
  },

  chartAxisText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily:
      "Inter_400Regular",
  },

  chartEmptyState: {
    alignItems: "center",
    paddingHorizontal: 28,
  },

  chartEmptyIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(229,9,20,0.10)",
    borderRadius: 20,
  },

  chartEmptyTitle: {
    marginTop: 14,
    color: COLORS.text,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },

  chartEmptyDescription: {
    marginTop: 7,
    color:
      COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    fontFamily:
      "Inter_400Regular",
  },

  performanceCount: {
    marginTop: 12,
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: "right",
    fontFamily:
      "Inter_600SemiBold",
  },

  filterSection: {
    marginTop: 25,
  },

  filterHeader: {
    marginBottom: 12,
  },

  filterEyebrow: {
    color: COLORS.textMuted,
    fontSize: 10,
    letterSpacing: 1.4,
    fontFamily: "Inter_700Bold",
  },

  filterTitle: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },

  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  filterButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor:
      COLORS.borderSoft,
    borderRadius: 14,
  },

  filterButtonSelected: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },

  filterButtonPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  filterButtonText: {
    marginLeft: 7,
    color:
      COLORS.textSecondary,
    fontSize: 12,
    fontFamily:
      "Inter_600SemiBold",
  },

  filterButtonTextSelected: {
    color: COLORS.text,
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
    fontFamily:
      "Inter_400Regular",
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

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent:
      "space-between",
    marginTop: 28,
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
    color:
      COLORS.textSecondary,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },

  card: {
    position: "relative",
    overflow: "hidden",
    marginBottom: 14,
    padding: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor:
      COLORS.borderSoft,
    borderRadius: 25,
    shadowColor: COLORS.black,
    shadowOpacity: 0.17,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 9,
    },
    elevation: 4,
  },

  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 72,
    height: 3,
    backgroundColor: COLORS.red,
    borderBottomRightRadius: 999,
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  typeBadge: {
    minHeight: 31,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  activityBadge: {
    backgroundColor:
      "rgba(229,9,20,0.10)",
  },

  competitionBadge: {
    backgroundColor:
      "rgba(255,209,102,0.10)",
  },

  typeBadgeText: {
    marginLeft: 6,
    fontSize: 9,
    letterSpacing: 0.8,
    fontFamily: "Inter_700Bold",
  },

  activityBadgeText: {
    color: COLORS.red,
  },

  competitionBadgeText: {
    color: "#FFD166",
  },

  cardTitle: {
    marginTop: 17,
    color: COLORS.text,
    fontSize: 21,
    lineHeight: 27,
    letterSpacing: -0.45,
    fontFamily: "Inter_700Bold",
  },

  discipline: {
    marginTop: 5,
    color:
      COLORS.textSecondary,
    fontSize: 12,
    fontFamily:
      "Inter_600SemiBold",
  },

  informationList: {
    marginTop: 18,
  },

  informationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  symbolContainer: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
    backgroundColor:
      COLORS.cardLight,
    borderRadius: 13,
  },

  informationText: {
    flex: 1,
  },

  informationLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 0.8,
    fontFamily: "Inter_700Bold",
  },

  informationValue: {
    marginTop: 3,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
    fontFamily:
      "Inter_600SemiBold",
  },

  divider: {
    height: 1,
    marginVertical: 16,
    backgroundColor:
      COLORS.borderSoft,
  },

  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  paymentLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },

  paymentMode: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily:
      "Inter_400Regular",
  },

  statusBadge: {
    minHeight: 29,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 999,
  },

  statusBadgeText: {
    fontSize: 9,
    letterSpacing: 0.55,
    fontFamily: "Inter_700Bold",
  },

  statusBadge_waiting: {
    backgroundColor:
      "rgba(245,185,66,0.12)",
  },

  statusBadge_success: {
    backgroundColor:
      "rgba(61,220,132,0.12)",
  },

  statusBadge_danger: {
    backgroundColor:
      "rgba(229,9,20,0.12)",
  },

  statusBadge_neutral: {
    backgroundColor:
      COLORS.cardLight,
  },

  statusBadgeText_waiting: {
    color: COLORS.amber,
  },

  statusBadgeText_success: {
    color: COLORS.green,
  },

  statusBadgeText_danger: {
    color: COLORS.red,
  },

  statusBadgeText_neutral: {
    color:
      COLORS.textSecondary,
  },

  resultBox: {
    marginTop: 18,
    padding: 15,
    borderWidth: 1,
    borderColor:
      "rgba(229,9,20,0.16)",
    borderRadius: 18,
  },

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  resultLabel: {
    color: COLORS.red,
    fontSize: 9,
    letterSpacing: 1.1,
    fontFamily: "Inter_700Bold",
  },

  resultRank: {
    marginTop: 5,
    color: COLORS.text,
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },

  medalBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 11,
    backgroundColor:
      "rgba(255,255,255,0.06)",
    borderRadius: 12,
  },

  medalEmoji: {
    fontSize: 18,
  },

  medalText: {
    marginLeft: 7,
    color: COLORS.text,
    fontSize: 11,
    fontFamily:
      "Inter_600SemiBold",
  },

  coachCommentBox: {
    marginTop: 13,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor:
      "rgba(255,255,255,0.07)",
  },

  coachCommentLabel: {
    color:
      COLORS.textSecondary,
    fontSize: 9,
    letterSpacing: 0.8,
    fontFamily: "Inter_700Bold",
  },

  coachCommentText: {
    marginTop: 6,
    color: "#D8D8D8",
    fontSize: 12,
    lineHeight: 18,
    fontFamily:
      "Inter_400Regular",
  },

  commentBox: {
    marginTop: 16,
    padding: 14,
    backgroundColor:
      COLORS.backgroundElevated,
    borderWidth: 1,
    borderColor:
      COLORS.borderSoft,
    borderRadius: 16,
  },

  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  commentLabel: {
    marginLeft: 7,
    color:
      COLORS.textSecondary,
    fontSize: 9,
    letterSpacing: 0.8,
    fontFamily: "Inter_700Bold",
  },

  commentText: {
    marginTop: 8,
    color: "#D8D8D8",
    fontSize: 12,
    lineHeight: 18,
    fontFamily:
      "Inter_400Regular",
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 24,
    paddingHorizontal: 30,
    paddingVertical: 42,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor:
      COLORS.borderSoft,
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
    color:
      COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    fontFamily:
      "Inter_400Regular",
  },

  loadingContainer: {
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
    color:
      COLORS.textSecondary,
    fontSize: 12,
    textAlign: "center",
    fontFamily:
      "Inter_600SemiBold",
  },
});