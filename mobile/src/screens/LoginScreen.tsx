import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
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
  StatusBar,
} from "expo-status-bar";

import {
  Ionicons,
} from "@expo/vector-icons";

import axios from "axios";

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface LoginResponse {
  token: string;
  role: string;
  idUtilisateur: number;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const COLORS = {
  background: "#121212",
  surface: "#1B1B1B",
  surfaceSoft: "#232323",
  border: "#303030",
  text: "#FFFFFF",
  textSecondary: "#B3B3B3",
  textMuted: "#7C7C7C",
  burgundy: "#800020",
  burgundyPressed: "#69001A",
  error: "#FF6B75",
  errorBackground: "#2A181A",
};

export default function LoginScreen() {
  const { login } = useAuth();

  const scrollViewRef =
    useRef<ScrollView>(null);

  const emailInputRef =
    useRef<TextInput>(null);

  const passwordInputRef =
    useRef<TextInput>(null);

  const scrollTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    const keyboardHideEvent =
      Platform.OS === "ios"
        ? "keyboardWillHide"
        : "keyboardDidHide";

    const subscription = Keyboard.addListener(
      keyboardHideEvent,
      () => {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(
          () => {
            scrollViewRef.current?.scrollTo({
              y: 0,
              animated: true,
            });
          },
          Platform.OS === "ios" ? 80 : 120
        );
      }
    );

    return () => {
      subscription.remove();

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const scrollToInput = (y: number): void => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(
      () => {
        scrollViewRef.current?.scrollTo({
          y,
          animated: true,
        });
      },
      Platform.OS === "ios" ? 150 : 220
    );
  };

  const handleForgotPassword = (): void => {
    Alert.alert(
      "Mot de passe oublié",
      "La récupération du mot de passe sera bientôt disponible."
    );
  };

  const handleRegister = (): void => {
    Alert.alert(
      "Créer un compte",
      "L’écran d’inscription sera bientôt disponible."
    );
  };

  const handleSubmit =
    async (): Promise<void> => {
      if (loading) {
        return;
      }

      setError("");

      const normalizedEmail =
        email.trim().toLowerCase();

      if (!normalizedEmail) {
        setError(
          "Veuillez renseigner votre adresse email."
        );
        emailInputRef.current?.focus();
        scrollToInput(120);
        return;
      }

      if (!motDePasse) {
        setError(
          "Veuillez renseigner votre mot de passe."
        );
        passwordInputRef.current?.focus();
        scrollToInput(210);
        return;
      }

      Keyboard.dismiss();
      setLoading(true);

      try {
        const response =
          await api.post<LoginResponse>(
            "/auth/login",
            {
              email: normalizedEmail,
              motDePasse,
            }
          );

        const {
          token,
          role,
          idUtilisateur,
        } = response.data;

        if (
          !token ||
          !role ||
          idUtilisateur === undefined ||
          idUtilisateur === null
        ) {
          throw new Error(
            "La réponse du serveur est incomplète."
          );
        }

        await login(
          token,
          role,
          idUtilisateur
        );
      } catch (err: unknown) {
        console.error(
          "Erreur de connexion :",
          err
        );

        if (
          axios.isAxiosError<ApiErrorResponse>(
            err
          )
        ) {
          if (!err.response) {
            setError(
              "Impossible de joindre le serveur. Vérifiez votre connexion et que le backend est démarré."
            );
            return;
          }

          if (
            err.response.status === 401 ||
            err.response.status === 403
          ) {
            setError(
              "Adresse email ou mot de passe incorrect."
            );
            return;
          }

          setError(
            err.response.data?.message ||
              err.response.data?.error ||
              "Une erreur est survenue pendant la connexion."
          );
          return;
        }

        if (err instanceof Error) {
          setError(err.message);
          return;
        }

        setError(
          "Une erreur inattendue est survenue."
        );
      } finally {
        setLoading(false);
      }
    };

  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <StatusBar style="light" />
        <ActivityIndicator
          size="large"
          color={COLORS.text}
        />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      <StatusBar
        style="light"
        backgroundColor={COLORS.background}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={
            styles.scrollContainer
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios"
              ? "interactive"
              : "on-drag"
          }
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
        >
          <View style={styles.content}>
            <View style={styles.brandSection}>
              <View style={styles.logoShell}>
                <Image
                  source={require(
                    "../../assets/sdmma.png"
                  )}
                  style={styles.logo}
                  resizeMode="cover"
                  accessible
                  accessibilityLabel="Logo du club Saint Denis Martial Art Academy"
                />
              </View>

              <Text style={styles.clubName}>
                SDMAA
              </Text>

              <Text style={styles.clubSubtitle}>
                SAINT DENIS MARTIAL ART ACADEMY
              </Text>
            </View>

            <View style={styles.headingSection}>
              <Text style={styles.title}>
                Bon retour
              </Text>

              <Text style={styles.description}>
                Connectez-vous à votre espace membre.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Adresse email
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    error &&
                      !email.trim() &&
                      styles.inputContainerError,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={COLORS.textMuted}
                  />

                  <TextInput
                    ref={emailInputRef}
                    style={styles.input}
                    placeholder="exemple@email.com"
                    placeholderTextColor={
                      COLORS.textMuted
                    }
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      setError("");
                    }}
                    onFocus={() =>
                      scrollToInput(100)
                    }
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    editable={!loading}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      passwordInputRef.current?.focus();
                    }}
                    accessibilityLabel="Adresse email"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>
                    Mot de passe
                  </Text>

                  <Pressable
                    onPress={handleForgotPassword}
                    disabled={loading}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Mot de passe oublié"
                  >
                    <Text
                      style={
                        styles.forgotPasswordText
                      }
                    >
                      Mot de passe oublié ?
                    </Text>
                  </Pressable>
                </View>

                <View
                  style={[
                    styles.inputContainer,
                    error &&
                      !motDePasse &&
                      styles.inputContainerError,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={COLORS.textMuted}
                  />

                  <TextInput
                    ref={passwordInputRef}
                    style={styles.input}
                    placeholder="Votre mot de passe"
                    placeholderTextColor={
                      COLORS.textMuted
                    }
                    value={motDePasse}
                    onChangeText={(value) => {
                      setMotDePasse(value);
                      setError("");
                    }}
                    onFocus={() =>
                      scrollToInput(190)
                    }
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    textContentType="password"
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    accessibilityLabel="Mot de passe"
                  />

                  <Pressable
                    onPress={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    disabled={loading}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? "eye-off-outline"
                          : "eye-outline"
                      }
                      size={21}
                      color={COLORS.textSecondary}
                    />
                  </Pressable>
                </View>
              </View>

              {error ? (
                <View
                  style={styles.errorBox}
                  accessibilityRole="alert"
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={19}
                    color={COLORS.error}
                  />

                  <Text style={styles.errorText}>
                    {error}
                  </Text>
                </View>
              ) : null}

              <Pressable
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed &&
                    !loading &&
                    styles.loginButtonPressed,
                  loading &&
                    styles.loginButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Se connecter"
                accessibilityState={{
                  disabled: loading,
                  busy: loading,
                }}
              >
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.text}
                  />
                ) : (
                  <Text style={styles.loginButtonText}>
                    Se connecter
                  </Text>
                )}
              </Pressable>
            </View>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>
                Pas encore de compte ?
              </Text>

              <Pressable
                onPress={handleRegister}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Créer un compte"
              >
                <Text style={styles.registerLink}>
                  S’inscrire
                </Text>
              </Pressable>
            </View>

            <Text style={styles.footerText}>
              Accès sécurisé réservé aux membres du club
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboardContainer: {
    flex: 1,
  },

  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 30,
  },

  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },

  brandSection: {
    alignItems: "center",
  },

  logoShell: {
    width: 94,
    height: 94,
    padding: 4,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 47,
  },

  logo: {
    width: "100%",
    height: "100%",
    borderRadius: 43,
  },

  clubName: {
    marginTop: 16,
    color: COLORS.text,
    fontSize: 18,
    letterSpacing: 3,
    fontFamily: "Inter_700Bold",
  },

  clubSubtitle: {
    marginTop: 5,
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 1.5,
    textAlign: "center",
    fontFamily: "Inter_600SemiBold",
  },

  headingSection: {
    marginTop: 36,
    marginBottom: 28,
  },

  title: {
    color: COLORS.text,
    fontSize: 30,
    lineHeight: 36,
    textAlign: "center",
    fontFamily: "Inter_700Bold",
  },

  description: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },

  form: {
    gap: 18,
  },

  fieldGroup: {
    gap: 8,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  inputContainer: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
  },

  inputContainerError: {
    borderColor: COLORS.error,
  },

  input: {
    flex: 1,
    minHeight: 56,
    paddingVertical: 0,
    color: COLORS.text,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },

  eyeButton: {
    minWidth: 32,
    minHeight: 42,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  forgotPasswordText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.errorBackground,
    borderRadius: 15,
  },

  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Inter_500Medium",
  },

  loginButton: {
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    backgroundColor: COLORS.burgundy,
    borderRadius: 18,
  },

  loginButtonPressed: {
    backgroundColor: COLORS.burgundyPressed,
    transform: [{ scale: 0.99 }],
  },

  loginButtonDisabled: {
    opacity: 0.62,
  },

  loginButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },

  registerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 24,
  },

  registerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },

  registerLink: {
    color: COLORS.text,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },

  footerText: {
    marginTop: 38,
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
});