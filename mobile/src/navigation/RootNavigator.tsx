// src/navigation/RootNavigator.tsx

import React from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";

import ActiviteDetailsScreen from "../screens/ActiviteDetailsScreen";
import AnnonceDetailsScreen from "../screens/AnnonceDetailsScreen";
import NotificationsParametresScreen from "../screens/NotificationsParametresScreen";
import ConfidentialiteScreen from "../screens/ConfidentialiteScreen";
import ParametresScreen from "../screens/ParametresScreen";
import ChangerMotDePasseScreen from "../screens/ChangerMotDePasseScreen";
import ModifierProfilScreen from "../screens/ModifierProfilScreen";
import LoginScreen from "../screens/LoginScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import MesEngagementsScreen from "../screens/MesEngagementsScreen";
import MesCommandesScreen from "../screens/MesCommandesScreen";
import PolitiqueConfidentialiteScreen from "../screens/PolitiqueConfidentialiteScreen";
import ConditionsUtilisationScreen from "../screens/ConditionsUtilisationScreen";
import DemandeSuppressionCompteScreen from "../screens/DemandeSuppressionCompteScreen";

import BottomTabNavigator from "./BottomTabs";

/**
 * Liste de toutes les routes disponibles
 * dans le navigateur principal.
 */
export type RootStackParamList = {
  Login: undefined;

  /**
   * Navigation principale contenant
   * les onglets du bas.
   */
  Main: undefined;

  /**
   * Écran affichant les notifications
   * de l'utilisateur connecté.
   */
  Notifications: undefined;

  /**
   * Écran affichant les activités,
   * stages et compétitions auxquels
   * l'utilisateur est inscrit.
   */
  MesEngagements: undefined;

  /**
   * Écran affichant les achats
   * et les emprunts de l'utilisateur.
   */
  MesCommandes: undefined;

  /**
   * Écran de modification du profil.
   */
  ModifierProfil: undefined;

  /**
   * Écrans des paramètres.
   */
  Parametres: undefined;
  ChangerMotDePasse: undefined;
  NotificationsParametres: undefined;
  Confidentialite: undefined;
  PolitiqueConfidentialite: undefined;
  ConditionsUtilisation: undefined;
  DemandeSuppressionCompte: undefined;

  /**
   * Détail d'une activité.
   */
  ActiviteDetails: {
    activiteId: number;
  };

  /**
   * Détail d'une annonce.
   *
   * DashboardScreen envoie actuellement
   * l'identifiant et parfois l'objet annonce.
   */
  AnnonceDetails: {
    annonceId: number;
    annonce?: {
      id: number;
      titre?: string;
      message?: string;
      contenu?: string;
      image?: string;
      imageUrl?: string;
      statut?: string;
      datePublication?: string;
      dateCreation?: string;
      dateModification?: string;
      auteurId?: number;
      auteurNom?: string;
      createdAt?: string;
      lue?: boolean;
    };
  };
};

const Stack =
  createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const {
    loading,
    isAuthenticated,
  } = useAuth();

  /**
   * Pendant la restauration de la session,
   * on affiche un écran de chargement.
   */
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#800020"
        />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: {
          backgroundColor: "#121212",
        },
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen
            name="Main"
            component={BottomTabNavigator}
          />

          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              animation: "slide_from_right",
            }}
          />

          <Stack.Screen
            name="MesEngagements"
            component={MesEngagementsScreen}
            options={{
              animation: "slide_from_right",
            }}
          />

          <Stack.Screen
            name="MesCommandes"
            component={MesCommandesScreen}
            options={{
              animation: "slide_from_right",
            }}
          />

          <Stack.Screen
            name="ActiviteDetails"
            component={ActiviteDetailsScreen}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="AnnonceDetails"
            component={AnnonceDetailsScreen}
            options={{
              headerShown: false,
              presentation: "card",
              animation: "slide_from_right",
            }}
          />

          <Stack.Screen
            name="ModifierProfil"
            component={ModifierProfilScreen}
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="Parametres"
            component={ParametresScreen}
          />

          <Stack.Screen
            name="ChangerMotDePasse"
            component={ChangerMotDePasseScreen}
          />

          <Stack.Screen
            name="NotificationsParametres"
            component={
              NotificationsParametresScreen
            }
          />

          <Stack.Screen
            name="Confidentialite"
            component={
              ConfidentialiteScreen}
          />

          <Stack.Screen
          name="PolitiqueConfidentialite"
          component={PolitiqueConfidentialiteScreen}
          />

          <Stack.Screen
            name="ConditionsUtilisation"
            component={ConditionsUtilisationScreen}
          />

          <Stack.Screen
  name="DemandeSuppressionCompte"
  component={DemandeSuppressionCompteScreen}
/>
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
});