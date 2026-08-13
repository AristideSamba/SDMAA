// src/navigation/BottomTabs.tsx

import React, {
  useEffect,
  useRef,
} from "react";

import {
  Animated,
  GestureResponderEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  BottomTabBarButtonProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DashboardScreen from "../screens/DashboardScreen";
import PlanningScreen from "../screens/PlanningScreen";
import BoutiqueScreen from "../screens/BoutiqueScreen";
import DocumentsScreen from "../screens/DocumentsScreen";
import ProfileScreen from "../screens/ProfilScreen";

const Tab = createBottomTabNavigator();

const COLORS = {
  background: "#000000",
  tabBar: "rgba(3, 3, 3, 0.89)",
  tabBarBorder: "rgba(255,255,255,0.08)",

  activeBackground: "rgba(229,9,20,0.16)",
  activeBorder: "rgba(229,9,20,0.25)",

  active: "#FFFFFF",
  inactive: "#8D8D8D",

  red: "#E50914",
};

/**
 * On utilise directement BottomTabBarButtonProps.
 * Il n'est pas nécessaire de redéclarer children.
 */
type AnimatedTabButtonProps =
  BottomTabBarButtonProps;

function AnimatedTabButton({
  children,
  onPress,
  onLongPress,
  accessibilityState,
  accessibilityLabel,
  testID,
}: AnimatedTabButtonProps) {
  const focused =
    Boolean(accessibilityState?.selected);

  const pressScale = useRef(
    new Animated.Value(1)
  ).current;

  const focusProgress = useRef(
    new Animated.Value(focused ? 1 : 0)
  ).current;

  useEffect(() => {
    Animated.spring(focusProgress, {
      toValue: focused ? 1 : 0,
      friction: 8,
      tension: 110,
      useNativeDriver: true,
    }).start();
  }, [
    focused,
    focusProgress,
  ]);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.91,
      friction: 7,
      tension: 220,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 6,
      tension: 180,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = (
    event: GestureResponderEvent
  ) => {
    Animated.sequence([
      Animated.timing(pressScale, {
        toValue: 0.94,
        duration: 70,
        useNativeDriver: true,
      }),

      Animated.spring(pressScale, {
        toValue: 1.04,
        friction: 6,
        tension: 180,
        useNativeDriver: true,
      }),

      Animated.spring(pressScale, {
        toValue: 1,
        friction: 7,
        tension: 160,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.(event);
  };

  const translateY =
    focusProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -3],
    });

  const contentScale =
    focusProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.04],
    });

  const activeBackgroundOpacity =
    focusProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

  const indicatorScale =
    focusProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.2, 1],
    });

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityState={
        accessibilityState
      }
      accessibilityLabel={
        accessibilityLabel
      }
      testID={testID}
      style={styles.tabButton}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.activeBackground,
          {
            opacity:
              activeBackgroundOpacity,

            transform: [
              {
                scale:
                  focusProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      0.86,
                      1,
                    ],
                  }),
              },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.animatedContent,
          {
            transform: [
              {
                scale: pressScale,
              },
              {
                translateY,
              },
              {
                scale: contentScale,
              },
            ],
          },
        ]}
      >
        {children}
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.activeIndicator,
          {
            opacity:
              activeBackgroundOpacity,

            transform: [
              {
                scaleX:
                  indicatorScale,
              },
            ],
          },
        ]}
      />
    </Pressable>
  );
}

function getTabIcon(
  routeName: string,
  focused: boolean
): keyof typeof Ionicons.glyphMap {
  switch (routeName) {
    case "Accueil":
      return focused
        ? "home"
        : "home-outline";

    case "Planning":
      return focused
        ? "calendar"
        : "calendar-outline";

    case "Boutique":
      return focused
        ? "bag"
        : "bag-outline";

    case "Documents":
      return focused
        ? "document-text"
        : "document-text-outline";

    case "Profil":
      return focused
        ? "person"
        : "person-outline";

    default:
      return "ellipse-outline";
  }
}

