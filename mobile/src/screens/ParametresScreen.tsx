import React from "react";

import {
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

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import type {
  RootStackParamList,
} from "../navigation/RootNavigator";

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    "Parametres"
  >;

const COLORS = {
  background: "#121212",
  card: "#1B1B1B",
  soft: "#292929",
  border: "#303030",
  text: "#FFFFFF",
  muted: "#7C7C7C",
};

export default function ParametresScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      <StatusBar
        style="light"
        animated
      />

      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Retour"
          style={({ pressed }) => [
            styles.backButton,
            pressed &&
              styles.buttonPressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={COLORS.text}
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Paramètres
        </Text>

        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <SettingsSection title="COMPTE">
          <SettingsRow
            icon="person-outline"
            title="Modifier mon profil"
            subtitle="Nom, prénom et coordonnées"
            onPress={() =>
              navigation.navigate(
                "ModifierProfil"
              )
            }
          />

          <Divider />

          <SettingsRow
            icon="key-outline"
            title="Changer mon mot de passe"
            subtitle="Sécuriser votre compte"
            onPress={() =>
              navigation.navigate(
                "ChangerMotDePasse"
              )
            }
          />
        </SettingsSection>

        <SettingsSection title="PRÉFÉRENCES">
          <SettingsRow
            icon="notifications-outline"
            title="Notifications"
            subtitle="Choisir les alertes du club"
            onPress={() =>
              navigation.navigate(
                "NotificationsParametres"
              )
            }
          />

          <Divider />

          <SettingsRow
            icon="shield-checkmark-outline"
            title="Confidentialité"
            subtitle="Données personnelles et compte"
            onPress={() =>
              navigation.navigate(
                "Confidentialite"
              )
            }
          />
        </SettingsSection>

        <SettingsSection title="À PROPOS">
          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="information-circle-outline"
                size={21}
                color={COLORS.text}
              />
            </View>

            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>
                Application SDMAA
              </Text>

              <Text style={styles.rowSubtitle}>
                Version 1.0.0
              </Text>
            </View>
          </View>
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingsSection({
  title,
  children,
}: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <View style={styles.card}>
        {children}
      </View>
    </View>
  );
}

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
}: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      style={({ pressed }) => [
        styles.row,
        pressed &&
          styles.rowPressed,
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon}
          size={21}
          color={COLORS.text}
        />
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>
          {title}
        </Text>

        <Text style={styles.rowSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={COLORS.muted}
      />
    </Pressable>
  );
}

function Divider() {
  return (
    <View style={styles.divider} />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
  },

  buttonPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },

  headerPlaceholder: {
    width: 42,
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  section: {
    marginTop: 22,
  },

  sectionTitle: {
    marginBottom: 10,
    marginLeft: 4,
    color: COLORS.muted,
    fontSize: 10,
    letterSpacing: 1.4,
    fontFamily: "Inter_700Bold",
  },

  card: {
    overflow: "hidden",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
  },

  row: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  rowPressed: {
    backgroundColor: COLORS.soft,
  },

  iconContainer: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.soft,
    borderRadius: 14,
  },

  rowContent: {
    flex: 1,
    marginLeft: 13,
  },

  rowTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },

  rowSubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: "Inter_400Regular",
  },

  divider: {
    height: 1,
    marginLeft: 71,
    backgroundColor: COLORS.border,
  },
});