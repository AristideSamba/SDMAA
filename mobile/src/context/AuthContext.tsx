// src/context/AuthContext.tsx

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

import api from "../services/api";

import {
  envoyerPushTokenAuBackend,
  registerForPushNotificationsAsync,
} from "../services/notificationService";

interface User {
  idUtilisateur: number;
  role: string;
}

interface JwtPayload {
  exp?: number;
  sub?: string;
  role?: string;
  idUtilisateur?: number;
}

interface AuthContextType {
  loading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;

  login: (
    token: string,
    role: string,
    idUtilisateur: number
  ) => Promise<void>;

  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

const TOKEN_KEY = "token";
const ROLE_KEY = "role";
const USER_ID_KEY = "idUtilisateur";

function isTokenValid(token: string): boolean {
  try {
    const payload =
      jwtDecode<JwtPayload>(token);

    if (!payload.exp) {
      return false;
    }

    const currentTime =
      Math.floor(Date.now() / 1000);

    return payload.exp > currentTime;
  } catch (error) {
    console.error(
      "Impossible de décoder le JWT :",
      error
    );

    return false;
  }
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [loading, setLoading] =
    useState(true);

  const [token, setToken] =
    useState<string | null>(null);

  const [user, setUser] =
    useState<User | null>(null);

  const logoutInProgress =
    useRef(false);

  const synchroniserPushToken =
    useCallback(
      async (): Promise<void> => {
        try {
          const expoPushToken =
            await registerForPushNotificationsAsync();

          if (!expoPushToken) {
            console.log(
              "Aucun token push Expo disponible."
            );

            return;
          }

          await envoyerPushTokenAuBackend(
            expoPushToken
          );

          console.log(
            "Token push synchronisé avec le backend."
          );
        } catch (error) {
          console.error(
            "Impossible de synchroniser le token push :",
            error
          );
        }
      },
      []
    );

  const clearAuthStorage =
    useCallback(
      async (): Promise<void> => {
        await AsyncStorage.multiRemove([
          TOKEN_KEY,
          ROLE_KEY,
          USER_ID_KEY,
        ]);
      },
      []
    );

  const logout =
    useCallback(
      async (): Promise<void> => {
        try {
          await clearAuthStorage();
        } catch (error) {
          console.error(
            "Erreur pendant la suppression de la session :",
            error
          );
        } finally {
          setToken(null);
          setUser(null);
        }
      },
      [clearAuthStorage]
    );

  const login =
    useCallback(
      async (
        newToken: string,
        role: string,
        idUtilisateur: number
      ): Promise<void> => {
        if (!newToken) {
          throw new Error(
            "Le token reçu est absent."
          );
        }

        if (!isTokenValid(newToken)) {
          throw new Error(
            "Le token reçu est invalide ou expiré."
          );
        }

        if (!role) {
          throw new Error(
            "Le rôle de l'utilisateur est absent."
          );
        }

        if (
          !Number.isFinite(idUtilisateur) ||
          idUtilisateur <= 0
        ) {
          throw new Error(
            "L'identifiant utilisateur est invalide."
          );
        }

        await AsyncStorage.multiSet([
          [TOKEN_KEY, newToken],
          [ROLE_KEY, role],
          [
            USER_ID_KEY,
            idUtilisateur.toString(),
          ],
        ]);

        setToken(newToken);

        setUser({
          idUtilisateur,
          role,
        });

        await synchroniserPushToken();
      },
      [synchroniserPushToken]
    );

  useEffect(() => {
    async function loadUser(): Promise<void> {
      try {
        const values =
          await AsyncStorage.multiGet([
            TOKEN_KEY,
            ROLE_KEY,
            USER_ID_KEY,
          ]);

        const savedToken =
          values[0][1];

        const savedRole =
          values[1][1];

        const savedUserId =
          values[2][1];

        const parsedUserId =
          Number(savedUserId);

        const completeSession =
          Boolean(savedToken) &&
          Boolean(savedRole) &&
          Boolean(savedUserId) &&
          Number.isFinite(parsedUserId) &&
          parsedUserId > 0;

        if (
          !completeSession ||
          !savedToken ||
          !savedRole
        ) {
          await clearAuthStorage();

          setToken(null);
          setUser(null);

          return;
        }

        if (!isTokenValid(savedToken)) {
          console.warn(
            "Token expiré détecté au démarrage."
          );

          await clearAuthStorage();

          setToken(null);
          setUser(null);

          return;
        }

        setToken(savedToken);

        setUser({
          idUtilisateur: parsedUserId,
          role: savedRole,
        });

        await synchroniserPushToken();
      } catch (error) {
        console.error(
          "Erreur pendant la restauration de la session :",
          error
        );

        try {
          await clearAuthStorage();
        } catch (storageError) {
          console.error(
            "Erreur pendant le nettoyage du stockage :",
            storageError
          );
        }

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [
    clearAuthStorage,
    synchroniserPushToken,
  ]);

  useEffect(() => {
    const responseInterceptor =
      api.interceptors.response.use(
        (response) => response,

        async (error) => {
          const status =
            error.response?.status;

          if (
            status === 401 &&
            !logoutInProgress.current
          ) {
            logoutInProgress.current =
              true;

            try {
              console.warn(
                "Session expirée ou invalide : déconnexion automatique."
              );

              await logout();
            } catch (logoutError) {
              console.error(
                "Erreur pendant la déconnexion automatique :",
                logoutError
              );
            } finally {
              logoutInProgress.current =
                false;
            }
          }

          return Promise.reject(error);
        }
      );

    return () => {
      api.interceptors.response.eject(
        responseInterceptor
      );
    };
  }, [logout]);

  const isAuthenticated =
    Boolean(token) && Boolean(user);

  const authContextValue: AuthContextType = {
    loading,
    isAuthenticated,
    token,
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider
      value={authContextValue}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth doit être utilisé dans AuthProvider."
    );
  }

  return context;
}