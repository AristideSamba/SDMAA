// src/services/api.ts

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim();

if (!API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL est absente. Vérifie le fichier .env ou les variables EAS."
  );
}

console.log(
  "API mobile utilisée :",
  API_URL
);

const api = axios.create({
  baseURL: API_URL,
  timeout: 90000,

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/**
 * Ajoute automatiquement le JWT
 * à chaque requête authentifiée.
 */
api.interceptors.request.use(
  async (config) => {
    const token =
      await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    console.log(
      "Requête API :",
      config.method?.toUpperCase(),
      `${config.baseURL ?? ""}${config.url ?? ""}`
    );

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Ajoute des informations utiles
 * lorsque la requête échoue.
 */
api.interceptors.response.use(
  (response) => response,

  (error) => {
    console.error(
      "Erreur Axios :",
      {
        message: error?.message,
        code: error?.code,
        baseURL: error?.config?.baseURL,
        url: error?.config?.url,
        method: error?.config?.method,
        status: error?.response?.status,
        data: error?.response?.data,
      }
    );

    return Promise.reject(error);
  }
);

export default api;