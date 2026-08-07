// src/screens/UserDashboardScreen.tsx
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserDashboardScreenProps {
  onLogout: () => void;
}

export default function UserDashboardScreen({ onLogout }: UserDashboardScreenProps) {
  
  const handleLogout = async () => {
    // On nettoie les tokens à la déconnexion
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("role");
    await AsyncStorage.removeItem("idUtilisateur");
    onLogout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon Dashboard Utilisateur 🏋️‍♂️</Text>
      <Text style={styles.subtitle}>Bienvenue dans ton espace membre !</Text>
      
      {/* C'est ici que tu importeras tes futurs sous-composants */}
      <View style={styles.contentPlaceholder}>
        <Text style={styles.placeholderText}>Vos statistiques et cours s'afficheront ici.</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 30,
  },
  contentPlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginBottom: 40,
  },
  placeholderText: {
    color: "#9ca3af",
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: "#800020",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});