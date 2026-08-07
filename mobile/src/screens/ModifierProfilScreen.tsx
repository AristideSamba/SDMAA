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
  KeyboardAvoidingView,
  Platform,
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

import * as ImagePicker from "expo-image-picker";

import type {
  RootStackParamList,
} from "../navigation/RootNavigator";

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
  photoUrl?: string;
}

interface ImageUploadResponse {
  chemin: string;
  url: string;
}

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const COLORS = {
  background: "#121212",
  card: "#1B1B1B",
  cardSoft: "#292929",
  border: "#303030",
  text: "#FFFFFF",
  textSecondary: "#B3B3B3",
  textMuted: "#7C7C7C",
  red: "#E50914",
  green: "#1DB954",
};

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function ModifierProfilScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  const isFocused = useIsFocused();

  const [
    profil,
    setProfil,
  ] = useState<ProfilUtilisateur | null>(null);

  const [
    nom,
    setNom,
  ] = useState("");

  const [
    prenom,
    setPrenom,
  ] = useState("");

  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");

  const [
    photoUrl,
    setPhotoUrl,
  ] = useState<string | undefined>();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    uploadingPhoto,
    setUploadingPhoto,
  ] = useState(false);

  const [
    deletingPhoto,
    setDeletingPhoto,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /**
   * Charge les informations actuelles du profil.
   */
  const fetchProfile =
    useCallback(async (): Promise<void> => {
      try {
        setError("");

        const response =
          await api.get<ProfilUtilisateur>(
            "/utilisateurs/me"
          );

        const profileData = response.data;

        setProfil(profileData);
        setNom(profileData.nom || "");
        setPrenom(profileData.prenom || "");
        setEmail(profileData.email || "");
        setTelephone(profileData.telephone || "");
        setAdresse(profileData.adresse || "");
        setDateNaissance(profileData.dateNaissance || "");

        setPhotoUrl(
          resolveImageUrl(profileData.photoUrl)
        );
      } catch (requestError) {
        console.error(
          "Erreur pendant le chargement du profil :",
          requestError
        );

        setError(
          "Impossible de charger votre profil."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    if (isFocused) {
      fetchProfile();
    }
  }, [
    fetchProfile,
    isFocused,
  ]);

  const displayName = useMemo(() => {
    const completeName = [
      prenom.trim(),
      nom.trim(),
    ]
      .filter(Boolean)
      .join(" ");

    return (
      completeName ||
      profil?.nomComplet ||
      "Membre SDMAA"
    );
  }, [
    nom,
    prenom,
    profil?.nomComplet,
  ]);

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

  /**
   * Ouvre la galerie du téléphone et envoie
   * immédiatement la photo au backend.
   */
  const handleChoosePhoto =
    useCallback(async (): Promise<void> => {
      try {
        const permission =
          await ImagePicker
            .requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Autorisation nécessaire",
            "Autorisez l’accès à vos photos pour modifier votre photo de profil."
          );

          return;
        }

        const result =
          await ImagePicker.launchImageLibraryAsync({
            mediaTypes:
              ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

        if (result.canceled) {
          return;
        }

        const selectedImage =
          result.assets[0];

        if (!selectedImage?.uri) {
          throw new Error(
            "Aucune image sélectionnée."
          );
        }

        await uploadPhoto({
          uri: selectedImage.uri,
          fileName:
            selectedImage.fileName ||
            createImageFileName(
              selectedImage.uri
            ),
          mimeType:
            selectedImage.mimeType ||
            getMimeType(
              selectedImage.uri
            ),
        });
      } catch (selectionError) {
        console.error(
          "Erreur pendant la sélection de la photo :",
          selectionError
        );

        Alert.alert(
          "Erreur",
          getErrorMessage(
            selectionError,
            "Impossible de sélectionner cette photo."
          )
        );
      }
    }, []);

  /**
   * Envoie la photo avec multipart/form-data.
   */
  const uploadPhoto = async ({
  uri,
  fileName,
  mimeType,
}: {
  uri: string;
  fileName: string;
  mimeType: string;
}): Promise<void> => {
  try {
    setUploadingPhoto(true);

    const formData = new FormData();

    formData.append(
      "photo",
      {
        uri,
        name: fileName,
        type: mimeType,
      } as unknown as Blob
    );

    const response =
      await api.post<ImageUploadResponse>(
        "/utilisateurs/me/photo",
        formData,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
          

          /*
           * Empêche Axios ou un interceptor de transformer
           * le FormData en JSON.
           */
          transformRequest: (data) => data,
          
        }
      );
console.log("Réponse upload photo :", response.data);
    const nouvellePhoto =
      response.data.url ||
      response.data.chemin;

    setPhotoUrl(
      resolveImageUrl(nouvellePhoto)
    );

    setProfil((previous) =>
      previous
        ? {
            ...previous,
            photoUrl: nouvellePhoto,
          }
        : previous
    );

    Alert.alert(
      "Photo mise à jour",
      "Votre nouvelle photo de profil a bien été enregistrée."
    );
  } catch (uploadError) {
    console.error(
      "Erreur pendant l’upload de la photo :",
      uploadError
    );

    Alert.alert(
      "Erreur",
      getErrorMessage(
        uploadError,
        "Impossible d’envoyer la photo."
      )
    );
  } finally {
    setUploadingPhoto(false);
  }
};

  /**
   * Supprime la photo du serveur et de la base.
   */
  const handleDeletePhoto =
    useCallback(() => {
      Alert.alert(
        "Supprimer la photo",
        "Voulez-vous supprimer votre photo de profil ?",
        [
          {
            text: "Annuler",
            style: "cancel",
          },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: async () => {
              try {
                setDeletingPhoto(true);

                await api.delete(
                  "/utilisateurs/me/photo"
                );

                setPhotoUrl(undefined);

                Alert.alert(
                  "Photo supprimée",
                  "Votre photo de profil a été supprimée."
                );
              } catch (deleteError) {
                console.error(
                  "Erreur pendant la suppression de la photo :",
                  deleteError
                );

                Alert.alert(
                  "Erreur",
                  getErrorMessage(
                    deleteError,
                    "Impossible de supprimer la photo."
                  )
                );
              } finally {
                setDeletingPhoto(false);
              }
            },
          },
        ]
      );
    }, []);

  /**
   * Enregistre les informations personnelles modifiables.
   */
  const handleSave =
    useCallback(async (): Promise<void> => {
      const cleanedNom = nom.trim();
      const cleanedPrenom = prenom.trim();
      const cleanedEmail = email.trim().toLowerCase();
      const cleanedTelephone = telephone.trim();
      const cleanedAdresse = adresse.trim();

      if (!cleanedNom) {
        Alert.alert("Nom obligatoire", "Veuillez renseigner votre nom.");
        return;
      }

      if (!cleanedPrenom) {
        Alert.alert("Prénom obligatoire", "Veuillez renseigner votre prénom.");
        return;
      }

      if (!isValidEmail(cleanedEmail)) {
        Alert.alert("Email invalide", "Veuillez renseigner une adresse email valide.");
        return;
      }

      if (cleanedTelephone && !isValidPhone(cleanedTelephone)) {
        Alert.alert("Téléphone invalide", "Veuillez renseigner un numéro valide.");
        return;
      }

      try {
        setSaving(true);

        const response = await api.put<ProfilUtilisateur>(
          "/utilisateurs/me",
          {
            nom: cleanedNom,
            prenom: cleanedPrenom,
            email: cleanedEmail,
            telephone: cleanedTelephone || null,
            adresse: cleanedAdresse || null,
          }
        );

        setProfil(response.data);

        Alert.alert(
          "Profil enregistré",
          "Vos informations ont bien été mises à jour.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } catch (saveError) {
        console.error("Erreur pendant la modification du profil :", saveError);
        Alert.alert(
          "Erreur",
          getErrorMessage(
            saveError,
            "Impossible d’enregistrer vos modifications."
          )
        );
      } finally {
        setSaving(false);
      }
    }, [adresse, email, navigation, nom, prenom, telephone]);

  const handleGoBack =
    useCallback(() => {
      navigation.goBack();
    }, [navigation]);

  const actionInProgress =
    uploadingPhoto ||
    deletingPhoto ||
    saving;

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom"]}
      >
        <StatusBar
          style="light"
          animated
        />

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={COLORS.text}
          />

          <Text style={styles.loadingText}>
            Chargement du profil...
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
      <StatusBar
        style="light"
        animated
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View style={styles.header}>
          <Pressable
            onPress={handleGoBack}
            accessibilityRole="button"
            accessibilityLabel="Retour au profil"
            style={({ pressed }) => [
              styles.headerButton,
              pressed &&
                styles.headerButtonPressed,
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={COLORS.text}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Modifier mon profil
          </Text>

          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {error ? (
            <View style={styles.errorCard}>
              <Ionicons
                name="alert-circle-outline"
                size={22}
                color={COLORS.red}
              />

              <View style={styles.errorContent}>
                <Text style={styles.errorText}>
                  {error}
                </Text>

                <Pressable
                  onPress={fetchProfile}
                >
                  <Text style={styles.retryText}>
                    Réessayer
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <LinearGradient
            colors={[
              "#343434",
              "#202020",
              "#171717",
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={styles.photoCard}
          >
            <Text style={styles.sectionEyebrow}>
              PHOTO DE PROFIL
            </Text>

            <View style={styles.avatarContainer}>
              {photoUrl ? (
                <Image
                  source={{
                    uri: photoUrl,
                  }}
                  style={styles.avatarImage}
                  accessibilityLabel={
                    `Photo de profil de ${displayName}`
                  }
                />
              ) : (
                <LinearGradient
                  colors={[
                    "#4A4A4A",
                    "#252525",
                  ]}
                  style={styles.avatarFallback}
                >
                  <Text
                    style={styles.avatarInitials}
                  >
                    {initials}
                  </Text>
                </LinearGradient>
              )}

              {uploadingPhoto ? (
                <View style={styles.avatarLoader}>
                  <ActivityIndicator
                    size="small"
                    color={COLORS.text}
                  />
                </View>
              ) : null}
            </View>

            <Text style={styles.profileName}>
              {displayName}
            </Text>

            <View style={styles.photoActions}>
              <Pressable
                onPress={handleChoosePhoto}
                disabled={actionInProgress}
                accessibilityRole="button"
                accessibilityLabel="Changer la photo de profil"
                style={({ pressed }) => [
                  styles.changePhotoButton,
                  pressed &&
                    styles.buttonPressed,
                  actionInProgress &&
                    styles.buttonDisabled,
                ]}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.text}
                  />
                ) : (
                  <Ionicons
                    name="camera-outline"
                    size={19}
                    color={COLORS.text}
                  />
                )}

                <Text
                  style={
                    styles.changePhotoButtonText
                  }
                >
                  Changer la photo
                </Text>
              </Pressable>

              {photoUrl ? (
                <Pressable
                  onPress={handleDeletePhoto}
                  disabled={actionInProgress}
                  accessibilityRole="button"
                  accessibilityLabel="Supprimer la photo de profil"
                  style={({ pressed }) => [
                    styles.deletePhotoButton,
                    pressed &&
                      styles.buttonPressed,
                    actionInProgress &&
                      styles.buttonDisabled,
                  ]}
                >
                  {deletingPhoto ? (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.red}
                    />
                  ) : (
                    <Ionicons
                      name="trash-outline"
                      size={19}
                      color={COLORS.red}
                    />
                  )}
                </Pressable>
              ) : null}
            </View>

            <Text style={styles.photoHint}>
              Formats acceptés : JPG, PNG ou WEBP.
              Taille maximale : 5 Mo.
            </Text>
          </LinearGradient>

          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Informations personnelles
              </Text>

              <Text style={styles.sectionSubtitle}>
                Modifiez vos informations de contact
              </Text>
            </View>

            <View style={styles.formCard}>
              <FormField label="Prénom" icon="person-outline" value={prenom} onChangeText={setPrenom} placeholder="Votre prénom" autoCapitalize="words" />
              <View style={styles.divider} />
              <FormField label="Nom" icon="person-outline" value={nom} onChangeText={setNom} placeholder="Votre nom" autoCapitalize="characters" />
              <View style={styles.divider} />
              <FormField label="Adresse email" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="exemple@email.com" autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
              <View style={styles.divider} />
              <FormField label="Téléphone" icon="call-outline" value={telephone} onChangeText={setTelephone} placeholder="Votre numéro de téléphone" autoCapitalize="none" keyboardType="phone-pad" autoComplete="tel" />
              <View style={styles.divider} />
              <FormField label="Adresse" icon="location-outline" value={adresse} onChangeText={setAdresse} placeholder="Votre adresse" autoCapitalize="sentences" multiline />
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Information d’identité</Text>
              <Text style={styles.sectionSubtitle}>Cette information ne peut pas être modifiée</Text>
            </View>
            <View style={styles.formCard}>
              <ReadOnlyField label="Date de naissance" icon="calendar-outline" value={formatDate(dateNaissance)} />
            </View>
          </View>

          <Pressable
            onPress={handleSave}
            disabled={actionInProgress}
            accessibilityRole="button"
            accessibilityLabel="Enregistrer les modifications"
            style={({ pressed }) => [
              styles.saveButton,
              pressed &&
                styles.saveButtonPressed,
              actionInProgress &&
                styles.buttonDisabled,
            ]}
          >
            {saving ? (
              <ActivityIndicator
                size="small"
                color={COLORS.text}
              />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={21}
                  color={COLORS.text}
                />

                <Text style={styles.saveButtonText}>
                  Enregistrer
                </Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/*                               FORM COMPONENT                               */
/* -------------------------------------------------------------------------- */

interface FormFieldProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  autoCapitalize?:
    | "none"
    | "sentences"
    | "words"
    | "characters";
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoComplete?: "email" | "tel" | "off";
  multiline?: boolean;
}

function FormField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = "words",
  keyboardType = "default",
  autoComplete = "off",
  multiline = false,
}: FormFieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldIcon}>
        <Ionicons
          name={icon}
          size={20}
          color={COLORS.text}
        />
      </View>

      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>
          {label}
        </Text>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
          selectionColor={COLORS.text}
        />
      </View>
    </View>
  );
}

function ReadOnlyField({
  label,
  icon,
  value,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
}) {
  return (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldIcon}>
        <Ionicons name={icon} size={20} color={COLORS.textMuted} />
      </View>
      <View style={styles.fieldContent}>
        <View style={styles.readOnlyLabelRow}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Ionicons name="lock-closed-outline" size={13} color={COLORS.textMuted} />
        </View>
        <Text style={styles.readOnlyValue}>{value}</Text>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

/**
 * Transforme le chemin enregistré en base :
 *
 * profils/photo.jpg
 *
 * en URL :
 *
 * http://adresse-backend/uploads/profils/photo.jpg
 */
function resolveImageUrl(
  value?: string
): string | undefined {
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

  const baseUrl =
    String(
      api.defaults.baseURL || ""
    )
      .replace(/\/api\/?$/, "")
      .replace(/\/$/, "");

  const cleanedPath =
    cleanedValue
      .replace(/^\/+/, "")
      .replace(/^uploads\//, "");

  return (
    `${baseUrl}/uploads/${cleanedPath}`
  );
}

function createImageFileName(
  uri: string
): string {
  const lastPart =
    uri.split("/").pop();

  if (
    lastPart &&
    lastPart.includes(".")
  ) {
    return lastPart;
  }

  return `profil-${Date.now()}.jpg`;
}

function getMimeType(
  uri: string
): string {
  const extension =
    uri
      .split(".")
      .pop()
      ?.toLowerCase();

  switch (extension) {
    case "png":
      return "image/png";

    case "webp":
      return "image/webp";

    case "jpeg":
    case "jpg":
    default:
      return "image/jpeg";
  }
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string): boolean {
  return /^[0-9+().\s-]{6,25}$/.test(value);
}

function formatDate(value?: string): string {
  if (!value) return "Non renseignée";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response =
      (
        error as {
          response?: {
            data?: {
              message?: string;
              error?: string;
            } | string;
          };
        }
      ).response;

    if (
      typeof response?.data ===
      "string"
    ) {
      return response.data;
    }

    if (response?.data?.message) {
      return response.data.message;
    }

    if (response?.data?.error) {
      return response.data.error;
    }
  }

  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  return fallbackMessage;
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

  keyboardContainer: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 14,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    paddingHorizontal: 16,
  },

  headerButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
  },

  headerButtonPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.94,
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

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    padding: 15,
    backgroundColor: "#2B1D1F",
    borderWidth: 1,
    borderColor: "#583034",
    borderRadius: 18,
  },

  errorContent: {
    flex: 1,
  },

  errorText: {
    color: "#F1B5B9",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
  },

  retryText: {
    marginTop: 6,
    color: COLORS.text,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },

  photoCard: {
    alignItems: "center",
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "#393939",
    borderRadius: 30,
  },

  sectionEyebrow: {
    marginBottom: 20,
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 1.7,
    fontFamily: "Inter_700Bold",
  },

  avatarContainer: {
    position: "relative",
    width: 142,
    height: 142,
    padding: 4,
    backgroundColor:
      "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.11)",
    borderRadius: 71,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    backgroundColor:
      COLORS.cardSoft,
    borderRadius: 67,
  },

  avatarFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 67,
  },

  avatarInitials: {
    color: COLORS.text,
    fontSize: 38,
    fontFamily: "Inter_700Bold",
  },

  avatarLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(0,0,0,0.55)",
    borderRadius: 71,
  },

  profileName: {
    marginTop: 17,
    color: COLORS.text,
    fontSize: 22,
    textAlign: "center",
    fontFamily: "Inter_700Bold",
  },

  photoActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },

  changePhotoButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 18,
    backgroundColor: COLORS.cardSoft,
    borderWidth: 1,
    borderColor: "#3B3B3B",
    borderRadius: 16,
  },

  changePhotoButtonText: {
    color: COLORS.text,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },

  deletePhotoButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2B1D1F",
    borderWidth: 1,
    borderColor: "#583034",
    borderRadius: 16,
  },

  photoHint: {
    marginTop: 15,
    color: COLORS.textMuted,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },

  formSection: {
    marginTop: 28,
  },

  sectionHeader: {
    marginBottom: 12,
    paddingHorizontal: 2,
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

  formCard: {
    overflow: "hidden",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
  },

  fieldContainer: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  fieldIcon: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      COLORS.cardSoft,
    borderRadius: 14,
  },

  fieldContent: {
    flex: 1,
    marginLeft: 13,
  },

  fieldLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },

  fieldInput: {
    minHeight: 38,
    marginTop: 2,
    paddingVertical: 5,
    color: COLORS.text,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },

  divider: {
    height: 1,
    marginLeft: 71,
    backgroundColor:
      COLORS.border,
  },

  fieldInputMultiline: {
    minHeight: 72,
    paddingTop: 10,
  },

  readOnlyLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  readOnlyValue: {
    marginTop: 7,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },

  saveButton: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 28,
    backgroundColor: COLORS.red,
    borderRadius: 18,
  },

  saveButtonPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  saveButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },

  buttonPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  buttonDisabled: {
    opacity: 0.5,
  },
});