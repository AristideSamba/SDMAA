import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  RouteProp,
  useNavigation,
  useRoute,
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

import {
  StatusBar,
} from "expo-status-bar";

import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import api from "../services/api";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type ActiviteDetailsStackParamList = {
  ActiviteDetails: {
    activiteId: number;
  };
};

type ActiviteDetailsRouteProp =
  RouteProp<
    ActiviteDetailsStackParamList,
    "ActiviteDetails"
  >;

type ActiviteDetailsNavigationProp =
  NativeStackNavigationProp<
    ActiviteDetailsStackParamList,
    "ActiviteDetails"
  >;

interface Activite {
  id?: number;
  idActivite?: number;

  titre?: string;
  description?: string;

  date?: string;
  dateActivite?: string;

  heure?: string;
  heureDebut?: string;
  heureFin?: string;

  lieu?: string;
  adresse?: string;

  duree?: string;
  dureeActivite?: string;

  prix?: number | string;

  typeActivite?: string;
  categorie?: string;
  discipline?: string;

  image?: string;
  imageActivite?: string;
  imageUrl?: string;
  nomImage?: string;

  lien?: string;
  lienExterne?: string;

  statut?: string;
  statutActivite?: string;

  nombrePlaces?: number;
  placesDisponibles?: number;
  capaciteMax?: number;

  inscriptionOuverte?: boolean;
  inscriptionsOuvertes?: boolean;

  externe?: boolean;
  interne?: boolean;
}

