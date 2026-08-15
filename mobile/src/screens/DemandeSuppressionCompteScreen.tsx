// src/screens/DemandeSuppressionCompteScreen.tsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";

import api from "../services/api";

type StatutDemandeSuppression =
  | "EN_ATTENTE"
  | "TRAITEE"
  | "REFUSEE";

interface DemandeSuppressionDTO {
  id: number;

  utilisateurId?: number | null;
  utilisateurNom?: string | null;
  utilisateurEmail?: string | null;

  dateDemande?: string | null;
  motif?: string | null;

  statut:
    StatutDemandeSuppression;

  dateTraitement?: string | null;
  commentaireAdmin?: string | null;
}

const COLORS = {
  background: "#121212",
  card: "#1B1B1B",
  cardSoft: "#252525",
  border: "#303030",
  text: "#FFFFFF",
  textSecondary: "#B3B3B3",
  textMuted: "#7C7C7C",
  red: "#E50914",
  burgundy: "#800020",
  amber: "#FBBF24",
  green: "#34D399",
  blue: "#60A5FA",
};

export default function DemandeSuppressionCompteScreen() {
  const navigation =
    useNavigation();

  const isFocused =
    useIsFocused();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    motif,
    setMotif,
  ] = useState("");

  const [
    demande,
    setDemande,
  ] =
    useState<DemandeSuppressionDTO | null>(
      null
    );

  const chargerDerniereDemande =
    useCallback(async () => {
      try {
        const response =
          await api.get<
            DemandeSuppressionDTO | null
          >(
            "/demandes-suppression/me"
          );

        setDemande(
          response.data || null
        );
      } catch (error: any) {
        console.error(
          "Erreur chargement demande suppression :",
          error
        );

        setDemande(null);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    if (isFocused) {
      chargerDerniereDemande();
    }
  }, [
    chargerDerniereDemande,
    isFocused,
  ]);

  const demandeEnAttente =
    demande?.statut ===
    "EN_ATTENTE";

  const statusPresentation =
    useMemo(() => {
      if (!demande) {
        return null;
      }

      if (
        demande.statut ===
        "EN_ATTENTE"
      ) {
        return {
          label: "En attente",
          color: COLORS.amber,
          background:
            "rgba(251,191,36,0.09)",
          icon:
            "time-outline" as const,
        };
      }

      if (
        demande.statut ===
        "TRAITEE"
      ) {
        return {
          label: "Traitée",
          color: COLORS.green,
          background:
            "rgba(52,211,153,0.09)",
          icon:
            "checkmark-circle-outline" as const,
        };
      }

      return {
        label: "Refusée",
        color: COLORS.red,
        background:
          "rgba(229,9,20,0.09)",
        icon:
          "close-circle-outline" as const,
      };
    }, [demande]);

  const envoyerDemande =
    useCallback(() => {
      if (
        sending ||
        demandeEnAttente
      ) {
        return;
      }

      Alert.alert(
        "Confirmer la demande",
        "Votre compte ne sera pas supprimé immédiatement. Votre demande sera transmise à l’administration du club pour traitement.",
        [
          {
            text: "Annuler",
            style: "cancel",
          },
          {
            text: "Envoyer",
            onPress: async () => {
              try {
                setSending(true);

                await api.post(
                  "/demandes-suppression/me",
                  null,
                  {
                    params: {
                      motif:
                        motif.trim() ||
                        undefined,
                    },
                  }
                );

                setMotif("");

                await chargerDerniereDemande();

                Alert.alert(
                  "Demande envoyée",
                  "Votre demande de suppression a bien été transmise à l’administration."
                );
              } catch (
                error: any
              ) {
                Alert.alert(
                  "Envoi impossible",
                  error?.response?.data
                    ?.message ||
                    error?.response?.data
                      ?.error ||
                    "Impossible d'envoyer votre demande."
                );
              } finally {
                setSending(false);
              }
            },
          },
        ]
      );
    }, [
      chargerDerniereDemande,
      demandeEnAttente,
      motif,
      sending,
    ]);

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <StatusBar
        style="light"
      />

      <View
        style={styles.header}
      >
        <Pressable
          onPress={() =>
            navigation.goBack()
          }
          style={styles.backButton}
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
          Suppression du compte
        </Text>

        <View
          style={styles.headerSpacer}
        />
      </View>

      {loading ? (
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={COLORS.red}
          />

          <Text
            style={styles.loadingText}
          >
            Chargement…
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          <View
            style={styles.hero}
          >
            <View
              style={
                styles.heroIcon
              }
            >
              <Ionicons
                name="trash-outline"
                size={28}
                color={COLORS.red}
              />
            </View>

            <Text
              style={
                styles.heroEyebrow
              }
            >
              GESTION DU COMPTE
            </Text>

            <Text
              style={styles.heroTitle}
            >
              Demander la suppression
            </Text>

            <Text
              style={styles.heroText}
            >
              L’envoi d’une demande ne supprime pas votre compte immédiatement. L’administration vérifiera votre situation avant de traiter la demande.
            </Text>
          </View>

          {demande ? (
            <View
              style={
                styles.statusSection
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                DERNIÈRE DEMANDE
              </Text>

              <View
                style={
                  styles.statusCard
                }
              >
                {statusPresentation ? (
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          statusPresentation.background,
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        statusPresentation.icon
                      }
                      size={14}
                      color={
                        statusPresentation.color
                      }
                    />

                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            statusPresentation.color,
                        },
                      ]}
                    >
                      {
                        statusPresentation.label
                      }
                    </Text>
                  </View>
                ) : null}

                <InfoRow
                  label="Demandée le"
                  value={formatDateTime(
                    demande.dateDemande
                  )}
                />

                {demande.motif ? (
                  <InfoRow
                    label="Motif"
                    value={
                      demande.motif
                    }
                  />
                ) : null}

                {demande.dateTraitement ? (
                  <InfoRow
                    label="Traitée le"
                    value={formatDateTime(
                      demande.dateTraitement
                    )}
                  />
                ) : null}

                {demande.commentaireAdmin ? (
                  <InfoRow
                    label="Réponse du club"
                    value={
                      demande.commentaireAdmin
                    }
                  />
                ) : null}
              </View>
            </View>
          ) : null}

          {!demandeEnAttente ? (
            <View
              style={styles.formSection}
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                VOTRE DEMANDE
              </Text>

              <View
                style={styles.formCard}
              >
                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  MOTIF
                  <Text
                    style={
                      styles.optional
                    }
                  >
                    {" "}
                    (optionnel)
                  </Text>
                </Text>

                <TextInput
                  value={motif}
                  onChangeText={setMotif}
                  editable={!sending}
                  multiline
                  maxLength={1000}
                  placeholder="Vous pouvez préciser la raison de votre demande…"
                  placeholderTextColor="#666666"
                  textAlignVertical="top"
                  style={
                    styles.textArea
                  }
                />

                <Text
                  style={
                    styles.characterCount
                  }
                >
                  {motif.length}/1000
                </Text>
              </View>

              <View
                style={styles.infoBox}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={19}
                  color={
                    COLORS.amber
                  }
                />

                <Text
                  style={
                    styles.infoText
                  }
                >
                  Certaines informations peuvent devoir être conservées pour les obligations administratives du club, même après le traitement de votre demande.
                </Text>
              </View>

              <Pressable
                onPress={
                  envoyerDemande
                }
                disabled={sending}
                style={[
                  styles.submitButton,
                  sending &&
                    styles.submitButtonDisabled,
                ]}
              >
                {sending ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.text}
                  />
                ) : (
                  <>
                    <Ionicons
                      name="send-outline"
                      size={19}
                      color={COLORS.text}
                    />

                    <Text
                      style={
                        styles.submitButtonText
                      }
                    >
                      Envoyer ma demande
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : (
            <View
              style={
                styles.waitingBox
              }
            >
              <Ionicons
                name="time-outline"
                size={20}
                color={COLORS.amber}
              />

              <Text
                style={
                  styles.waitingText
                }
              >
                Une demande est déjà en attente. Vous ne pouvez pas en envoyer une nouvelle tant qu’elle n’a pas été traitée.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={styles.infoRow}
    >
      <Text
        style={styles.infoLabel}
      >
        {label}
      </Text>

      <Text
        style={styles.infoValue}
      >
        {value}
      </Text>
    </View>
  );
}

function formatDateTime(
  value?: string | null
): string {
  if (!value) {
    return "Non renseigné";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        COLORS.background,
    },

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
      fontSize: 16,
      textAlign: "center",
      fontFamily:
        "Inter_700Bold",
    },

    headerSpacer: {
      width: 42,
    },

    content: {
      paddingHorizontal: 16,
      paddingBottom: 48,
    },

    hero: {
      alignItems: "center",
      padding: 24,
      backgroundColor:
        "#261719",
      borderWidth: 1,
      borderColor:
        "rgba(229,9,20,0.16)",
      borderRadius: 28,
    },

    heroIcon: {
      width: 60,
      height: 60,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "rgba(229,9,20,0.10)",
      borderRadius: 19,
    },

    heroEyebrow: {
      marginTop: 15,
      color:
        "rgba(229,9,20,0.82)",
      fontSize: 9,
      letterSpacing: 1.5,
      fontFamily:
        "Inter_700Bold",
    },

    heroTitle: {
      marginTop: 7,
      color: COLORS.text,
      fontSize: 21,
      textAlign: "center",
      fontFamily:
        "Inter_700Bold",
    },

    heroText: {
      maxWidth: 315,
      marginTop: 9,
      color:
        COLORS.textSecondary,
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
      fontFamily:
        "Inter_400Regular",
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

    statusSection: {
      marginTop: 24,
    },

    statusCard: {
      padding: 16,
      backgroundColor:
        COLORS.card,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius: 22,
    },

    statusBadge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 14,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 999,
    },

    statusText: {
      fontSize: 9,
      fontFamily:
        "Inter_700Bold",
    },

    infoRow: {
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor:
        "rgba(255,255,255,0.05)",
    },

    infoLabel: {
      color:
        COLORS.textMuted,
      fontSize: 9,
      fontFamily:
        "Inter_700Bold",
    },

    infoValue: {
      marginTop: 4,
      color: COLORS.text,
      fontSize: 11,
      lineHeight: 17,
      fontFamily:
        "Inter_400Regular",
    },

    formSection: {
      marginTop: 24,
    },

    formCard: {
      padding: 16,
      backgroundColor:
        COLORS.card,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius: 22,
    },

    inputLabel: {
      color:
        COLORS.textMuted,
      fontSize: 9,
      letterSpacing: 1.1,
      fontFamily:
        "Inter_700Bold",
    },

    optional: {
      color: "#666666",
      textTransform: "none",
      letterSpacing: 0,
      fontFamily:
        "Inter_400Regular",
    },

    textArea: {
      minHeight: 130,
      marginTop: 10,
      padding: 13,
      color: COLORS.text,
      backgroundColor:
        COLORS.cardSoft,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius: 15,
      fontSize: 12,
      lineHeight: 18,
      fontFamily:
        "Inter_400Regular",
    },

    characterCount: {
      marginTop: 7,
      color:
        COLORS.textMuted,
      fontSize: 9,
      textAlign: "right",
    },

    infoBox: {
      flexDirection: "row",
      alignItems:
        "flex-start",
      gap: 10,
      marginTop: 14,
      padding: 13,
      backgroundColor:
        "rgba(251,191,36,0.06)",
      borderWidth: 1,
      borderColor:
        "rgba(251,191,36,0.13)",
      borderRadius: 16,
    },

    infoText: {
      flex: 1,
      color:
        COLORS.textSecondary,
      fontSize: 10,
      lineHeight: 16,
    },

    submitButton: {
      minHeight: 54,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 18,
      backgroundColor:
        COLORS.burgundy,
      borderRadius: 17,
    },

    submitButtonDisabled: {
      opacity: 0.55,
    },

    submitButtonText: {
      color: COLORS.text,
      fontSize: 12,
      fontFamily:
        "Inter_700Bold",
    },

    waitingBox: {
      flexDirection: "row",
      alignItems:
        "flex-start",
      gap: 10,
      marginTop: 20,
      padding: 14,
      backgroundColor:
        "rgba(251,191,36,0.06)",
      borderWidth: 1,
      borderColor:
        "rgba(251,191,36,0.14)",
      borderRadius: 17,
    },

    waitingText: {
      flex: 1,
      color:
        COLORS.textSecondary,
      fontSize: 10,
      lineHeight: 16,
    },

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    loadingText: {
      marginTop: 12,
      color:
        COLORS.textSecondary,
      fontSize: 11,
    },
  });