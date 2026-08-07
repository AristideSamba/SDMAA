import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface News {
  id: number;
  titre: string;
  description: string;
  image: string;
  date: string;
}

interface NewsCardProps {
  news: News;
  onPress?: () => void;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1555597673-b21d5c935865";

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date non renseignée";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

export default function NewsCard({
  news,
  onPress,
}: NewsCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={
        onPress ? `Lire l'actualité ${news.titre}` : undefined
      }
    >
      <ImageBackground
        source={{
          uri:
            news.image && news.image !== "https://..."
              ? news.image
              : FALLBACK_IMAGE,
        }}
        style={styles.image}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            VIE DU CLUB
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.date}>
            {formatDate(news.date)}
          </Text>

          <Text
            style={styles.title}
            numberOfLines={2}
          >
            {news.titre}
          </Text>

          <Text
            style={styles.description}
            numberOfLines={3}
          >
            {news.description}
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 5,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.14,
    shadowRadius: 15,
    elevation: 5,
  },

  image: {
    height: 260,
    justifyContent: "space-between",
    padding: 18,
  },

  imageStyle: {
    borderRadius: 5,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 5,
    backgroundColor: "rgba(0,0,0,0.42)",
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  badgeText: {
    color: "#800020",
    fontSize: 10,
    letterSpacing: 1.2,
    fontFamily: "Inter_700Bold",
  },

  content: {
    position: "relative",
  },

  date: {
    color: "#e5e7eb",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },

  title: {
    marginTop: 6,
    color: "#ffffff",
    fontSize: 21,
    lineHeight: 27,
    fontFamily: "Inter_700Bold",
  },

  description: {
    marginTop: 8,
    color: "#f3f4f6",
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "Inter_400Regular",
  },
});