interface InscriptionActivite {
  id?: number;
  statutInscription?: string;
  statutPaiement?: string;
  activiteId?: number;
  activite?: {
    id?: number;
  };
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
  green: "#1DB954",
  amber: "#F3B544",
  black: "#080808",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=1200&q=80";

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function ActiviteDetailsScreen() {
  const route = useRoute<ActiviteDetailsRouteProp>();
  const navigation =
    useNavigation<ActiviteDetailsNavigationProp>();

  const insets = useSafeAreaInsets();

  const rawActiviteId =
    route.params?.activiteId;

  const activiteId =
    Number(rawActiviteId);

  const [
    activite,
    setActivite,
  ] = useState<Activite | null>(null);

  const [
    inscriptions,
    setInscriptions,
  ] = useState<InscriptionActivite[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const fetchData =
    useCallback(async (): Promise<void> => {
      if (
        !Number.isInteger(activiteId) ||
        activiteId <= 0
      ) {
        console.error(
          "Identifiant d’activité invalide :",
          {
            rawActiviteId,
            activiteId,
            routeParams:
              route.params,
          }
        );

        setActivite(null);
        setInscriptions([]);
        setError(
          "L’identifiant de l’activité est invalide."
        );
        setLoading(false);
        setRefreshing(false);

        return;
      }

      setError("");

      /*
       * Les deux requêtes sont volontairement séparées.
       * Ainsi, une erreur sur les inscriptions ne bloque
       * pas l’affichage des détails de l’activité.
       */
      try {
        console.log(
          "Chargement de l’activité :",
          {
            activiteId,
            url:
              `/activites/${activiteId}`,
            baseURL:
              api.defaults.baseURL,
          }
        );

        const activiteResponse =
          await api.get<Activite>(
            `/activites/${activiteId}`
          );

        setActivite(
          activiteResponse.data
        );
      } catch (
        requestError: any
      ) {
        console.error(
          "Échec du chargement de l’activité :",
          {
            message:
              requestError?.message,
            status:
              requestError?.response
                ?.status,
            data:
              requestError?.response
                ?.data,
            url:
              requestError?.config
                ?.url,
            baseURL:
              requestError?.config
                ?.baseURL,
            params:
              requestError?.config
                ?.params,
            activiteId,
          }
        );

        setActivite(null);

        const backendMessage =
          typeof requestError?.response
            ?.data === "string"
            ? requestError.response.data
            : requestError?.response
                ?.data?.message ||
              requestError?.response
                ?.data?.error;

        setError(
          backendMessage ||
            "Impossible de charger cette activité pour le moment."
        );

        setLoading(false);
        setRefreshing(false);

        return;
      }

      try {
        console.log(
          "Chargement des inscriptions :",
          {
            url:
              "/inscriptions-activites/me",
            baseURL:
              api.defaults.baseURL,
          }
        );

        const inscriptionsResponse =
          await api.get<
            InscriptionActivite[]
          >(
            "/inscriptions-activites/me"
          );

        setInscriptions(
          Array.isArray(
            inscriptionsResponse.data
          )
            ? inscriptionsResponse.data
            : []
        );
      } catch (
        requestError: any
      ) {
        console.warn(
          "Impossible de charger les inscriptions de l’utilisateur :",
          {
            message:
              requestError?.message,
            status:
              requestError?.response
                ?.status,
            data:
              requestError?.response
                ?.data,
            url:
              requestError?.config
                ?.url,
            baseURL:
              requestError?.config
                ?.baseURL,
          }
        );

        /*
         * Les détails restent affichés même si cette
         * requête échoue.
         */
        setInscriptions([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [
      activiteId,
      rawActiviteId,
      route.params,
    ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh =
    useCallback((): void => {
      setRefreshing(true);
      fetchData();
    }, [fetchData]);

  const alreadyRegistered =
    useMemo(() => {
      return inscriptions.some(
        (inscription) => {
          const linkedActivityId =
            inscription.activiteId ??
            inscription.activite?.id;

          return (
            Number(linkedActivityId) ===
              activiteId &&
            ![
              "REFUSEE",
              "REFUSE",
              "ANNULEE",
              "ANNULE",
            ].includes(
              normalizeStatus(
                inscription.statutInscription
              )
            )
          );
        }
      );
    }, [activiteId, inscriptions]);

  const presentation =
    useMemo(() => {
      return getActivityPresentation(
        activite,
        alreadyRegistered
      );
    }, [activite, alreadyRegistered]);

  const handleRegistration =
    useCallback(async (): Promise<void> => {
      if (!activite) {
        return;
      }

      if (presentation.isExternal) {
        const externalUrl =
          activite.lienExterne ??
          activite.lien;

        if (!externalUrl) {
          Alert.alert(
            "Lien indisponible",
            "Le lien d’inscription externe n’est pas encore disponible."
          );
          return;
        }

        try {
          const canOpen =
            await Linking.canOpenURL(
              externalUrl
            );

          if (!canOpen) {
            throw new Error(
              "URL non prise en charge"
            );
          }

          await Linking.openURL(
            externalUrl
          );
        } catch (linkError) {
          console.error(
            "Impossible d’ouvrir le lien :",
            linkError
          );

          Alert.alert(
            "Lien invalide",
            "Impossible d’ouvrir le lien d’inscription."
          );
        }

        return;
      }

      if (!presentation.canRegister) {
        return;
      }

      Alert.alert(
        "Confirmer l’inscription",
        `Souhaitez-vous vous inscrire à « ${presentation.title} » ?`,
        [
          {
            text: "Annuler",
            style: "cancel",
          },
          {
            text: "S’inscrire",
            onPress: async () => {
              try {
                setSubmitting(true);

                await api.post(
                  "/inscriptions-activites/me",
                  null,
                  {
                    params: {
                      idActivite: activiteId,
                    },
                  }
                );

                Alert.alert(
                  "Demande envoyée",
                  "Votre demande d’inscription a bien été transmise."
                );

                await fetchData();
              } catch (requestError: any) {
                console.error(
                  "Erreur d’inscription :",
                  requestError
                );

                const message =
                  requestError?.response
                    ?.data?.message ||
                  requestError?.response
                    ?.data?.error ||
                  "Impossible de vous inscrire à cette activité.";

                Alert.alert(
                  "Inscription impossible",
                  message
                );
              } finally {
                setSubmitting(false);
              }
            },
          },
        ]
      );
    }, [
      activite,
      activiteId,
      fetchData,
      presentation,
    ]);

  if (loading) {
    return <DetailsLoading />;
  }

  if (error || !activite) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom"]}
      >
        <StatusBar style="light" />

        <View style={styles.errorScreen}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={32}
              color={COLORS.red}
            />
          </View>

          <Text style={styles.errorTitle}>
            Activité indisponible
          </Text>

          <Text style={styles.errorText}>
            {error ||
              "Cette activité n’existe pas ou n’est plus disponible."}
          </Text>

          <Pressable
            onPress={fetchData}
            style={styles.retryButton}
          >
            <Ionicons
              name="refresh"
              size={18}
              color={COLORS.text}
            />

            <Text style={styles.retryText}>
              Réessayer
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              navigation.goBack()
            }
            style={styles.backTextButton}
          >
            <Text style={styles.backText}>
              Retour
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <StatusBar style="light" />

      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.text}
              colors={[COLORS.red]}
              progressBackgroundColor={
                COLORS.card
              }
            />
          }
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                insets.bottom + 130,
            },
          ]}
        >
          <Animated.View
            entering={FadeInUp.duration(450)}
          >
            <ActivityHero
              imageUrl={
                buildActivityImageUrl(
                  activite
                )
              }
              onBack={() =>
                navigation.goBack()
              }
              typeLabel={
                presentation.typeLabel
              }
              statusLabel={
                presentation.statusLabel
              }
              statusColor={
                presentation.statusColor
              }
            />
          </Animated.View>

          <View style={styles.content}>
            <Animated.View
              entering={FadeInDown
                .duration(450)
                .delay(60)}
            >
              <Text style={styles.eyebrow}>
                {presentation.categoryLabel}
              </Text>

              <Text style={styles.title}>
                {presentation.title}
              </Text>

              <Text style={styles.description}>
                {presentation.description}
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInDown
                .duration(450)
                .delay(120)}
              style={styles.infoCard}
            >
              <InformationRow
                icon="calendar-outline"
                label="Date"
                value={
                  presentation.dateLabel
                }
              />

              <InformationDivider />

              <InformationRow
                icon="time-outline"
                label="Horaire"
                value={
                  presentation.timeLabel
                }
              />

              <InformationDivider />

              <InformationRow
                icon="location-outline"
                label="Lieu"
                value={
                  presentation.locationLabel
                }
              />

              <InformationDivider />

              <InformationRow
                icon="hourglass-outline"
                label="Durée"
                value={
                  presentation.durationLabel
                }
              />

              <InformationDivider />

              <InformationRow
                icon="wallet-outline"
                label="Tarif"
                value={
                  presentation.priceLabel
                }
              />
            </Animated.View>

            <Animated.View
              entering={FadeInDown
                .duration(450)
                .delay(180)}
            >
              <Text style={styles.sectionTitle}>
                Informations complémentaires
              </Text>

              <View style={styles.tagsRow}>
                <Tag
                  icon="fitness-outline"
                  label={
                    presentation.disciplineLabel
                  }
                />

                <Tag
                  icon="people-outline"
                  label={
                    presentation.registrationLabel
                  }
                />
              </View>
            </Animated.View>

            {presentation.registrationMessage ? (
              <Animated.View
                entering={FadeInDown
                  .duration(450)
                  .delay(240)}
                style={[
                  styles.noticeCard,
                  presentation.noticeType ===
                    "success" &&
                    styles.noticeCardSuccess,
                  presentation.noticeType ===
                    "warning" &&
                    styles.noticeCardWarning,
                ]}
              >
                <Ionicons
                  name={
                    presentation.noticeType ===
                    "success"
                      ? "checkmark-circle-outline"
                      : "information-circle-outline"
                  }
                  size={22}
                  color={
                    presentation.noticeType ===
                    "success"
                      ? COLORS.green
                      : COLORS.amber
                  }
                />

                <Text style={styles.noticeText}>
                  {
                    presentation.registrationMessage
                  }
                </Text>
              </Animated.View>
            ) : null}
          </View>
        </ScrollView>

        <View
          style={[
            styles.bottomBar,
            {
              paddingBottom:
                Math.max(insets.bottom, 14),
            },
          ]}
        >
          <RegistrationButton
            disabled={
              !presentation.canRegister ||
              submitting
            }
            loading={submitting}
            label={
              presentation.buttonLabel
            }
            icon={
              presentation.isExternal
                ? "open-outline"
                : alreadyRegistered
                  ? "checkmark-circle-outline"
                  : "add-circle-outline"
            }
            onPress={handleRegistration}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/*                                SUBCOMPONENTS                               */
/* -------------------------------------------------------------------------- */

interface ActivityHeroProps {
  imageUrl: string;
  onBack: () => void;
  typeLabel: string;
  statusLabel: string;
  statusColor: string;
}

function ActivityHero({
  imageUrl,
  onBack,
  typeLabel,
  statusLabel,
  statusColor,
}: ActivityHeroProps) {
  return (
    <View style={styles.hero}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.heroImage}
        resizeMode="cover"
      />

      <LinearGradient
        colors={[
          "rgba(0,0,0,0.12)",
          "rgba(0,0,0,0.55)",
          COLORS.background,
        ]}
        locations={[0, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Revenir en arrière"
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <Ionicons
          name="arrow-back"
          size={22}
          color={COLORS.text}
        />
      </Pressable>

      <View style={styles.heroBadges}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {typeLabel}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              borderColor: statusColor,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  statusColor,
              },
            ]}
          />

          <Text style={styles.statusBadgeText}>
            {statusLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

interface InformationRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function InformationRow({
  icon,
  label,
  value,
}: InformationRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={19}
          color={COLORS.text}
        />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function InformationDivider() {
  return (
    <View style={styles.infoDivider} />
  );
}

interface TagProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

function Tag({
  icon,
  label,
}: TagProps) {
  return (
    <View style={styles.tag}>
      <Ionicons
        name={icon}
        size={15}
        color={COLORS.textSecondary}
      />

      <Text style={styles.tagText}>
        {label}
      </Text>
    </View>
  );
}

interface RegistrationButtonProps {
  disabled: boolean;
  loading: boolean;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

function RegistrationButton({
  disabled,
  loading,
  label,
  icon,
  onPress,
}: RegistrationButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale: scale.value,
        },
      ],
    }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => {
          scale.value =
            withSpring(0.98);
        }}
        onPressOut={() => {
          scale.value =
            withSpring(1);
        }}
        style={[
          styles.registrationButton,
          disabled &&
            styles.registrationButtonDisabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={COLORS.text}
          />
        ) : (
          <>
            <Ionicons
              name={icon}
              size={21}
              color={
                disabled
                  ? COLORS.textMuted
                  : COLORS.text
              }
            />

            <Text
              style={[
                styles.registrationButtonText,
                disabled &&
                  styles.registrationButtonTextDisabled,
              ]}
            >
              {label}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

function DetailsLoading() {
  return (
    <SafeAreaView
      style={styles.loadingScreen}
      edges={["top", "bottom"]}
    >
      <StatusBar style="light" />

      <View style={styles.loadingContent}>
        <View style={styles.loadingLogo}>
          <LinearGradient
            colors={[
              COLORS.red,
              "#78080D",
            ]}
            style={
              styles.loadingLogoGradient
            }
          >
            <Ionicons
              name="calendar"
              size={28}
              color={COLORS.text}
            />
          </LinearGradient>
        </View>

        <ActivityIndicator
          size="small"
          color={COLORS.text}
        />

        <Text style={styles.loadingText}>
          Chargement de l’activité…
        </Text>
      </View>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

function getActivityPresentation(
  activite: Activite | null,
  alreadyRegistered: boolean
) {
  const title =
    firstNonEmptyString(
      activite?.titre
    ) ?? "Activité SDMAA";

  const description =
    firstNonEmptyString(
      activite?.description
    ) ??
    "Toutes les informations importantes concernant cette activité seront affichées ici.";

  const typeLabel =
    firstNonEmptyString(
      activite?.typeActivite,
      activite?.categorie
    ) ?? "Activité";

  const categoryLabel =
    firstNonEmptyString(
      activite?.categorie,
      activite?.typeActivite
    ) ?? "SDMAA";

  const disciplineLabel =
    firstNonEmptyString(
      activite?.discipline
    ) ?? "Taekwondo";

  const dateValue =
    activite?.date ??
    activite?.dateActivite;

  const date = dateValue
    ? new Date(dateValue)
    : null;

  const isPast =
    date !== null &&
    !Number.isNaN(date.getTime()) &&
    date.getTime() <
      startOfToday().getTime();

  const normalizedStatus =
    normalizeStatus(
      activite?.statut ??
      activite?.statutActivite
    );

  const explicitlyClosed = [
    "TERMINE",
    "TERMINEE",
    "ANNULE",
    "ANNULEE",
    "FERME",
    "FERMEE",
    "COMPLET",
    "COMPLETE",
  ].includes(normalizedStatus);

  const externalUrl =
    activite?.lienExterne ??
    activite?.lien;

  const isExternal =
    Boolean(externalUrl) ||
    activite?.externe === true;

  const registrationExplicitlyClosed =
    activite?.inscriptionOuverte === false ||
    activite?.inscriptionsOuvertes === false;

  const remainingPlaces =
    activite?.placesDisponibles;

  const noPlaces =
    typeof remainingPlaces === "number" &&
    remainingPlaces <= 0;

  const canRegister =
    !alreadyRegistered &&
    !isPast &&
    !explicitlyClosed &&
    !registrationExplicitlyClosed &&
    !noPlaces &&
    (
      isExternal
        ? Boolean(externalUrl)
        : true
    );

  let statusLabel = "À venir";
  let statusColor = COLORS.green;

  if (isPast || explicitlyClosed) {
    statusLabel = "Terminée";
    statusColor = COLORS.textMuted;
  } else if (noPlaces) {
    statusLabel = "Complète";
    statusColor = COLORS.amber;
  }

  let buttonLabel = isExternal
    ? "S’inscrire sur le site externe"
    : "S’inscrire à l’activité";

  let registrationMessage = "";
  let noticeType:
    | "success"
    | "warning"
    | undefined;

  if (alreadyRegistered) {
    buttonLabel = "Déjà inscrit";
    registrationMessage =
      "Vous êtes déjà inscrit à cette activité.";
    noticeType = "success";
  } else if (isPast || explicitlyClosed) {
    buttonLabel = "Inscriptions fermées";
    registrationMessage =
      "Cette activité est terminée ou les inscriptions sont fermées.";
    noticeType = "warning";
  } else if (registrationExplicitlyClosed) {
    buttonLabel = "Inscriptions fermées";
    registrationMessage =
      "Les inscriptions ne sont pas ouvertes pour cette activité.";
    noticeType = "warning";
  } else if (noPlaces) {
    buttonLabel = "Activité complète";
    registrationMessage =
      "Il n’y a plus de place disponible pour cette activité.";
    noticeType = "warning";
  }

  const registrationLabel =
    typeof remainingPlaces === "number"
      ? `${Math.max(
          remainingPlaces,
          0
        )} place${
          remainingPlaces > 1 ? "s" : ""
        } disponible${
          remainingPlaces > 1 ? "s" : ""
        }`
      : isExternal
        ? "Inscription externe"
        : "Inscription interne";

  return {
    title,
    description,
    typeLabel,
    categoryLabel,
    disciplineLabel,
    dateLabel: formatDate(dateValue),
    timeLabel: formatTimeRange(
      activite?.heureDebut ??
        activite?.heure,
      activite?.heureFin
    ),
    locationLabel:
      firstNonEmptyString(
        activite?.lieu,
        activite?.adresse
      ) ?? "Lieu à confirmer",
    durationLabel:
      firstNonEmptyString(
        activite?.dureeActivite,
        activite?.duree
      ) ??
      formatDuration(
        activite?.heureDebut ??
          activite?.heure,
        activite?.heureFin
      ),
    priceLabel: formatPrice(
      activite?.prix
    ),
    registrationLabel,
    statusLabel,
    statusColor,
    buttonLabel,
    canRegister,
    isExternal,
    registrationMessage,
    noticeType,
  };
}

function firstNonEmptyString(
  ...values: Array<
    string | undefined | null
  >
): string | undefined {
  return values.find(
    (value) =>
      typeof value === "string" &&
      value.trim().length > 0
  )?.trim();
}

function normalizeStatus(
  value?: string
): string {
  return (value ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );
}

function startOfToday(): Date {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date;
}

function formatDate(
  value?: string
): string {
  if (!value) {
    return "Date à confirmer";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

function formatTime(
  value?: string
): string {
  if (!value) {
    return "";
  }

  const match =
    value.trim().match(
      /^(\d{1,2}):(\d{2})/
    );

  if (!match) {
    return value;
  }

  return `${match[1].padStart(
    2,
    "0"
  )}:${match[2]}`;
}

function formatTimeRange(
  start?: string,
  end?: string
): string {
  const startTime = formatTime(start);
  const endTime = formatTime(end);

  if (startTime && endTime) {
    return `${startTime} — ${endTime}`;
  }

  return (
    startTime ||
    endTime ||
    "Horaire à confirmer"
  );
}

function formatDuration(
  start?: string,
  end?: string
): string {
  const startTime = formatTime(start);
  const endTime = formatTime(end);

  if (!startTime || !endTime) {
    return "Durée à confirmer";
  }

  const [
    startHour,
    startMinute,
  ] = startTime
    .split(":")
    .map(Number);

  const [
    endHour,
    endMinute,
  ] = endTime
    .split(":")
    .map(Number);

  const duration =
    endHour * 60 +
    endMinute -
    (
      startHour * 60 +
      startMinute
    );

  if (
    Number.isNaN(duration) ||
    duration <= 0
  ) {
    return "Durée à confirmer";
  }

  const hours =
    Math.floor(duration / 60);

  const minutes =
    duration % 60;

  if (hours && minutes) {
    return `${hours} h ${minutes}`;
  }

  if (hours) {
    return `${hours} h`;
  }

  return `${minutes} min`;
}

function formatPrice(
  value?: number | string
): string {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "Gratuit";
  }

  const numericValue =
    typeof value === "number"
      ? value
      : Number(
          value
            .replace(",", ".")
            .replace(/[^\d.-]/g, "")
        );

  if (
    Number.isNaN(numericValue) ||
    numericValue <= 0
  ) {
    return "Gratuit";
  }

  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
    }
  ).format(numericValue);
}

function buildActivityImageUrl(
  activite: Activite
): string {
  const rawImage =
    activite.imageUrl ??
    activite.imageActivite ??
    activite.image ??
    activite.nomImage;

  if (!rawImage) {
    return FALLBACK_IMAGE;
  }

  if (
    rawImage.startsWith("http://") ||
    rawImage.startsWith("https://")
  ) {
    return rawImage;
  }

  const baseUrl =
    String(
      api.defaults.baseURL ?? ""
    )
      .replace(/\/api\/?$/, "")
      .replace(/\/$/, "");

  const normalizedPath =
    rawImage.startsWith("/")
      ? rawImage
      : `/uploads/activite/${rawImage}`;

  return `${baseUrl}${normalizedPath}`;
}

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    backgroundColor: COLORS.background,
  },

  hero: {
    height: 340,
    overflow: "hidden",
    backgroundColor: COLORS.card,
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(0,0,0,0.48)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.13)",
    borderRadius: 16,
  },

  heroBadges: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  typeBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor:
      "rgba(229,9,20,0.90)",
    borderRadius: 999,
  },

  typeBadgeText: {
    color: COLORS.text,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: "Inter_700Bold",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 11,
    backgroundColor:
      "rgba(0,0,0,0.50)",
    borderWidth: 1,
    borderRadius: 999,
  },

  statusDot: {
    width: 6,
    height: 6,
    marginRight: 7,
    borderRadius: 3,
  },

  statusBadgeText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },

