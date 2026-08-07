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
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useIsFocused,
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

import {
  StatusBar,
} from "expo-status-bar";

import Animated, {
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import type {
  RootStackParamList,
} from "../navigation/RootNavigator";

import {
  useAuth,
} from "../context/AuthContext";

import api from "../services/api";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

interface ProfilUtilisateur {
  id?: number;
  nom?: string;
  prenom?: string;
  nomComplet?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  dateNaissance?: string;
  role?: string;
  statutCompte?: string;
  ceintureNom?: string;
  ceintureCouleur?: string;
  photoUrl?: string;
  imageUrl?: string;
  avatarUrl?: string;
}

interface Abonnement {
  id?: number;
  titre?: string;
  nom?: string;
  trancheAge?: string;
  prixAnnuel?: number;
  prixMensuel?: number;
}

interface Adhesion {
  id?: number;
  statut?: string;
  dateDemande?: string;
  dateValidation?: string;
  dateExpiration?: string;
  abonnement?: Abonnement;
  abonnementTitre?: string;
  titreAbonnement?: string;
}

interface InscriptionActivite {
  id?: number;
  statutInscription?: string;
  typeActivite?: string;
  activite?: {
    typeActivite?: string;
    categorie?: string;
  };
  activiteType?: string;
  categorie?: string;
  classement?: number | string;
  medaille?: string | boolean;
  resultat?: string;
}

interface StatistiquesProfil {
  activites: number;
  competitions: number;
  medailles: number;
}

interface MembershipPresentation {
  title: string;
  statusLabel: string;
  isActive: boolean;
  dateLabel: string;
  priceLabel?: string;
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

const DEFAULT_STATISTICS: StatistiquesProfil = {
  activites: 0,
  competitions: 0,
  medailles: 0,
};

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function ProfilScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  const {
    logout,
  } = useAuth();

  const isFocused = useIsFocused();

  const [
    profil,
    setProfil,
  ] = useState<ProfilUtilisateur | null>(null);

  const [
    adhesion,
    setAdhesion,
  ] = useState<Adhesion | null>(null);

  const [
    statistiques,
    setStatistiques,
  ] = useState<StatistiquesProfil>(
    DEFAULT_STATISTICS
  );

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

  const fetchProfileData =
    useCallback(async (): Promise<void> => {
      try {
        setError("");

        /*
         * Le profil est indispensable.
         * Les adhésions et inscriptions restent optionnelles :
         * l'écran continue de fonctionner si ces endpoints
         * ne renvoient encore aucune donnée.
         */
        const [
          profileResult,
          adhesionResult,
          registrationsResult,
        ] = await Promise.allSettled([
          api.get<ProfilUtilisateur>(
            "/utilisateurs/me"
          ),
          api.get<Adhesion[] | Adhesion>(
            "/adhesions/me"
          ),
          api.get<InscriptionActivite[]>(
            "/inscriptions-activites/me"
          ),
        ]);

        if (
          profileResult.status ===
          "rejected"
        ) {
          throw profileResult.reason;
        }

        const profileData =
          profileResult.value.data;

        setProfil(profileData);

        if (
          adhesionResult.status ===
          "fulfilled"
        ) {
          setAdhesion(
            selectCurrentAdhesion(
              adhesionResult.value.data
            )
          );
        } else {
          setAdhesion(null);
        }

        if (
          registrationsResult.status ===
          "fulfilled"
        ) {
          setStatistiques(
            buildStatistics(
              registrationsResult.value.data
            )
          );
        } else {
          setStatistiques(
            DEFAULT_STATISTICS
          );
        }
      } catch (requestError) {
        console.error(
          "Erreur pendant le chargement du profil :",
          requestError
        );

        setError(
          "Impossible de charger les informations du profil."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);

  useEffect(() => {
  if (isFocused) {
    fetchProfileData();
  }
}, [isFocused, fetchProfileData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfileData();
  }, [fetchProfileData]);

  const displayName = useMemo(() => {
    if (profil?.nomComplet?.trim()) {
      return profil.nomComplet.trim();
    }

    const fullName = [
      profil?.prenom,
      profil?.nom,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return fullName || "Membre SDMAA";
  }, [profil]);

  const initials = useMemo(() => {
    return displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("");
  }, [displayName]);

  const avatarUrl = resolveImageUrl(
  profil?.photoUrl ||
  profil?.imageUrl ||
  profil?.avatarUrl
);

  const roleLabel =
    formatRole(profil?.role);

  const accountActive =
    isAccountActive(
      profil?.statutCompte
    );

  const membership =
    getMembershipPresentation(
      adhesion
    );

  const handleEditProfile =
    useCallback(() => {
      navigation.navigate("ModifierProfil");
    }, [navigation]);

  const handleChangePassword =
    useCallback(() => {
      navigation.navigate(
        "ChangerMotDePasse"
      );
    }, [navigation]);

  const handleNotifications =
    useCallback(() => {
      navigation.navigate("NotificationsParametres");
    }, [navigation]);

  const handlePrivacy =
    useCallback(() => {
      navigation.navigate("Confidentialite");
    }, [navigation]);

  const handleMembership =
    useCallback(() => {
      navigation.navigate("MesEngagements");
    }, [navigation]);

  const handleLogout =
    useCallback(() => {
      Alert.alert(
        "Déconnexion",
        "Voulez-vous vraiment vous déconnecter ?",
        [
          {
            text: "Annuler",
            style: "cancel",
          },
          {
            text: "Se déconnecter",
            style: "destructive",
            onPress: async () => {
              try {
                /*
                 * logout() supprime le token et
                 * l'utilisateur dans AuthContext.
                 *
                 * RootNavigator détecte ensuite
                 * isAuthenticated === false et
                 * affiche automatiquement Login.
                 */
                await logout();
              } catch (logoutError) {
                console.error(
                  "Erreur pendant la déconnexion :",
                  logoutError
                );

                Alert.alert(
                  "Erreur",
                  "Impossible de vous déconnecter pour le moment."
                );
              }
            },
          },
        ]
      );
    }, [logout]);

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom"]}
      >
        {isFocused ? (
          <StatusBar
            style="light"
            animated
          />
        ) : null}

        <View style={styles.loadingContainer}>
          <View style={styles.loadingLogo}>
            <Ionicons
              name="person"
              size={30}
              color={COLORS.text}
            />
          </View>

          <ActivityIndicator
            size="small"
            color={COLORS.text}
            style={styles.loadingSpinner}
          />

          <Text style={styles.loadingText}>
            Chargement de votre espace...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      {isFocused ? (
        <StatusBar
          style="light"
          animated
        />
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.text}
            colors={[COLORS.text]}
            progressBackgroundColor={
              COLORS.card
            }
          />
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <Animated.View
          entering={FadeInUp
            .duration(500)
            .springify()}
        >
          <ProfileHero
            displayName={displayName}
            initials={initials}
            imageUrl={avatarUrl}
            roleLabel={roleLabel}
            accountActive={accountActive}
            ceintureNom={
              profil?.ceintureNom
            }
            ceintureCouleur={
              profil?.ceintureCouleur
            }
            onEdit={handleEditProfile}
          />
        </Animated.View>

        {error ? (
          <Animated.View
            entering={FadeInDown.duration(
              300
            )}
          >
            <ErrorCard
              message={error}
              onRetry={fetchProfileData}
            />
          </Animated.View>
        ) : null}

        <Animated.View
          entering={FadeInDown
            .delay(80)
            .duration(450)}
        >
          <SectionHeader
            title="Vue d’ensemble"
            subtitle="Votre activité au club"
          />

          <StatisticsCard
            statistics={statistiques}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown
            .delay(140)
            .duration(450)}
        >
          <SectionHeader
            title="Mon abonnement"
            subtitle="Votre situation actuelle"
          />

          <MembershipCard
            membership={membership}
            onPress={handleMembership}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown
            .delay(200)
            .duration(450)}
        >
          <SectionHeader
            title="Informations"
            subtitle="Vos coordonnées personnelles"
          />

          <View style={styles.listCard}>
            <ProfileInfoRow
              icon="mail-outline"
              label="Email"
              value={
                profil?.email ||
                "Non renseigné"
              }
              onPress={handleEditProfile}
            />

            <ListDivider />

            <ProfileInfoRow
              icon="call-outline"
              label="Téléphone"
              value={
                profil?.telephone ||
                "Non renseigné"
              }
              onPress={handleEditProfile}
            />

            <ListDivider />

            <ProfileInfoRow
              icon="calendar-outline"
              label="Date de naissance"
              value={formatDate(
                profil?.dateNaissance
              )}
              locked
            />

            <ListDivider />

            <ProfileInfoRow
              icon="location-outline"
              label="Adresse"
              value={
                profil?.adresse ||
                "Non renseignée"
              }
              onPress={handleEditProfile}
              multiline
            />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown
            .delay(260)
            .duration(450)}
        >
          <SectionHeader
            title="Paramètres"
            subtitle="Gérez votre compte"
          />

          <View style={styles.listCard}>

            <SettingsRow
              icon="lock-closed-outline"
              title="Mot de passe"
              onPress={
                handleChangePassword
              }
            />

            <ListDivider />

            <SettingsRow
              icon="notifications-outline"
              title="Notifications"
              onPress={
                handleNotifications
              }
            />

            <ListDivider />

            <SettingsRow
              icon="shield-checkmark-outline"
              title="Confidentialité"
              onPress={handlePrivacy}
            />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown
            .delay(320)
            .duration(450)}
        >
          <AnimatedPressable
            onPress={handleLogout}
            accessibilityLabel="Se déconnecter"
            icon="log-out-outline"
            label="Se déconnecter"
            destructive
          />
        </Animated.View>

        <Text style={styles.footerText}>
          SDMAA • Espace membre
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/*                                SUBCOMPONENTS                               */
/* -------------------------------------------------------------------------- */

interface ProfileHeroProps {
  displayName: string;
  initials: string;
  imageUrl?: string;
  roleLabel: string;
  accountActive: boolean;
  ceintureNom?: string;
  ceintureCouleur?: string;
  onEdit: () => void;
}

function ProfileHero({
  displayName,
  initials,
  imageUrl,
  roleLabel,
  accountActive,
  ceintureNom,
  ceintureCouleur,
  onEdit,
}: ProfileHeroProps) {
  return (
    <View style={styles.heroWrapper}>
      <LinearGradient
        colors={[
          "#343434",
          "#202020",
          "#171717",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroGlowOne} />
        <View style={styles.heroGlowTwo} />

        <View style={styles.heroTopRow}>
          <View
            style={styles.accountPill}
          >
            <View
              style={[
                styles.statusDot,
                !accountActive &&
                  styles.statusDotInactive,
              ]}
            />

            <Text
              style={
                styles.accountPillText
              }
            >
              {accountActive
                ? "Compte actif"
                : "Compte à vérifier"}
            </Text>
          </View>

          <Pressable
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel="Modifier mon profil"
            style={({ pressed }) => [
              styles.editHeroButton,
              pressed &&
                styles.editHeroButtonPressed,
            ]}
          >
            <Ionicons
              name="pencil"
              size={17}
              color={COLORS.text}
            />
          </Pressable>
        </View>

        <View style={styles.heroContent}>
          <View style={styles.avatarShell}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.avatarImage}
                accessibilityLabel={`Photo de profil de ${displayName}`}
              />
            ) : (
              <LinearGradient
                colors={[
                  "#4A4A4A",
                  "#252525",
                ]}
                style={
                  styles.avatarFallback
                }
              >
                <Text
                  style={
                    styles.avatarInitials
                  }
                >
                  {initials}
                </Text>
              </LinearGradient>
            )}

            <View
              style={
                styles.avatarStatusRing
              }
            >
              <View
                style={[
                  styles.avatarStatusDot,
                  !accountActive &&
                    styles.avatarStatusDotInactive,
                ]}
              />
            </View>
          </View>

          <Text style={styles.heroName}>
            {displayName}
          </Text>

          <Text style={styles.heroRole}>
            {roleLabel} • Saint-Denis
          </Text>

          <BeltBadge
            name={ceintureNom}
            color={ceintureCouleur}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

interface BeltBadgeProps {
  name?: string;
  color?: string;
}

function BeltBadge({
  name,
  color,
}: BeltBadgeProps) {
  const safeColor =
    normalizeHexColor(color) ||
    COLORS.cardSoft;

  return (
    <View style={styles.beltBadge}>
      <View
        style={[
          styles.beltColor,
          {
            backgroundColor: safeColor,
          },
          isLightColor(safeColor) &&
            styles.beltColorBorder,
        ]}
      />

      <Text style={styles.beltText}>
        {name
          ? `Ceinture ${name}`
          : "Ceinture non attribuée"}
      </Text>
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

function SectionHeader({
  title,
  subtitle,
}: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      {subtitle ? (
        <Text
          style={styles.sectionSubtitle}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

interface StatisticsCardProps {
  statistics: StatistiquesProfil;
}

function StatisticsCard({
  statistics,
}: StatisticsCardProps) {
  return (
    <View style={styles.statisticsCard}>
      <StatisticItem
        icon="calendar-outline"
        value={statistics.activites}
        label="Activités"
      />

      <View
        style={styles.statisticsDivider}
      />

      <StatisticItem
        icon="trophy-outline"
        value={statistics.competitions}
        label="Compétitions"
      />

      <View
        style={styles.statisticsDivider}
      />

      <StatisticItem
        icon="medal-outline"
        value={statistics.medailles}
        label="Médailles"
      />
    </View>
  );
}

interface StatisticItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
}

function StatisticItem({
  icon,
  value,
  label,
}: StatisticItemProps) {
  return (
    <View style={styles.statisticItem}>
      <View style={styles.statIcon}>
        <Ionicons
          name={icon}
          size={17}
          color={COLORS.textSecondary}
        />
      </View>

      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

interface MembershipCardProps {
  membership: MembershipPresentation;
  onPress: () => void;
}

function MembershipCard({
  membership,
  onPress,
}: MembershipCardProps) {
  return (
    <ScalePressable
      onPress={onPress}
      accessibilityLabel="Voir mon abonnement"
      style={styles.membershipCard}
      contentStyle={styles.membershipPressableContent}
    >
      <LinearGradient
        colors={[
          "#2C2C2C",
          "#202020",
          "#1B1B1B",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.membershipGradient}
      >
        <View
          style={styles.membershipTopRow}
        >
          <View
            style={styles.membershipIcon}
          >
            <Ionicons
              name="card-outline"
              size={22}
              color={COLORS.text}
            />
          </View>

          <View
            style={[
              styles.membershipStatus,
              !membership.isActive &&
                styles.membershipStatusInactive,
            ]}
          >
            <View
              style={[
                styles.membershipStatusDot,
                !membership.isActive &&
                  styles.membershipStatusDotInactive,
              ]}
            />

            <Text
              style={
                styles.membershipStatusText
              }
            >
              {membership.statusLabel}
            </Text>
          </View>
        </View>

        <Text
          style={
            styles.membershipEyebrow
          }
        >
          ABONNEMENT SDMAA
        </Text>

        <Text
          style={styles.membershipTitle}
        >
          {membership.title}
        </Text>

        <View
          style={
            styles.membershipBottomRow
          }
        >
          <View style={{ flex: 1 }}>
            <Text
              style={
                styles.membershipDate
              }
            >
              {membership.dateLabel}
            </Text>

            {membership.priceLabel ? (
              <Text
                style={
                  styles.membershipPrice
                }
              >
                {membership.priceLabel}
              </Text>
            ) : null}
          </View>

          <View
            style={
              styles.membershipArrow
            }
          >
            <Ionicons
              name="arrow-forward"
              size={18}
              color={COLORS.text}
            />
          </View>
        </View>
      </LinearGradient>
    </ScalePressable>
  );
}

interface ProfileInfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress?: () => void;
  multiline?: boolean;
  locked?: boolean;
}

function ProfileInfoRow({
  icon,
  label,
  value,
  onPress,
  multiline = false,
  locked = false,
}: ProfileInfoRowProps) {
  const content = (
    <>
      <View style={styles.rowIcon}>
        <Ionicons
          name={icon}
          size={20}
          color={COLORS.text}
        />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text
          style={styles.infoValue}
          numberOfLines={
            multiline ? 2 : 1
          }
        >
          {value}
        </Text>
      </View>

      {locked ? (
        <View style={styles.lockedIndicator}>
          <Ionicons
            name="lock-closed-outline"
            size={16}
            color={COLORS.textMuted}
          />
        </View>
      ) : (
        <Ionicons
          name="chevron-forward"
          size={19}
          color={COLORS.textMuted}
        />
      )}
    </>
  );

  if (!onPress || locked) {
    return (
      <View
        accessible
        accessibilityLabel={`${label} : ${value}. Non modifiable`}
        style={[
          styles.infoRow,
          styles.infoRowContent,
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <ScalePressable
      onPress={onPress}
      accessibilityLabel={`${label} : ${value}`}
      style={styles.infoRow}
      contentStyle={styles.infoRowContent}
      scaleTo={0.99}
    >
      {content}
    </ScalePressable>
  );
}

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
}

function SettingsRow({
  icon,
  title,
  onPress,
}: SettingsRowProps) {
  return (
    <ScalePressable
      onPress={onPress}
      accessibilityLabel={title}
      style={styles.settingsRow}
      contentStyle={styles.settingsRowContent}
      scaleTo={0.99}
    >
      <View style={styles.rowIcon}>
        <Ionicons
          name={icon}
          size={20}
          color={COLORS.text}
        />
      </View>

      <View style={styles.settingsContent}>
        <Text
          style={styles.settingsTitle}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={COLORS.textMuted}
      />
    </ScalePressable>
  );
}

function ListDivider() {
  return (
    <View style={styles.listDivider} />
  );
}

interface ErrorCardProps {
  message: string;
  onRetry: () => void;
}

function ErrorCard({
  message,
  onRetry,
}: ErrorCardProps) {
  return (
    <View style={styles.errorCard}>
      <View style={styles.errorIcon}>
        <Ionicons
          name="cloud-offline-outline"
          size={21}
          color={COLORS.red}
        />
      </View>

      <View style={styles.errorContent}>
        <Text style={styles.errorTitle}>
          Données indisponibles
        </Text>

        <Text style={styles.errorMessage}>
          {message}
        </Text>
      </View>

      <ScalePressable
        onPress={onRetry}
        accessibilityLabel="Réessayer"
        style={styles.retryButton}
      >
        <Ionicons
          name="refresh"
          size={19}
          color={COLORS.text}
        />
      </ScalePressable>
    </View>
  );
}

interface AnimatedPressableProps {
  onPress: () => void;
  accessibilityLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  destructive?: boolean;
}

function AnimatedPressable({
  onPress,
  accessibilityLabel,
  icon,
  label,
  destructive = false,
}: AnimatedPressableProps) {
  return (
    <ScalePressable
      onPress={onPress}
      accessibilityLabel={
        accessibilityLabel
      }
      style={[
        styles.actionButton,
        destructive &&
          styles.actionButtonDestructive,
      ]}
      contentStyle={styles.actionButtonContent}
    >
      <View
        style={[
          styles.actionIcon,
          destructive &&
            styles.actionIconDestructive,
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={
            destructive
              ? COLORS.red
              : COLORS.text
          }
        />
      </View>

      <Text style={styles.actionLabel}>
        {label}
      </Text>

      <Ionicons
        name="chevron-forward"
        size={19}
        color={COLORS.textMuted}
      />
    </ScalePressable>
  );
}

interface ScalePressableProps {
  children: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  style?: object | object[];
  contentStyle?: object | object[];
  scaleTo?: number;
}

function ScalePressable({
  children,
  onPress,
  accessibilityLabel,
  style,
  contentStyle,
  scaleTo = 0.96,
}: ScalePressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale: interpolate(
            scale.value,
            [0, 1],
            [scaleTo, 1]
          ),
        },
      ],
    }));

  const handlePressIn = () => {
    scale.value = withSpring(0, {
      damping: 18,
      stiffness: 260,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 16,
      stiffness: 220,
    });
  };

  return (
    <Animated.View
      style={[style, animatedStyle]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={
          accessibilityLabel
        }
        style={[
          styles.pressableFill,
          contentStyle,
        ]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

function selectCurrentAdhesion(
  value: Adhesion[] | Adhesion
): Adhesion | null {
  const adhesions = Array.isArray(value)
    ? value
    : value
      ? [value]
      : [];

  if (adhesions.length === 0) {
    return null;
  }

  const active = adhesions.find(
    (item) =>
      normalizeStatus(item.statut) ===
      "VALIDEE"
  );

  if (active) {
    return active;
  }

  return [...adhesions].sort(
    (first, second) => {
      const firstDate = new Date(
        first.dateValidation ||
          first.dateDemande ||
          0
      ).getTime();

      const secondDate = new Date(
        second.dateValidation ||
          second.dateDemande ||
          0
      ).getTime();

      return secondDate - firstDate;
    }
  )[0];
}

function buildStatistics(
  registrations: InscriptionActivite[]
): StatistiquesProfil {
  const safeRegistrations =
    Array.isArray(registrations)
      ? registrations
      : [];

  const validated =
    safeRegistrations.filter((item) => {
      const status = normalizeStatus(
        item.statutInscription
      );

      return [
        "CONFIRME",
        "CONFIRMEE",
        "VALIDE",
        "VALIDEE",
        "TERMINE",
        "TERMINEE",
      ].includes(status);
    });

  const base =
    validated.length > 0
      ? validated
      : safeRegistrations;

  const competitions = base.filter(
    (item) => {
      const type = [
        item.typeActivite,
        item.activiteType,
        item.categorie,
        item.activite?.typeActivite,
        item.activite?.categorie,
      ]
        .filter(Boolean)
        .join(" ")
        .toUpperCase();

      return type.includes(
        "COMPETITION"
      );
    }
  );

  const medailles =
    competitions.filter(
      (item) => {
        const result = [
          item.medaille,
          item.resultat,
          item.classement,
        ]
          .filter(
            (value) =>
              value !== undefined &&
              value !== null
          )
          .join(" ")
          .toUpperCase();

        if (
          typeof item.classement ===
            "number" &&
          item.classement >= 1 &&
          item.classement <= 3
        ) {
          return true;
        }

        return [
          "OR",
          "ARGENT",
          "BRONZE",
          "MEDAILLE",
          "1",
          "2",
          "3",
        ].some((token) =>
          result.includes(token)
        );
      }
    ).length;

  return {
    activites: base.length,
    competitions:
      competitions.length,
    medailles,
  };
}

function getMembershipPresentation(
  adhesion: Adhesion | null
): MembershipPresentation {
  if (!adhesion) {
    return {
      title:
        "Aucun abonnement actif",
      statusLabel: "Inactif",
      isActive: false,
      dateLabel:
        "Consultez vos adhésions pour vous inscrire.",
    };
  }

  const status =
    normalizeStatus(adhesion.statut);

  const isActive = [
    "VALIDEE",
    "VALIDE",
    "ACTIVE",
    "ACTIF",
  ].includes(status);

  const isPending = [
    "EN_ATTENTE",
    "EN ATTENTE",
  ].includes(status);

  const title =
    adhesion.abonnement?.titre ||
    adhesion.abonnement?.nom ||
    adhesion.abonnementTitre ||
    adhesion.titreAbonnement ||
    "Abonnement SDMAA";

  let dateLabel =
    "Informations de validité indisponibles";

  if (adhesion.dateExpiration) {
    dateLabel = `Valide jusqu’au ${formatDate(
      adhesion.dateExpiration
    )}`;
  } else if (adhesion.dateValidation) {
    dateLabel = `Validé le ${formatDate(
      adhesion.dateValidation
    )}`;
  } else if (adhesion.dateDemande) {
    dateLabel = `Demandé le ${formatDate(
      adhesion.dateDemande
    )}`;
  }

  let priceLabel: string | undefined;

  if (
    adhesion.abonnement?.prixAnnuel
  ) {
    priceLabel = `${formatCurrency(
      adhesion.abonnement.prixAnnuel
    )} / an`;
  } else if (
    adhesion.abonnement?.prixMensuel
  ) {
    priceLabel = `${formatCurrency(
      adhesion.abonnement.prixMensuel
    )} / mois`;
  }

  return {
    title,
    statusLabel: isActive
      ? "Active"
      : isPending
        ? "En attente"
        : "Inactive",
    isActive,
    dateLabel,
    priceLabel,
  };
}

function formatRole(
  role?: string
): string {
  switch (
    normalizeStatus(role)
  ) {
    case "ADMIN":
      return "Administrateur";

    case "COACH":
      return "Coach";

    case "ADHERENT":
    default:
      return "Adhérent";
  }
}

function isAccountActive(
  status?: string
): boolean {
  return [
    "ACTIF",
    "ACTIVE",
    "VALIDE",
    "VALIDEE",
  ].includes(
    normalizeStatus(status || "ACTIF")
  );
}

function normalizeStatus(
  value?: string
): string {
  return (value || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );
}

function formatDate(
  dateValue?: string
): string {
  if (!dateValue) {
    return "Non renseignée";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

function formatCurrency(
  value: number
): string {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }
  ).format(value);
}

function normalizeHexColor(
  color?: string
): string | null {
  if (!color) {
    return null;
  }

  const trimmed = color.trim();

  if (
    /^#[0-9A-F]{6}$/i.test(trimmed) ||
    /^#[0-9A-F]{3}$/i.test(trimmed)
  ) {
    return trimmed;
  }

  return null;
}

function isLightColor(
  hex: string
): boolean {
  let cleaned = hex.replace("#", "");

  if (cleaned.length === 3) {
    cleaned = cleaned
      .split("")
      .map((character) =>
        character.repeat(2)
      )
      .join("");
  }

  const red = parseInt(
    cleaned.substring(0, 2),
    16
  );

  const green = parseInt(
    cleaned.substring(2, 4),
    16
  );

  const blue = parseInt(
    cleaned.substring(4, 6),
    16
  );

  const luminance =
    (0.299 * red +
      0.587 * green +
      0.114 * blue) /
    255;

  return luminance > 0.72;
}

function resolveImageUrl(
  value?: string
): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const cleanedValue = value.trim();

  if (
    cleanedValue.startsWith("http://") ||
    cleanedValue.startsWith("https://")
  ) {
    return cleanedValue;
  }

  const baseUrl =
    String(api.defaults.baseURL || "")
      .replace(/\/api\/?$/, "")
      .replace(/\/$/, "");

  const cleanedPath =
    cleanedValue
      .replace(/^\/+/, "")
      .replace(/^uploads\//, "");

  return `${baseUrl}/uploads/${cleanedPath}`;
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

  scrollContent: {
    paddingBottom: 46,
  },

  pressableFill: {
    width: "100%",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  loadingLogo: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 36,
  },

  loadingSpinner: {
    marginTop: 22,
  },

  loadingText: {
    marginTop: 13,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },

  heroWrapper: {
    marginHorizontal: 16,
    marginTop: 18,
  },

  heroCard: {
    minHeight: 372,
    overflow: "hidden",
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
    backgroundColor:
      "rgba(255,255,255,0.045)",
    borderRadius: 115,
  },

  heroGlowTwo: {
    position: "absolute",
    bottom: -100,
    left: -70,
    width: 220,
    height: 220,
    backgroundColor:
      "rgba(255,255,255,0.025)",
    borderRadius: 110,
  },

  heroTopRow: {
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  accountPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor:
      "rgba(10,10,10,0.34)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.08)",
    borderRadius: 999,
  },

  statusDot: {
    width: 7,
    height: 7,
    backgroundColor: COLORS.green,
    borderRadius: 4,
  },

  statusDotInactive: {
    backgroundColor: COLORS.red,
  },

  accountPillText: {
    color: "#D8D8D8",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },

  editHeroButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(10,10,10,0.38)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.09)",
    borderRadius: 14,
  },

  editHeroButtonPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  heroContent: {
    zIndex: 2,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 15,
    paddingBottom: 4,
  },

  avatarShell: {
    position: "relative",
    width: 140,
    height: 140,
    padding: 4,
    backgroundColor:
      "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.11)",
    borderRadius: 70,
    shadowColor: "#000000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 8,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.cardSoft,
    borderRadius: 66,
  },

  avatarFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 66,
  },

  avatarInitials: {
    color: COLORS.text,
    fontSize: 38,
    letterSpacing: 1.3,
    fontFamily: "Inter_700Bold",
  },

  avatarStatusRing: {
    position: "absolute",
    right: 4,
    bottom: 7,
    width: 23,
    height: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      COLORS.background,
    borderRadius: 12,
  },

  avatarStatusDot: {
    width: 14,
    height: 14,
    backgroundColor: COLORS.green,
    borderRadius: 7,
  },

  avatarStatusDotInactive: {
    backgroundColor: COLORS.red,
  },

  heroName: {
    marginTop: 18,
    color: COLORS.text,
    fontSize: 28,
    lineHeight: 34,
    textAlign: "center",
    fontFamily: "Inter_700Bold",
  },

  heroRole: {
    marginTop: 6,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },

  beltBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 15,
    paddingHorizontal: 13,
    paddingVertical: 8,
    backgroundColor:
      "rgba(10,10,10,0.36)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.08)",
    borderRadius: 999,
  },

  beltColor: {
    width: 14,
    height: 14,
    borderRadius: 5,
  },

  beltColorBorder: {
    borderWidth: 1,
    borderColor: "#8A8A8A",
  },

  beltText: {
    color: "#E8E8E8",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },

  sectionHeader: {
    marginTop: 29,
    marginBottom: 12,
    paddingHorizontal: 18,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },

  sectionSubtitle: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },

  statisticsCard: {
    minHeight: 126,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    paddingHorizontal: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 24,
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 5,
  },

  statisticItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  statIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
    backgroundColor: COLORS.cardSoft,
    borderRadius: 11,
  },

  statValue: {
    color: COLORS.text,
    fontSize: 23,
    lineHeight: 27,
    fontFamily: "Inter_700Bold",
  },

  statLabel: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: "center",
    fontFamily: "Inter_600SemiBold",
  },

  statisticsDivider: {
    width: 1,
    height: 54,
    backgroundColor:
      COLORS.borderSoft,
  },

  membershipCard: {
    minHeight: 216,
    overflow: "hidden",
    marginHorizontal: 16,
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

  membershipPressableContent: {
    minHeight: 216,
  },

  membershipGradient: {
    flex: 1,
    padding: 19,
  },

  membershipTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  membershipIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,255,255,0.07)",
    borderRadius: 14,
  },

  membershipStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: "#213229",
    borderRadius: 999,
  },

  membershipStatusInactive: {
    backgroundColor: "#302626",
  },

  membershipStatusDot: {
    width: 7,
    height: 7,
    backgroundColor: "#6BE093",
    borderRadius: 4,
  },

  membershipStatusDotInactive: {
    backgroundColor: "#D79A9A",
  },

  membershipStatusText: {
    color: "#D7E8DD",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },

  membershipEyebrow: {
    marginTop: 23,
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 1.7,
    fontFamily: "Inter_700Bold",
  },

  membershipTitle: {
    marginTop: 7,
    color: COLORS.text,
    fontSize: 24,
    lineHeight: 30,
    fontFamily: "Inter_700Bold",
  },

  membershipBottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 14,
    marginTop: 17,
  },

  membershipDate: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    fontFamily: "Inter_400Regular",
  },

  membershipPrice: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  membershipArrow: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255,255,255,0.08)",
    borderRadius: 14,
  },

  listCard: {
    overflow: "hidden",
    marginHorizontal: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
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

  infoRow: {
    minHeight: 76,
    overflow: "hidden",
  },

  infoRowContent: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  rowIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cardSoft,
    borderRadius: 14,
  },

  infoContent: {
    flex: 1,
    marginHorizontal: 13,
  },

  lockedIndicator: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cardSoft,
    borderRadius: 10,
  },

  infoLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },

  infoValue: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_600SemiBold",
  },

  settingsRow: {
    minHeight: 68,
    overflow: "hidden",
  },

  settingsRowContent: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  settingsContent: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 13,
  },

  settingsTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },

  listDivider: {
    height: 1,
    marginLeft: 70,
    backgroundColor:
      COLORS.borderSoft,
  },

  actionButton: {
    minHeight: 66,
    overflow: "hidden",
    marginHorizontal: 16,
    marginTop: 28,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 22,
  },

  actionButtonContent: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  actionButtonDestructive: {
    backgroundColor: "#1E1919",
    borderColor: "#342424",
  },

  actionIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cardSoft,
    borderRadius: 14,
  },

  actionIconDestructive: {
    backgroundColor: "#2A1D1D",
  },

  actionLabel: {
    flex: 1,
    marginLeft: 13,
    color: COLORS.text,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },

  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    backgroundColor: "#211818",
    borderWidth: 1,
    borderColor: "#3A2424",
    borderRadius: 19,
  },

  errorIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2D1E1E",
    borderRadius: 13,
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },

  errorMessage: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 16,
    fontFamily: "Inter_400Regular",
  },

  retryButton: {
    width: 40,
    height: 40,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cardSoft,
    borderRadius: 13,
  },

  footerText: {
    marginTop: 22,
    color: "#555555",
    fontSize: 10,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
});