import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  Image,
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

type ModeBoutique =
  | "ACHAT"
  | "EMPRUNT";

type CategorieProduit =
  | "TOUS"
  | "DOBOK"
  | "PROTECTION"
  | "CEINTURE"
  | "ACCESSOIRE";

interface Produit {
  id: number;
  nom: string;
  description: string;
  prix: number;
  categorie: Exclude<
    CategorieProduit,
    "TOUS"
  >;
  image: string;
  quantite: number;
  disponibleAchat: boolean;
  disponibleEmprunt: boolean;
  couleurCarte: string;
}

const COLORS = {
  background: "#121212",
  surface: "#1B1B1B",
  surfaceSoft: "#252525",
  border: "#303030",
  text: "#FFFFFF",
  muted: "#A1A1A1",
  burgundy: "#800020",
  red: "#E50914",
  green: "#1DB954",
};

/**
 * Remplace cette URL par l’URL Cloudinary
 * de ta bannière boutique.
 */
const BOUTIQUE_BANNER_URL =
  "https://res.cloudinary.com/cziqis2y/image/upload/v1786093817/Tae_zut9hs.jpg";

const CATEGORIES: {
  id: CategorieProduit;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: "TOUS",
    label: "Tous",
    icon: "grid-outline",
  },
  {
    id: "DOBOK",
    label: "Doboks",
    icon: "shirt-outline",
  },
  {
    id: "PROTECTION",
    label: "Protections",
    icon: "shield-outline",
  },
  {
    id: "CEINTURE",
    label: "Ceintures",
    icon: "ribbon-outline",
  },
  {
    id: "ACCESSOIRE",
    label: "Accessoires",
    icon: "bag-handle-outline",
  },
];

const PRODUITS: Produit[] = [
  {
    id: 1,
    nom: "Dobok adulte",
    description: "Dobok blanc avec col noir",
    prix: 50,
    categorie: "DOBOK",
    image:
      "https://images.unsplash.com/photo-1555597673-b21d5c935865",
    quantite: 3,
    disponibleAchat: true,
    disponibleEmprunt: false,
    couleurCarte: "#7C1734",
  },
  {
    id: 2,
    nom: "Protège-tibias",
    description: "Protection légère et renforcée",
    prix: 20,
    categorie: "PROTECTION",
    image:
      "https://images.unsplash.com/photo-1517438322307-e67111335449",
    quantite: 4,
    disponibleAchat: true,
    disponibleEmprunt: true,
    couleurCarte: "#174D7C",
  },
  {
    id: 3,
    nom: "Plastron",
    description: "Plastron d'entraînement taille M",
    prix: 50,
    categorie: "PROTECTION",
    image:
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed",
    quantite: 2,
    disponibleAchat: true,
    disponibleEmprunt: true,
    couleurCarte: "#5A368C",
  },
  {
    id: 4,
    nom: "Ceinture noire",
    description: "Ceinture de taekwondo renforcée",
    prix: 15,
    categorie: "CEINTURE",
    image:
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e",
    quantite: 6,
    disponibleAchat: true,
    disponibleEmprunt: false,
    couleurCarte: "#8A4C13",
  },
];