  content: {
    paddingHorizontal: 16,
  },

  eyebrow: {
    marginTop: 6,
    color: COLORS.red,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: "Inter_700Bold",
  },

  title: {
    marginTop: 9,
    color: COLORS.text,
    fontSize: 31,
    lineHeight: 36,
    letterSpacing: -0.9,
    fontFamily: "Inter_700Bold",
  },

  description: {
    marginTop: 14,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },

  infoCard: {
    marginTop: 24,
    paddingHorizontal: 17,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 25,
  },

  infoRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
    backgroundColor: COLORS.cardLight,
    borderRadius: 14,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 1.05,
    textTransform: "uppercase",
    fontFamily: "Inter_700Bold",
  },

  infoValue: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 19,
    fontFamily: "Inter_600SemiBold",
  },

  infoDivider: {
    height: 1,
    marginLeft: 53,
    backgroundColor: COLORS.borderSoft,
  },

  sectionTitle: {
    marginTop: 27,
    color: COLORS.text,
    fontSize: 19,
    letterSpacing: -0.4,
    fontFamily: "Inter_700Bold",
  },

  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 13,
  },

  tag: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 9,
    marginBottom: 9,
    paddingVertical: 10,
    paddingHorizontal: 13,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 15,
  },

  tagText: {
    marginLeft: 7,
    color: COLORS.textSecondary,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },

  noticeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 17,
    padding: 16,
    backgroundColor:
      "rgba(243,181,68,0.08)",
    borderWidth: 1,
    borderColor:
      "rgba(243,181,68,0.22)",
    borderRadius: 18,
  },

  noticeCardSuccess: {
    backgroundColor:
      "rgba(29,185,84,0.08)",
    borderColor:
      "rgba(29,185,84,0.22)",
  },

  noticeCardWarning: {
    backgroundColor:
      "rgba(243,181,68,0.08)",
    borderColor:
      "rgba(243,181,68,0.22)",
  },

  noticeText: {
    flex: 1,
    marginLeft: 11,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Inter_500Medium",
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    paddingHorizontal: 16,
    backgroundColor:
      "rgba(18,18,18,0.97)",
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
  },

  registrationButton: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.red,
    borderRadius: 18,
  },

  registrationButtonDisabled: {
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  registrationButtonText: {
    marginLeft: 9,
    color: COLORS.text,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },

  registrationButtonTextDisabled: {
    color: COLORS.textMuted,
  },

  buttonPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loadingContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingLogo: {
    width: 72,
    height: 72,
    marginBottom: 22,
    overflow: "hidden",
    borderRadius: 24,
  },

  loadingLogoGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 14,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  errorScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  errorIcon: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(229,9,20,0.10)",
    borderRadius: 21,
  },

  errorTitle: {
    marginTop: 18,
    color: COLORS.text,
    fontSize: 21,
    fontFamily: "Inter_700Bold",
  },

  errorText: {
    maxWidth: 290,
    marginTop: 9,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },

  retryButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    paddingHorizontal: 18,
    backgroundColor: COLORS.red,
    borderRadius: 15,
  },

  retryText: {
    marginLeft: 8,
    color: COLORS.text,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },

  backTextButton: {
    marginTop: 16,
    padding: 10,
  },

  backText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});