export default function BottomTabs() {
  const insets =
    useSafeAreaInsets();

  const bottomSpacing =
    Platform.OS === "ios"
      ? Math.max(
          insets.bottom,
          14
        )
      : Math.max(
          insets.bottom,
          12
        );

  return (
    <View style={styles.root}>
      <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarHideOnKeyboard: true,

        tabBarActiveTintColor:
          COLORS.active,

        tabBarInactiveTintColor:
          COLORS.inactive,

        tabBarButton: (props) => (
          <AnimatedTabButton
            {...props}
          />
        ),

        tabBarBackground: () => (
          <View
            style={
              StyleSheet.absoluteFill
            }
          >
            <BlurView
              intensity={85}
              tint="dark"
              style={
                StyleSheet.absoluteFillObject
              }
            />

            <View
              style={[
                StyleSheet.absoluteFillObject,
                styles.tabBarOverlay,
              ]}
            />
          </View>
        ),

        tabBarStyle: {
          position: "absolute",

          left: 16,
          right: 16,
          bottom: bottomSpacing,

          height: 72,

          paddingTop: 7,
          paddingBottom: 7,
          paddingHorizontal: 6,
          marginHorizontal: 20,

          backgroundColor:
            "transparent",

          borderTopWidth: 0,
          borderWidth: 1,
          borderColor:
            COLORS.tabBarBorder,
          borderRadius: 50,

          overflow: "hidden",

          elevation: 16,
          zIndex: 2,

          shadowColor: "#000000",
          shadowOffset: {
            width: 0,
            height: 8,
          },
          shadowOpacity: 0.28,
          shadowRadius: 18,
        },

        tabBarItemStyle: {
          height: 58,
          borderRadius: 24,
        },

        tabBarLabelStyle: {
          marginTop: 1,
          marginBottom: 1,

          fontFamily:
            "Inter_600SemiBold",
          fontSize: 9,

          letterSpacing: 0.1,
        },

        tabBarIconStyle: {
          marginTop: 1,
        },

        tabBarIcon: ({
          color,
          focused,
        }) => {
          const iconName =
            getTabIcon(
              route.name,
              focused
            );

          return (
            <View
              style={
                styles.iconContainer
              }
            >
              <Ionicons
                name={iconName}
                size={
                  focused
                    ? 23
                    : 22
                }
                color={color}
              />

              {focused ? (
                <View
                  style={
                    styles.iconGlow
                  }
                />
              ) : null}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Accueil"
        component={DashboardScreen}
      />

      <Tab.Screen
        name="Planning"
        component={PlanningScreen}
      />

      <Tab.Screen
        name="Boutique"
        component={BoutiqueScreen}
      />

      <Tab.Screen
        name="Documents"
        component={DocumentsScreen}
      />

      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
      />
      </Tab.Navigator>

      <LinearGradient
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        colors={[
          "rgba(18,18,18,0)",
          "rgba(128,0,32,0.10)",
          "rgba(128,0,32,0.22)",
          "rgba(49, 0, 13, 0.91)",
        ]}
        locations={[
          0,
          0.30,
          0.62,
          1,
        ]}
        style={[
          styles.bottomNavigationFade,
          {
            height:
              38 + bottomSpacing,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  bottomNavigationFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },

  tabBarOverlay: {
    backgroundColor:
      COLORS.tabBar,
    borderRadius: 34,
  },

  tabButton: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    marginHorizontal: 1,

    overflow: "hidden",
    borderRadius: 24,
  },

  activeBackground: {
    position: "absolute",

    top: 2,
    right: 2,
    bottom: 2,
    left: 2,

    backgroundColor:
      COLORS.activeBackground,

    borderWidth: 1,
    borderColor:
      COLORS.activeBorder,
    borderRadius: 22,
  },

  animatedContent: {
    alignItems: "center",
    justifyContent: "center",

    zIndex: 2,
  },

  activeIndicator: {
    position: "absolute",

    bottom: 3,

    width: 18,
    height: 3,

    backgroundColor:
      COLORS.red,
    borderRadius: 999,

    shadowColor:
      COLORS.red,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 6,

    elevation: 4,
  },

  iconContainer: {
    position: "relative",

    alignItems: "center",
    justifyContent: "center",
  },

  iconGlow: {
    position: "absolute",

    width: 27,
    height: 27,

    backgroundColor:
      "rgba(229,9,20,0.15)",
    borderRadius: 999,

    transform: [
      {
        scale: 1.3,
      },
    ],

    zIndex: -1,
  },
});