export default function BoutiqueScreen() {
  const [mode, setMode] =
    useState<ModeBoutique>("ACHAT");

  const [categorie, setCategorie] =
    useState<CategorieProduit>("TOUS");

  const [recherche, setRecherche] =
    useState("");

  const [panier, setPanier] = useState<
    number[]
  >([]);

  const produitsFiltres = useMemo(() => {
    const terme =
      recherche.trim().toLowerCase();

    return PRODUITS.filter((produit) => {
      const correspondCategorie =
        categorie === "TOUS" ||
        produit.categorie === categorie;

      const correspondRecherche =
        produit.nom
          .toLowerCase()
          .includes(terme) ||
        produit.description
          .toLowerCase()
          .includes(terme);

      const correspondMode =
        mode === "ACHAT"
          ? produit.disponibleAchat
          : produit.disponibleEmprunt;

      return (
        correspondCategorie &&
        correspondRecherche &&
        correspondMode
      );
    });
  }, [
    categorie,
    mode,
    recherche,
  ]);

  const ajouterProduit =
    useCallback((produitId: number) => {
      setPanier((actuel) => [
        ...actuel,
        produitId,
      ]);
    }, []);

  const renderProduit = ({
    item,
  }: {
    item: Produit;
  }) => {
    const estDisponible =
      item.quantite > 0;

    return (
      <ProductCard
        produit={item}
        mode={mode}
        disabled={!estDisponible}
        onPress={() =>
          ajouterProduit(item.id)
        }
      />
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <StatusBar
        style="light"
        backgroundColor={
          COLORS.background
        }
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>
            SDMAA
          </Text>

          <Text style={styles.title}>
            Boutique
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            mode === "ACHAT"
              ? `Ouvrir le panier, ${panier.length} produit(s)`
              : `Voir mes demandes, ${panier.length} demande(s)`
          }
          style={({ pressed }) => [
            styles.cartButton,
            pressed &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name={
              mode === "ACHAT"
                ? "bag-handle-outline"
                : "time-outline"
            }
            size={22}
            color={COLORS.text}
          />

          {panier.length > 0 && (
            <View
              style={styles.cartBadge}
            >
              <Text
                style={
                  styles.cartBadgeText
                }
              >
                {panier.length}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <FlatList
        data={produitsFiltres}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderProduit}
        numColumns={2}
        showsVerticalScrollIndicator={
          false
        }
        columnWrapperStyle={
          styles.column
        }
        contentContainerStyle={
          styles.listContent
        }
        ListHeaderComponent={
          <>
            <PromotionCard />

            <ModeSelector
              mode={mode}
              onChange={(nouveauMode) => {
                setMode(nouveauMode);
                setPanier([]);
              }}
            />

            <SearchField
              value={recherche}
              onChangeText={setRecherche}
            />

            <CategorySelector
              value={categorie}
              onChange={setCategorie}
            />

            <View
              style={
                styles.resultsHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.resultsTitle
                  }
                >
                  {mode === "ACHAT"
                    ? "Articles disponibles"
                    : "Matériel à emprunter"}
                </Text>

                <Text
                  style={
                    styles.resultsSubtitle
                  }
                >
                  {produitsFiltres.length}{" "}
                  produit
                  {produitsFiltres.length >
                  1
                    ? "s"
                    : ""}
                </Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="search-outline"
              size={34}
              color={COLORS.muted}
            />

            <Text style={styles.emptyTitle}>
              Aucun produit trouvé
            </Text>

            <Text style={styles.emptyText}>
              Modifiez votre recherche ou
              choisissez une autre catégorie.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function PromotionCard() {
  return (
    <View style={styles.promotionCard}>
      <Image
        source={{
          uri: BOUTIQUE_BANNER_URL,
        }}
        style={styles.promotionBackgroundImage}
        resizeMode="cover"
        accessibilityLabel="Bannière de la boutique SDMAA"
      />

      <View
        style={styles.promotionOverlay}
      />

      <View
        style={styles.promotionContent}
      >
        <View style={styles.promotionBadge}>
          <Ionicons
            name="flash"
            size={13}
            color={COLORS.text}
          />

          <Text
            style={
              styles.promotionBadgeText
            }
          >
            ÉQUIPEMENT DU CLUB
          </Text>
        </View>

        <Text style={styles.promotionTitle}>
          Équipe-toi pour la prochaine
          compétition
        </Text>

        <Text style={styles.promotionText}>
          Commande ou emprunte ton matériel
          directement depuis l’application.
        </Text>
      </View>
    </View>
  );
}

interface ModeSelectorProps {
  mode: ModeBoutique;
  onChange: (
    mode: ModeBoutique
  ) => void;
}

function ModeSelector({
  mode,
  onChange,
}: ModeSelectorProps) {
  return (
    <View style={styles.modeContainer}>
      <ModeButton
        active={mode === "ACHAT"}
        icon="card-outline"
        label="Acheter"
        onPress={() =>
          onChange("ACHAT")
        }
      />

      <ModeButton
        active={mode === "EMPRUNT"}
        icon="repeat-outline"
        label="Emprunter"
        onPress={() =>
          onChange("EMPRUNT")
        }
      />
    </View>
  );
}

interface ModeButtonProps {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

function ModeButton({
  active,
  icon,
  label,
  onPress,
}: ModeButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{
        selected: active,
      }}
      style={({ pressed }) => [
        styles.modeButton,
        active &&
          styles.modeButtonActive,
        pressed &&
          styles.pressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={
          active
            ? COLORS.text
            : COLORS.muted
        }
      />

      <Text
        style={[
          styles.modeButtonText,
          active &&
            styles.modeButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface SearchFieldProps {
  value: string;
  onChangeText: (
    value: string
  ) => void;
}

function SearchField({
  value,
  onChangeText,
}: SearchFieldProps) {
  return (
    <View style={styles.searchContainer}>
      <Ionicons
        name="search-outline"
        size={20}
        color={COLORS.muted}
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Rechercher un équipement"
        placeholderTextColor={
          COLORS.muted
        }
        style={styles.searchInput}
        accessibilityLabel="Rechercher un équipement"
        returnKeyType="search"
      />

      {value.length > 0 && (
        <Pressable
          onPress={() =>
            onChangeText("")
          }
          accessibilityRole="button"
          accessibilityLabel="Effacer la recherche"
        >
          <Ionicons
            name="close-circle"
            size={20}
            color={COLORS.muted}
          />
        </Pressable>
      )}
    </View>
  );
}

interface CategorySelectorProps {
  value: CategorieProduit;
  onChange: (
    value: CategorieProduit
  ) => void;
}

function CategorySelector({
  value,
  onChange,
}: CategorySelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={
        false
      }
      contentContainerStyle={
        styles.categories
      }
    >
      {CATEGORIES.map((categorie) => {
        const active =
          value === categorie.id;

        return (
          <Pressable
            key={categorie.id}
            onPress={() =>
              onChange(categorie.id)
            }
            accessibilityRole="button"
            accessibilityState={{
              selected: active,
            }}
            style={({ pressed }) => [
              styles.categoryButton,
              active &&
                styles.categoryButtonActive,
              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name={categorie.icon}
              size={16}
              color={
                active
                  ? COLORS.text
                  : COLORS.muted
              }
            />

            <Text
              style={[
                styles.categoryText,
                active &&
                  styles.categoryTextActive,
              ]}
            >
              {categorie.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

interface ProductCardProps {
  produit: Produit;
  mode: ModeBoutique;
  disabled: boolean;
  onPress: () => void;
}

function ProductCard({
  produit,
  mode,
  disabled,
  onPress,
}: ProductCardProps) {
  return (
    <View
      style={[
        styles.productCard,
        {
          backgroundColor:
            produit.couleurCarte,
        },
      ]}
    >
      <View
        style={
          styles.productImageContainer
        }
      >
        <Image
          source={{
            uri: produit.image,
          }}
          style={styles.productImage}
          resizeMode="cover"
          accessibilityLabel={`Photo du produit ${produit.nom}`}
        />

        <View
          style={[
            styles.stockBadge,
            !disabled &&
              styles.stockBadgeAvailable,
          ]}
        >
          <Text
            style={styles.stockBadgeText}
          >
            {disabled
              ? "Rupture"
              : `${produit.quantite} en stock`}
          </Text>
        </View>
      </View>

      <View style={styles.productContent}>
        <Text
          style={styles.productName}
          numberOfLines={2}
        >
          {produit.nom}
        </Text>

        <Text
          style={styles.productDescription}
          numberOfLines={2}
        >
          {produit.description}
        </Text>

        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>
            {mode === "ACHAT"
              ? `${produit.prix.toLocaleString(
                  "fr-FR",
                  {
                    style: "currency",
                    currency: "EUR",
                  }
                )}`
              : "Emprunt"}
          </Text>

          <Pressable
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={
              mode === "ACHAT"
                ? `Ajouter ${produit.nom} au panier`
                : `Demander l'emprunt de ${produit.nom}`
            }
            style={({ pressed }) => [
              styles.addButton,
              disabled &&
                styles.addButtonDisabled,
              pressed &&
                !disabled &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name={
                mode === "ACHAT"
                  ? "add"
                  : "arrow-forward"
              }
              size={19}
              color={COLORS.text}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  header: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  eyebrow: {
    marginBottom: 3,
    color: COLORS.red,
    fontSize: 10,
    letterSpacing: 1.8,
    fontFamily: "Inter_700Bold",
  },

  title: {
    color: COLORS.text,
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },

  cartButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
  },

  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.red,
    borderRadius: 10,
  },

  cartBadgeText: {
    color: COLORS.text,
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },

  promotionCard: {
    minHeight: 210,
    overflow: "hidden",
    marginTop: 8,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
  },

  promotionBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  promotionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      "rgba(0,0,0,0.52)",
  },

  promotionContent: {
    minHeight: 210,
    justifyContent: "flex-end",
    padding: 20,
    zIndex: 2,
  },

  promotionBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor:
      "rgba(0,0,0,0.22)",
    borderRadius: 20,
  },

  promotionBadgeText: {
    color: COLORS.text,
    fontSize: 9,
    letterSpacing: 1,
    fontFamily: "Inter_700Bold",
  },

  promotionTitle: {
    maxWidth: 230,
    marginTop: 18,
    color: COLORS.text,
    fontSize: 23,
    lineHeight: 28,
    fontFamily: "Inter_700Bold",
  },

  promotionText: {
    maxWidth: 245,
    marginTop: 9,
    color:
      "rgba(255,255,255,0.78)",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
  },

  modeContainer: {
    flexDirection: "row",
    marginTop: 20,
    padding: 5,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
  },

  modeButton: {
    flex: 1,
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
  },

  modeButtonActive: {
    backgroundColor:
      COLORS.burgundy,
  },

  modeButtonText: {
    color: COLORS.muted,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },

  modeButtonTextActive: {
    color: COLORS.text,
  },

  searchContainer: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
    paddingHorizontal: 15,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
  },

  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },

  categories: {
    gap: 9,
    paddingVertical: 16,
    paddingRight: 15,
  },

  categoryButton: {
    minHeight: 39,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 13,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
  },

  categoryButtonActive: {
    backgroundColor: "#353535",
    borderColor: "#555555",
  },

  categoryText: {
    color: COLORS.muted,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },

  categoryTextActive: {
    color: COLORS.text,
  },

  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 14,
  },

  resultsTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },

  resultsSubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },

  column: {
    gap: 12,
    marginBottom: 12,
  },

  productCard: {
    flex: 1,
    minHeight: 300,
    overflow: "hidden",
    borderRadius: 10,
  },

  productImageContainer: {
    height: 165,
    margin: 8,
    overflow: "hidden",
    backgroundColor:
      COLORS.surfaceSoft,
    borderRadius: 5,
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  stockBadge: {
    position: "absolute",
    top: 9,
    left: 9,
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor:
      "rgba(120,0,0,0.88)",
    borderRadius: 20,
  },

  stockBadgeAvailable: {
    backgroundColor:
      "rgba(12,95,54,0.9)",
  },

  stockBadgeText: {
    color: COLORS.text,
    fontSize: 8,
    fontFamily: "Inter_700Bold",
  },

  productContent: {
    flex: 1,
    paddingHorizontal: 13,
    paddingTop: 4,
    paddingBottom: 13,
  },

  productName: {
    minHeight: 38,
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 19,
    fontFamily: "Inter_700Bold",
  },

  productDescription: {
    minHeight: 34,
    marginTop: 3,
    color:
      "rgba(255,255,255,0.72)",
    fontSize: 10,
    lineHeight: 15,
    fontFamily: "Inter_400Regular",
  },

  productFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
  },

  productPrice: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },

  addButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(0,0,0,0.45)",
    borderRadius: 19,
  },

  addButtonDisabled: {
    opacity: 0.35,
  },

  empty: {
    alignItems: "center",
    paddingVertical: 55,
  },

  emptyTitle: {
    marginTop: 13,
    color: COLORS.text,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },

  emptyText: {
    maxWidth: 250,
    marginTop: 7,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },

  pressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },
});