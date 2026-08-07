// App.tsx

import React from "react";

import {
  DarkTheme,
  NavigationContainer,
  type Theme,
} from "@react-navigation/native";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  StatusBar,
} from "expo-status-bar";

import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

import {
  AuthProvider,
} from "./src/context/AuthContext";

import RootNavigator
  from "./src/navigation/RootNavigator";

import {
  navigationRef,
} from "./src/navigation/navigationRef";

import NotificationNavigationHandler
  from "./src/components/NotificationNavigationHandler";

const SDMAA_THEME: Theme = {
  ...DarkTheme,

  colors: {
    ...DarkTheme.colors,

    primary: "#800020",
    background: "#121212",
    card: "#121212",
    text: "#FFFFFF",
    border: "#303030",
    notification: "#E50914",
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <StatusBar
          style="light"
          backgroundColor="#121212"
        />

        <ActivityIndicator
          size="large"
          color="#800020"
        />
      </View>
    );
  }

  return (
    <View
      style={
        styles.appContainer
      }
    >
      <StatusBar
        style="light"
        backgroundColor="#121212"
      />

      <AuthProvider>
        <NavigationContainer
          ref={navigationRef}
          theme={SDMAA_THEME}
        >
          <NotificationNavigationHandler />

          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#121212",
  },
});