// src/screens/ConditionsUtilisationScreen.tsx

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
  card: "#29231A",
  cardSoft: "#1B1B1B",
  border: "#303030",
  text: "#FFFFFF",
  textSecondary: "#B3B3B3",
  textMuted: "#7C7C7C",
  amber: "#FBBF24",
};

export default function ConditionsUtilisationScreen() {
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
          Conditions d’utilisation
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
              name="reader-outline"
              size={30}
              color={COLORS.amber}
            />
          </View>

          <Text style={styles.heroTitle}>
            Utiliser l’application SDMAA
          </Text>

          <Text style={styles.heroText}>
            Ces règles précisent les bonnes pratiques et responsabilités liées à l’utilisation de l’application.
          </Text>
        </View>

        <Section title="Accès à l’application" icon="log-in-outline">
          <Paragraph>
            L’accès à certaines fonctionnalités nécessite un compte actif. L’utilisateur est responsable de la confidentialité de ses identifiants et de l’utilisation faite depuis son compte.
          </Paragraph>
        </Section>

        <Section title="Informations du profil" icon="person-outline">
          <Paragraph>
            Les informations renseignées doivent être exactes et à jour afin de permettre au club de gérer correctement les inscriptions, activités, documents, achats et emprunts.
          </Paragraph>
        </Section>

        <Section title="Inscriptions et engagements" icon="calendar-outline">
          <Paragraph>
            Toute inscription effectuée via l’application doit correspondre à une participation réelle. L’utilisateur s’engage à respecter les règles et informations communiquées pour chaque activité ou compétition.
          </Paragraph>
        </Section>

        <Section title="Achats et emprunts" icon="bag-handle-outline">
          <Paragraph>
            Les commandes et demandes d’emprunt sont soumises à validation selon les disponibilités. Le paiement des achats s’effectue sur place selon les modalités prévues par le club.
          </Paragraph>
        </Section>

        <Section title="Documents" icon="document-text-outline">
          <Paragraph>
            Les documents transmis doivent être authentiques, lisibles et correspondre aux informations demandées. Le club peut refuser un document incomplet, expiré ou non conforme.
          </Paragraph>
        </Section>

        <Section title="Comportement" icon="people-outline">
          <Paragraph>
            L’application doit être utilisée de manière respectueuse. Toute tentative d’accès non autorisé, de détournement des fonctionnalités ou d’utilisation abusive peut entraîner une suspension du compte.
          </Paragraph>
        </Section>

        <Section title="Disponibilité du service" icon="cloud-outline">
          <Paragraph>
            Le club s’efforce de maintenir l’application disponible, mais des interruptions temporaires peuvent survenir lors d’opérations de maintenance, de mises à jour ou en cas de problème technique.
          </Paragraph>
        </Section>

        <Section title="Évolution des conditions" icon="refresh-outline">
          <Paragraph>
            Ces conditions peuvent évoluer lorsque les fonctionnalités de l’application ou l’organisation du club changent. Une version actualisée pourra être publiée directement dans l’application.
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
            color={COLORS.amber}
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
    borderColor: "rgba(251,191,36,0.16)",
    borderRadius: 28,
  },
  heroIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(251,191,36,0.11)",
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
    backgroundColor: "rgba(251,191,36,0.09)",
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