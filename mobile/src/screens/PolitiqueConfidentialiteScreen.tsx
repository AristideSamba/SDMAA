// src/screens/PolitiqueConfidentialiteScreen.tsx

import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const COLORS = {
  background: "#121212",
  card: "#172733",
  cardSoft: "#1B1B1B",
  border: "#303030",
  text: "#FFFFFF",
  textSecondary: "#B3B3B3",
  textMuted: "#7C7C7C",
  blue: "#60A5FA",
};

export default function PolitiqueConfidentialiteScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={COLORS.text}
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Politique de confidentialité
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={30}
              color={COLORS.blue}
            />
          </View>

          <Text style={styles.heroTitle}>
            Vos données, en toute transparence
          </Text>

          <Text style={styles.heroText}>
            Cette page explique quelles données sont utilisées dans l’application SDMAA et dans quel but.
          </Text>
        </View>

        <Section title="Données collectées" icon="layers-outline">
          <Paragraph>
            L’application peut traiter les informations liées à votre profil, votre adhésion, vos inscriptions aux activités, vos résultats de compétition, vos achats, vos emprunts, vos documents personnels et vos préférences de notifications.
          </Paragraph>
        </Section>

        <Section title="Utilisation des données" icon="settings-outline">
          <Paragraph>
            Ces données sont utilisées pour gérer votre compte, organiser la vie du club, suivre vos inscriptions, traiter vos commandes et emprunts, afficher vos documents et vous envoyer des informations utiles liées à votre activité au sein du club.
          </Paragraph>
        </Section>

        <Section title="Documents personnels" icon="document-lock-outline">
          <Paragraph>
            Les documents envoyés depuis l’application, comme un certificat médical ou une autorisation parentale, sont associés à votre compte et peuvent être vérifiés par l’administration du club.
          </Paragraph>
        </Section>

        <Section title="Stockage et sécurité" icon="lock-closed-outline">
          <Paragraph>
            Les données sont stockées sur les services utilisés par l’application et sont accessibles uniquement dans le cadre du fonctionnement du service. Des mécanismes d’authentification, de contrôle d’accès et de sécurisation des mots de passe sont utilisés pour limiter les accès non autorisés.
          </Paragraph>
        </Section>

        <Section title="Durée de conservation" icon="time-outline">
          <Paragraph>
            Les données sont conservées pendant la durée nécessaire à la gestion de votre relation avec le club et, lorsque cela est nécessaire, pendant la durée imposée par les obligations administratives ou légales applicables.
          </Paragraph>
        </Section>

        <Section title="Vos droits" icon="person-circle-outline">
          <Paragraph>
            Vous pouvez demander l’accès, la correction ou la suppression de certaines données vous concernant. Certaines informations peuvent toutefois devoir être conservées lorsque le club est soumis à une obligation administrative ou réglementaire.
          </Paragraph>
        </Section>

        <Section title="Contact" icon="mail-outline">
          <Paragraph>
            Pour toute question relative à vos données personnelles, vous pouvez contacter le club depuis l’écran Confidentialité de l’application.
          </Paragraph>
        </Section>

        <Text style={styles.footerNote}>
          Dernière mise à jour : août 2026
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons
            name={icon}
            size={18}
            color={COLORS.blue}
          />
        </View>

        <Text style={styles.sectionTitle}>
          {title}
        </Text>
      </View>

      <View style={styles.sectionCard}>
        {children}
      </View>
    </View>
  );
}

function Paragraph({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Text style={styles.paragraph}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.cardSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 10,
    color: COLORS.text,
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Inter_700Bold",
  },
  headerSpacer: {
    width: 42,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 44,
  },
  hero: {
    alignItems: "center",
    padding: 24,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.16)",
    borderRadius: 28,
  },
  heroIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(96,165,250,0.12)",
    borderRadius: 18,
  },
  heroTitle: {
    marginTop: 14,
    color: COLORS.text,
    fontSize: 19,
    textAlign: "center",
    fontFamily: "Inter_700Bold",
  },
  heroText: {
    maxWidth: 320,
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  section: {
    marginTop: 22,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(96,165,250,0.10)",
    borderRadius: 11,
  },
  sectionTitle: {
    marginLeft: 10,
    color: COLORS.text,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  sectionCard: {
    padding: 16,
    backgroundColor: COLORS.cardSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
  },
  paragraph: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 19,
    fontFamily: "Inter_400Regular",
  },
  footerNote: {
    marginTop: 28,
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  pressed: {
    opacity: 0.72,
  },
});