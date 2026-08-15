// src/screens/ConfidentialiteScreen.tsx

import React from "react";

import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  StatusBar,
} from "expo-status-bar";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useNavigation,
} from "@react-navigation/native";

/* -------------------------------------------------------------------------- */
/*                                   COLORS                                   */
/* -------------------------------------------------------------------------- */

const COLORS = {
  background: "#121212",

  card: "#1B1B1B",
  cardSoft: "#252525",

  border: "#303030",
  borderSoft: "#282828",

  text: "#FFFFFF",
  textSecondary: "#B3B3B3",
  textMuted: "#7C7C7C",

  blue: "#60A5FA",
  blueCard: "#172733",

  amber: "#FBBF24",

  red: "#E50914",
  burgundy: "#800020",

  dangerCard: "#261719",
};

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function ConfidentialiteScreen() {
  const navigation = useNavigation<any>();

  /**
   * Ouvre l'application mail du téléphone.
   */
  const contactClub = async () => {
    const url =
      "mailto:contact@sdmaa.fr?subject=Demande concernant mes données personnelles";

    try {
      const supported =
        await Linking.canOpenURL(url);

      if (!supported) {
        Alert.alert(
          "Messagerie indisponible",
          "Aucune application de messagerie n'est disponible sur cet appareil."
        );

        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      console.error(
        "Erreur ouverture messagerie :",
        error
      );

      Alert.alert(
        "Erreur",
        "Impossible d'ouvrir l'application de messagerie."
      );
    }
  };

  /**
   * La suppression réelle du compte
   * sera branchée plus tard.
   */
  const handleDeleteAccount =
    () => {
      Alert.alert(
        "Supprimer mon compte",
        "La suppression automatique du compte sera disponible prochainement.",
        [
          {
            text: "Annuler",
            style: "cancel",
          },
          {
            text: "Contacter le club",
            onPress: contactClub,
          },
        ]
      );
    };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <StatusBar
        style="light"
        animated
      />

      {/* --------------------------------------------------------------- */}
      {/* HEADER                                                          */}
      {/* --------------------------------------------------------------- */}

      <View style={styles.header}>
        <Pressable
          onPress={() =>
            navigation.goBack()
          }
          accessibilityRole="button"
          accessibilityLabel="Retour"
          style={({ pressed }) => [
            styles.backButton,
            pressed &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={COLORS.text}
          />
        </Pressable>

        <Text
          style={styles.headerTitle}
        >
          Confidentialité
        </Text>

        <View
          style={styles.headerSpacer}
        />
      </View>

      {/* --------------------------------------------------------------- */}
      {/* CONTENT                                                         */}
      {/* --------------------------------------------------------------- */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* ------------------------------------------------------------- */}
        {/* HERO                                                          */}
        {/* ------------------------------------------------------------- */}

        <View style={styles.hero}>
          <View
            style={
              styles.heroIconContainer
            }
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={32}
              color={COLORS.blue}
            />
          </View>

          <Text
            style={styles.heroEyebrow}
          >
            SÉCURITÉ & DONNÉES
          </Text>

          <Text
            style={styles.heroTitle}
          >
            Vos données personnelles
          </Text>

          <Text
            style={styles.heroText}
          >
            Consultez les informations
            liées à vos données, votre
            compte et à l'utilisation de
            l'application.
          </Text>

          <View
            style={styles.heroBadge}
          >
            <Ionicons
              name="lock-closed-outline"
              size={13}
              color={COLORS.blue}
            />

            <Text
              style={
                styles.heroBadgeText
              }
            >
              Données protégées
            </Text>
          </View>
        </View>

        {/* ------------------------------------------------------------- */}
        {/* DOCUMENTS                                                     */}
        {/* ------------------------------------------------------------- */}

        <SettingsGroup
          title="DOCUMENTS"
        >
          <SettingsRow
            icon="document-text-outline"
            iconColor={COLORS.blue}
            iconBackground="rgba(96,165,250,0.12)"
            title="Politique de confidentialité"
            subtitle="Comment vos données sont utilisées"
            onPress={() =>
              navigation.navigate(
                "PolitiqueConfidentialite"
              )
            }
          />

          <Divider />

          <SettingsRow
            icon="reader-outline"
            iconColor={COLORS.amber}
            iconBackground="rgba(251,191,36,0.11)"
            title="Conditions d’utilisation"
            subtitle="Règles d’utilisation de l’application"
            onPress={() =>
              navigation.navigate(
                "ConditionsUtilisation"
              )
            }
          />
        </SettingsGroup>

        {/* ------------------------------------------------------------- */}
        {/* MES DONNÉES                                                   */}
        {/* ------------------------------------------------------------- */}

        <SettingsGroup
          title="MES DONNÉES"
        >
          <SettingsRow
            icon="mail-outline"
            iconColor={COLORS.blue}
            iconBackground="rgba(96,165,250,0.10)"
            title="Contacter le club"
            subtitle="Une question concernant vos données ?"
            onPress={contactClub}
          />
        </SettingsGroup>

        {/* ------------------------------------------------------------- */}
        {/* ZONE SENSIBLE                                                 */}
        {/* ------------------------------------------------------------- */}

        <SettingsGroup
          title="ZONE SENSIBLE"
          danger
        >
          <SettingsRow
            icon="trash-outline"
            title="Supprimer mon compte"
            subtitle="Demander la suppression définitive du compte"
            danger
            onPress={
              handleDeleteAccount
            }
          />
        </SettingsGroup>

        {/* ------------------------------------------------------------- */}
        {/* INFORMATION                                                   */}
        {/* ------------------------------------------------------------- */}

        <View
          style={styles.infoBox}
        >
          <View
            style={styles.infoIcon}
          >
            <Ionicons
              name="information-circle-outline"
              size={19}
              color={COLORS.textSecondary}
            />
          </View>

          <Text
            style={styles.infoText}
          >
            Certaines données peuvent
            devoir être conservées pour
            les inscriptions, la gestion
            administrative et les
            obligations du club.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/*                              SETTINGS GROUP                                */
/* -------------------------------------------------------------------------- */

function SettingsGroup({
  title,
  children,
  danger = false,
}: {
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <View
      style={styles.group}
    >
      <Text
        style={[
          styles.sectionTitle,
          danger &&
            styles.sectionTitleDanger,
        ]}
      >
        {title}
      </Text>

      <View
        style={[
          styles.card,
          danger &&
            styles.dangerCard,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                               SETTINGS ROW                                 */
/* -------------------------------------------------------------------------- */

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  danger = false,
  iconColor,
  iconBackground,
}: {
  icon:
    keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
  iconColor?: string;
  iconBackground?: string;
}) {
  const resolvedIconColor =
    danger
      ? COLORS.red
      : iconColor ||
        COLORS.text;

  const resolvedBackground =
    danger
      ? "rgba(229,9,20,0.10)"
      : iconBackground ||
        COLORS.cardSoft;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.row,
        pressed &&
          styles.rowPressed,
      ]}
    >
      <View
        style={[
          styles.rowIcon,
          {
            backgroundColor:
              resolvedBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={
            resolvedIconColor
          }
        />
      </View>

      <View
        style={
          styles.rowContent
        }
      >
        <Text
          style={[
            styles.rowTitle,
            danger &&
              styles.rowTitleDanger,
          ]}
        >
          {title}
        </Text>

        <Text
          style={
            styles.rowSubtitle
          }
        >
          {subtitle}
        </Text>
      </View>

      <View
        style={
          styles.rowChevron
        }
      >
        <Ionicons
          name="chevron-forward"
          size={19}
          color={
            danger
              ? "rgba(229,9,20,0.70)"
              : COLORS.textMuted
          }
        />
      </View>
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  DIVIDER                                   */
/* -------------------------------------------------------------------------- */

function Divider() {
  return (
    <View
      style={styles.divider}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        COLORS.background,
    },

    /* ------------------------------------------------------------------ */
    /* HEADER                                                             */
    /* ------------------------------------------------------------------ */

    header: {
      height: 64,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      paddingHorizontal: 16,
    },

    backButton: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        COLORS.card,

      borderWidth: 1,
      borderColor:
        COLORS.border,

      borderRadius: 14,
    },

    headerTitle: {
      flex: 1,

      marginHorizontal: 10,

      color: COLORS.text,

      fontSize: 17,

      textAlign: "center",

      fontFamily:
        "Inter_700Bold",
    },

    headerSpacer: {
      width: 42,
    },

    /* ------------------------------------------------------------------ */
    /* CONTENT                                                            */
    /* ------------------------------------------------------------------ */

    content: {
      paddingHorizontal: 16,
      paddingBottom: 46,
    },

    /* ------------------------------------------------------------------ */
    /* HERO                                                               */
    /* ------------------------------------------------------------------ */

    hero: {
      alignItems: "center",

      paddingHorizontal: 22,
      paddingVertical: 26,

      backgroundColor:
        COLORS.blueCard,

      borderWidth: 1,

      borderColor:
        "rgba(96,165,250,0.17)",

      borderRadius: 28,
    },

    heroIconContainer: {
      width: 64,
      height: 64,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(96,165,250,0.11)",

      borderWidth: 1,

      borderColor:
        "rgba(96,165,250,0.13)",

      borderRadius: 21,
    },

    heroEyebrow: {
      marginTop: 16,

      color: COLORS.blue,

      fontSize: 9,

      letterSpacing: 1.5,

      fontFamily:
        "Inter_700Bold",
    },

    heroTitle: {
      marginTop: 7,

      color: COLORS.text,

      fontSize: 21,

      lineHeight: 27,

      textAlign: "center",

      letterSpacing: -0.35,

      fontFamily:
        "Inter_700Bold",
    },

    heroText: {
      maxWidth: 305,

      marginTop: 9,

      color:
        "#AFC1D0",

      fontSize: 12,

      lineHeight: 18,

      textAlign: "center",

      fontFamily:
        "Inter_400Regular",
    },

    heroBadge: {
      flexDirection: "row",
      alignItems: "center",

      gap: 6,

      marginTop: 17,

      paddingHorizontal: 10,
      paddingVertical: 6,

      backgroundColor:
        "rgba(96,165,250,0.09)",

      borderRadius: 999,
    },

    heroBadgeText: {
      color: "#9CC8F4",

      fontSize: 9,

      fontFamily:
        "Inter_600SemiBold",
    },

    /* ------------------------------------------------------------------ */
    /* GROUP                                                              */
    /* ------------------------------------------------------------------ */

    group: {
      marginTop: 24,
    },

    sectionTitle: {
      marginBottom: 10,
      marginLeft: 4,

      color:
        COLORS.textMuted,

      fontSize: 10,

      letterSpacing: 1.4,

      fontFamily:
        "Inter_700Bold",
    },

    sectionTitleDanger: {
      color:
        "rgba(229,9,20,0.80)",
    },

    card: {
      overflow: "hidden",

      backgroundColor:
        COLORS.card,

      borderWidth: 1,

      borderColor:
        COLORS.borderSoft,

      borderRadius: 23,
    },

    dangerCard: {
      backgroundColor:
        COLORS.dangerCard,

      borderColor:
        "rgba(229,9,20,0.16)",
    },

    /* ------------------------------------------------------------------ */
    /* ROW                                                                */
    /* ------------------------------------------------------------------ */

    row: {
      minHeight: 84,

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal: 15,
      paddingVertical: 12,
    },

    rowPressed: {
      backgroundColor:
        "rgba(255,255,255,0.035)",
    },

    rowIcon: {
      width: 44,
      height: 44,

      alignItems: "center",
      justifyContent: "center",

      borderRadius: 14,
    },

    rowContent: {
      flex: 1,

      marginHorizontal: 13,
    },

    rowTitle: {
      color: COLORS.text,

      fontSize: 14,

      lineHeight: 18,

      fontFamily:
        "Inter_600SemiBold",
    },

    rowTitleDanger: {
      color:
        COLORS.red,
    },

    rowSubtitle: {
      marginTop: 4,

      color:
        COLORS.textMuted,

      fontSize: 11,

      lineHeight: 16,

      fontFamily:
        "Inter_400Regular",
    },

    rowChevron: {
      width: 30,
      height: 30,

      alignItems: "center",
      justifyContent: "center",
    },

    /* ------------------------------------------------------------------ */
    /* DIVIDER                                                            */
    /* ------------------------------------------------------------------ */

    divider: {
      height: 1,

      marginLeft: 72,

      backgroundColor:
        COLORS.borderSoft,
    },

    /* ------------------------------------------------------------------ */
    /* INFO BOX                                                           */
    /* ------------------------------------------------------------------ */

    infoBox: {
      flexDirection: "row",

      alignItems: "flex-start",

      marginTop: 20,

      padding: 14,

      backgroundColor:
        "rgba(255,255,255,0.025)",

      borderWidth: 1,

      borderColor:
        COLORS.borderSoft,

      borderRadius: 17,
    },

    infoIcon: {
      width: 34,
      height: 34,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        COLORS.cardSoft,

      borderRadius: 11,
    },

    infoText: {
      flex: 1,

      marginLeft: 11,

      color:
        COLORS.textMuted,

      fontSize: 10,

      lineHeight: 16,

      fontFamily:
        "Inter_400Regular",
    },

    /* ------------------------------------------------------------------ */
    /* INTERACTIONS                                                       */
    /* ------------------------------------------------------------------ */

    pressed: {
      opacity: 0.72,

      transform: [
        {
          scale: 0.96,
        },
      ],
    },
  });