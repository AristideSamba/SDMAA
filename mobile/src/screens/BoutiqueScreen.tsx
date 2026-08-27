import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
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

import {
  useNavigation,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import api from "../services/api";

type RootStackParamList = {
  MesCommandes: undefined;
};

type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList
  >;

type ModeBoutique =
  | "ACHAT"
  | "EMPRUNT";

type CategorieProduit =
  | "TOUS"
  | "DOBOK"
  | "PROTECTION"
  | "CEINTURE"
  | "ACCESSOIRE";

interface EquipementDTO {
  id: number;
  nom?: string | null;
  type?: string | null;
  taille?: string | null;
  quantiteDisponible?: number | null;
  prixAchat?: number | string | null;
  achetable?: boolean | null;
  empruntable?: boolean | null;
  lienImage?: string | null;
  description?: string | null;
  categorie?: string | null;
}

type StatutEmpruntActif =
  | "EN_ATTENTE"
  | "EN_COURS";

interface EmpruntEquipementDTO {
  id?: number;
  dateEmprunt?: string | null;
  dateRetourPrevue?: string | null;
  dateRetourEffective?: string | null;
  statutEmprunt?: string | null;
  quantite?: number | null;

  utilisateurId?: number | null;
  utilisateurNom?: string | null;
  utilisateurPrenom?: string | null;

  equipementId?: number | null;
  equipementNom?: string | null;
  equipementType?: string | null;
}

interface Produit {
  id: number;
  nom: string;
  description: string;
  prix: number;
  categorie: Exclude<CategorieProduit, "TOUS">;
  image: string | null;
  quantite: number;
  disponibleAchat: boolean;
  disponibleEmprunt: boolean;
  couleurCarte: string;
  type?: string;
  taille?: string;
}

interface PanierItem {
  produit: Produit;
  quantite: number;
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

const BOUTIQUE_BANNER_URL =
  "https://res.cloudinary.com/cziqis2y/image/upload/v1786549056/arto-suraj-_XlTp6nHbm0-unsplash_kfqyjg.jpg";

const FALLBACK_PRODUCT_IMAGE =
  "https://res.cloudinary.com/cziqis2y/image/upload/v1786129492/joan-tran-reEySFadyJQ-unsplash_wj1y3l.jpg";

function normalizeCategorie(
  categorie?: string | null,
  type?: string | null
): Exclude<CategorieProduit, "TOUS"> {
  const value = `${categorie || ""} ${type || ""}`
    .trim()
    .toUpperCase();

  if (value.includes("DOBOK")) return "DOBOK";

  if (
    value.includes("PROTECTION") ||
    value.includes("PLASTRON") ||
    value.includes("PROTEGE") ||
    value.includes("PROTÈGE")
  ) {
    return "PROTECTION";
  }

  if (value.includes("CEINTURE")) {
    return "CEINTURE";
  }

  return "ACCESSOIRE";
}

function getCardColor(
  categorie: Exclude<CategorieProduit, "TOUS">
): string {
  switch (categorie) {
    case "DOBOK":
      return "#7C1734";
    case "PROTECTION":
      return "#174D7C";
    case "CEINTURE":
      return "#8A4C13";
    default:
      return "#4B5563";
  }
}

function normalizeStatutEmprunt(
  statut?: string | null
): StatutEmpruntActif | null {
  const value = (statut || "")
    .trim()
    .toLowerCase();

  if (value === "en_attente") {
    return "EN_ATTENTE";
  }

  if (value === "en_cours") {
    return "EN_COURS";
  }

  return null;
}

function getEquipementIdFromEmprunt(
  emprunt: EmpruntEquipementDTO
): number | null {
  const rawId = emprunt.equipementId;

  if (rawId === null || rawId === undefined) {
    return null;
  }

  const id = Number(rawId);
  return Number.isFinite(id) ? id : null;
}

function mapEquipementToProduit(
  equipement: EquipementDTO
): Produit {
  const categorie = normalizeCategorie(
    equipement.categorie,
    equipement.type
  );

  return {
    id: Number(equipement.id),
    nom: equipement.nom?.trim() || "Équipement",
    description:
      equipement.description?.trim() || "Aucune description.",
    prix: Number(equipement.prixAchat ?? 0),
    categorie,
    image: equipement.lienImage?.trim() || null,
    quantite: Math.max(
      0,
      Number(equipement.quantiteDisponible ?? 0)
    ),
    disponibleAchat: equipement.achetable === true,
    disponibleEmprunt: equipement.empruntable === true,
    couleurCarte: getCardColor(categorie),
    type: equipement.type || undefined,
    taille: equipement.taille || undefined,
  };
}

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

export default function BoutiqueScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  const [mode, setMode] =
    useState<ModeBoutique>("ACHAT");

  const [categorie, setCategorie] =
    useState<CategorieProduit>("TOUS");

  const [recherche, setRecherche] =
    useState("");

  const [panier, setPanier] = useState<
    PanierItem[]
  >([]);

  const [
    panierVisible,
    setPanierVisible,
  ] = useState(false);

  const [
    sendingAchat,
    setSendingAchat,
  ] = useState(false);

  const [produits, setProduits] =
    useState<Produit[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    empruntSelectionne,
    setEmpruntSelectionne,
  ] = useState<Produit | null>(null);

  const [
    quantiteEmprunt,
    setQuantiteEmprunt,
  ] = useState(1);

  const [
    dureeEmprunt,
    setDureeEmprunt,
  ] = useState(7);

  const [
    sendingEmprunt,
    setSendingEmprunt,
  ] = useState(false);

  const [
    empruntsActifsParEquipement,
    setEmpruntsActifsParEquipement,
  ] = useState<Record<
    number,
    StatutEmpruntActif
  >>({});

  const chargerProduits = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await api.get<EquipementDTO[]>(
            "/equipements"
          );

        const data = Array.isArray(
          response.data
        )
          ? response.data
          : [];

        setProduits(
          data
            .map(mapEquipementToProduit)
            .filter((produit) =>
              Number.isFinite(produit.id)
            )
        );
      } catch (requestError) {
        console.error(
          "Erreur chargement boutique :",
          requestError
        );

        setError(
          "Impossible de charger les équipements."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  const chargerMesEmprunts = useCallback(async () => {
    try {
      const response =
        await api.get<EmpruntEquipementDTO[]>(
          "/emprunts-equipements/me"
        );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      const prochainsStatuts: Record<
        number,
        StatutEmpruntActif
      > = {};

      data.forEach((emprunt) => {
        const idEquipement =
          getEquipementIdFromEmprunt(emprunt);
        const statut = normalizeStatutEmprunt(
          emprunt.statutEmprunt
        );

        if (idEquipement !== null && statut) {
          prochainsStatuts[idEquipement] = statut;
        }
      });

      setEmpruntsActifsParEquipement(
        prochainsStatuts
      );
    } catch (requestError) {
      console.error(
        "Erreur chargement des emprunts :",
        requestError
      );

      // La boutique reste utilisable même si ce chargement échoue.
      // Le backend conserve la sécurité et refusera un doublon.
      setEmpruntsActifsParEquipement({});
    }
  }, []);

  useEffect(() => {
    chargerProduits();
    chargerMesEmprunts();
  }, [chargerMesEmprunts, chargerProduits]);

  const produitsFiltres = useMemo(() => {
    const terme =
      recherche.trim().toLowerCase();

    return produits.filter((produit) => {
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
    produits,
    recherche,
  ]);

  const ajouterProduit =
    useCallback((produit: Produit) => {
      setPanier((actuel) => {
        const ligneExistante =
          actuel.find(
            (ligne) =>
              ligne.produit.id ===
              produit.id
          );

        if (ligneExistante) {
          if (
            ligneExistante.quantite >=
            produit.quantite
          ) {
            Alert.alert(
              "Stock maximum atteint",
              `Vous avez déjà ajouté la quantité maximale disponible pour ${produit.nom}.`
            );

            return actuel;
          }

          return actuel.map((ligne) =>
            ligne.produit.id ===
            produit.id
              ? {
                  ...ligne,
                  quantite:
                    ligne.quantite + 1,
                }
              : ligne
          );
        }

        return [
          ...actuel,
          {
            produit,
            quantite: 1,
          },
        ];
      });
    }, []);

  const diminuerQuantitePanier =
    useCallback((produitId: number) => {
      setPanier((actuel) =>
        actuel
          .map((ligne) =>
            ligne.produit.id ===
            produitId
              ? {
                  ...ligne,
                  quantite:
                    ligne.quantite - 1,
                }
              : ligne
          )
          .filter(
            (ligne) =>
              ligne.quantite > 0
          )
      );
    }, []);

  const augmenterQuantitePanier =
    useCallback((produitId: number) => {
      setPanier((actuel) =>
        actuel.map((ligne) => {
          if (
            ligne.produit.id !==
            produitId
          ) {
            return ligne;
          }

          if (
            ligne.quantite >=
            ligne.produit.quantite
          ) {
            return ligne;
          }

          return {
            ...ligne,
            quantite:
              ligne.quantite + 1,
          };
        })
      );
    }, []);

  const supprimerDuPanier =
    useCallback((produitId: number) => {
      setPanier((actuel) =>
        actuel.filter(
          (ligne) =>
            ligne.produit.id !==
            produitId
        )
      );
    }, []);

  const nombreArticlesPanier =
    useMemo(
      () =>
        panier.reduce(
          (total, ligne) =>
            total + ligne.quantite,
          0
        ),
      [panier]
    );

  const totalPanier =
    useMemo(
      () =>
        panier.reduce(
          (total, ligne) =>
            total +
            ligne.produit.prix *
              ligne.quantite,
          0
        ),
      [panier]
    );

  const validerPanier =
    useCallback(async () => {
      if (
        panier.length === 0 ||
        sendingAchat
      ) {
        return;
      }

      try {
        setSendingAchat(true);

        const achatsReussis: number[] =
          [];
        const erreurs: string[] = [];

        for (const ligne of panier) {
          try {
            await api.post(
              "/achats-equipements/me",
              null,
              {
                params: {
                  idEquipement:
                    ligne.produit.id,
                  quantite:
                    ligne.quantite,
                },
              }
            );

            achatsReussis.push(
              ligne.produit.id
            );
          } catch (
            requestError: any
          ) {
            const message =
              requestError?.response
                ?.data?.message ||
              requestError?.response
                ?.data?.error ||
              "Erreur inconnue";

            erreurs.push(
              `${ligne.produit.nom} : ${message}`
            );
          }
        }

        if (
          achatsReussis.length > 0
        ) {
          setPanier((actuel) =>
            actuel.filter(
              (ligne) =>
                !achatsReussis.includes(
                  ligne.produit.id
                )
            )
          );

          await chargerProduits(true);
        }

        if (erreurs.length === 0) {
          setPanierVisible(false);

          Alert.alert(
            "Commande envoyée",
            "Votre commande a été transmise à l’administration. Le paiement s’effectuera sur place. Vous pourrez suivre son statut dans Mes commandes."
          );

          return;
        }

        Alert.alert(
          achatsReussis.length > 0
            ? "Commande partiellement envoyée"
            : "Commande impossible",
          `Certaines lignes n’ont pas pu être envoyées :\n\n${erreurs.join("\n")}`
        );
      } finally {
        setSendingAchat(false);
      }
    }, [
      chargerProduits,
      panier,
      sendingAchat,
    ]);

  const ouvrirDemandeEmprunt =
    useCallback((produit: Produit) => {
      setQuantiteEmprunt(1);
      setDureeEmprunt(7);
      setEmpruntSelectionne(produit);
    }, []);

  const fermerDemandeEmprunt =
    useCallback(() => {
      if (sendingEmprunt) {
        return;
      }

      setEmpruntSelectionne(null);
      setQuantiteEmprunt(1);
      setDureeEmprunt(7);
    }, [sendingEmprunt]);

  const getDateRetourPrevue = (
    dureeJours: number
  ): string => {
    const date = new Date();

    date.setDate(
      date.getDate() + dureeJours
    );

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const envoyerDemandeEmprunt =
    useCallback(async () => {
      if (!empruntSelectionne) {
        return;
      }

      if (
        quantiteEmprunt <= 0 ||
        quantiteEmprunt >
          empruntSelectionne.quantite
      ) {
        Alert.alert(
          "Quantité invalide",
          "Choisissez une quantité disponible."
        );

        return;
      }

      try {
        setSendingEmprunt(true);

        const dateRetourPrevue =
          getDateRetourPrevue(
            dureeEmprunt
          );

        await api.post(
          "/emprunts-equipements/me",
          null,
          {
            params: {
              idEquipement:
                empruntSelectionne.id,
              quantite:
                quantiteEmprunt,
              dateRetourPrevue,
            },
          }
        );

        setEmpruntsActifsParEquipement(
          (actuels) => ({
            ...actuels,
            [empruntSelectionne.id]:
              "EN_ATTENTE",
          })
        );

        setEmpruntSelectionne(
          null
        );

        setQuantiteEmprunt(1);
        setDureeEmprunt(7);

        Alert.alert(
          "Demande envoyée",
          "Votre demande d’emprunt a été transmise à l’administration. Vous pourrez suivre son statut dans Mes commandes."
        );
      } catch (requestError: any) {
        console.error(
          "Erreur demande emprunt :",
          requestError
        );

        const message =
          requestError?.response?.data
            ?.message ||
          requestError?.response?.data
            ?.error ||
          "Impossible d’envoyer la demande d’emprunt.";

        Alert.alert(
          "Demande impossible",
          message
        );
      } finally {
        setSendingEmprunt(false);
      }
    }, [
      dureeEmprunt,
      empruntSelectionne,
      quantiteEmprunt,
    ]);

  const renderProduit = ({
    item,
  }: {
    item: Produit;
  }) => {
    const estDisponible =
      item.quantite > 0;

    const statutEmprunt =
      mode === "EMPRUNT"
        ? empruntsActifsParEquipement[
            item.id
          ] ?? null
        : null;

    const empruntDejaActif =
      statutEmprunt !== null;

    const disabled =
      !estDisponible ||
      (mode === "EMPRUNT" &&
        empruntDejaActif);

    return (
      <ProductCard
        produit={item}
        mode={mode}
        disabled={disabled}
        statutEmprunt={statutEmprunt}
        onPress={() => {
          if (mode === "EMPRUNT") {
            if (empruntDejaActif) {
              return;
            }

            ouvrirDemandeEmprunt(
              item
            );

            return;
          }

          ajouterProduit(item);
        }}
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

        <View style={styles.headerActions}>
          <Pressable
            onPress={() =>
              navigation.navigate(
                "MesCommandes"
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Voir mes commandes"
            style={({ pressed }) => [
              styles.headerActionButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="receipt-outline"
              size={22}
              color={COLORS.text}
            />
          </Pressable>

          {mode === "ACHAT" &&
          nombreArticlesPanier > 0 ? (
            <Pressable
              onPress={() =>
                setPanierVisible(true)
              }
              accessibilityRole="button"
              accessibilityLabel={`Ouvrir le panier, ${nombreArticlesPanier} article(s)`}
              style={({ pressed }) => [
                styles.headerActionButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="bag-handle-outline"
                size={22}
                color={COLORS.text}
              />

              <View style={styles.cartBadge}>
                <Text
                  style={styles.cartBadgeText}
                >
                  {nombreArticlesPanier >
                  99
                    ? "99+"
                    : nombreArticlesPanier}
                </Text>
              </View>
            </Pressable>
          ) : null}
        </View>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              await Promise.all([
                chargerProduits(true),
                chargerMesEmprunts(),
              ]);
            }}
            tintColor={COLORS.text}
            colors={[COLORS.red]}
          />
        }
        ListHeaderComponent={
          <>
            {error ? (
              <View style={styles.errorCard}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color="#FCA5A5"
                />

                <Text style={styles.errorText}>
                  {error}
                </Text>

                <Pressable
                  onPress={() =>
                    chargerProduits()
                  }
                  style={styles.retryButton}
                >
                  <Text
                    style={
                      styles.retryButtonText
                    }
                  >
                    Réessayer
                  </Text>
                </Pressable>
              </View>
            ) : null}

            <PromotionCard />

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator
                  size="small"
                  color={COLORS.red}
                />

                <Text style={styles.loadingText}>
                  Chargement des équipements...
                </Text>
              </View>
            ) : null}

            <ModeSelector
              mode={mode}
              onChange={(nouveauMode) => {
                setMode(nouveauMode);
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

      <Modal
        visible={panierVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!sendingAchat) {
            setPanierVisible(false);
          }
        }}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => {
              if (!sendingAchat) {
                setPanierVisible(false);
              }
            }}
          />

          <View style={styles.cartModal}>
            <View style={styles.cartModalHandle} />

            <View style={styles.cartModalHeader}>
              <View>
                <Text style={styles.cartModalEyebrow}>
                  BOUTIQUE SDMAA
                </Text>

                <Text style={styles.cartModalTitle}>
                  Mon panier
                </Text>

                <Text style={styles.cartModalSubtitle}>
                  {nombreArticlesPanier} article
                  {nombreArticlesPanier > 1
                    ? "s"
                    : ""}
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setPanierVisible(false)
                }
                disabled={sendingAchat}
                accessibilityRole="button"
                accessibilityLabel="Fermer le panier"
                style={styles.cartModalClose}
              >
                <Ionicons
                  name="close"
                  size={21}
                  color={COLORS.text}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.cartItemsScroll}
              contentContainerStyle={
                styles.cartItemsContent
              }
            >
              {panier.map((ligne) => (
                <View
                  key={ligne.produit.id}
                  style={styles.cartItem}
                >
                  <Image
                    source={{
                      uri:
                        ligne.produit.image ||
                        FALLBACK_PRODUCT_IMAGE,
                    }}
                    style={styles.cartItemImage}
                    resizeMode="cover"
                  />

                  <View style={styles.cartItemContent}>
                    <View style={styles.cartItemTopRow}>
                      <View style={styles.cartItemTextBlock}>
                        <Text
                          style={styles.cartItemName}
                          numberOfLines={2}
                        >
                          {ligne.produit.nom}
                        </Text>

                        <Text style={styles.cartItemUnitPrice}>
                          {ligne.produit.prix.toLocaleString(
                            "fr-FR",
                            {
                              style: "currency",
                              currency: "EUR",
                            }
                          )}
                          {" / unité"}
                        </Text>
                      </View>

                      <Pressable
                        onPress={() =>
                          supprimerDuPanier(
                            ligne.produit.id
                          )
                        }
                        disabled={sendingAchat}
                        accessibilityRole="button"
                        accessibilityLabel={`Supprimer ${ligne.produit.nom} du panier`}
                        style={({ pressed }) => [
                          styles.cartDeleteButton,
                          pressed &&
                            !sendingAchat &&
                            styles.pressed,
                        ]}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={17}
                          color="#F87171"
                        />
                      </Pressable>
                    </View>

                    <View style={styles.cartItemBottomRow}>
                      <View style={styles.cartQuantitySelector}>
                        <Pressable
                          onPress={() =>
                            diminuerQuantitePanier(
                              ligne.produit.id
                            )
                          }
                          disabled={sendingAchat}
                          style={styles.cartQuantityButton}
                        >
                          <Ionicons
                            name="remove"
                            size={16}
                            color={COLORS.text}
                          />
                        </Pressable>

                        <Text style={styles.cartQuantityValue}>
                          {ligne.quantite}
                        </Text>

                        <Pressable
                          onPress={() =>
                            augmenterQuantitePanier(
                              ligne.produit.id
                            )
                          }
                          disabled={
                            sendingAchat ||
                            ligne.quantite >=
                              ligne.produit.quantite
                          }
                          style={[
                            styles.cartQuantityButton,
                            ligne.quantite >=
                              ligne.produit.quantite &&
                              styles.cartQuantityButtonDisabled,
                          ]}
                        >
                          <Ionicons
                            name="add"
                            size={16}
                            color={COLORS.text}
                          />
                        </Pressable>
                      </View>

                      <Text style={styles.cartItemSubtotal}>
                        {(
                          ligne.produit.prix *
                          ligne.quantite
                        ).toLocaleString(
                          "fr-FR",
                          {
                            style: "currency",
                            currency: "EUR",
                          }
                        )}
                      </Text>
                    </View>

                    <Text style={styles.cartStockText}>
                      {ligne.produit.quantite} en stock
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.cartSummary}>
              <View style={styles.cartPaymentInfo}>
                <View style={styles.cartPaymentIcon}>
                  <Ionicons
                    name="storefront-outline"
                    size={18}
                    color={COLORS.text}
                  />
                </View>

                <View style={styles.cartPaymentTextBlock}>
                  <Text style={styles.cartPaymentLabel}>
                    Paiement sur place
                  </Text>

                  <Text style={styles.cartPaymentText}>
                    Votre commande sera validée par l’administration lors du paiement.
                  </Text>
                </View>
              </View>

              <View style={styles.cartTotalRow}>
                <Text style={styles.cartTotalLabel}>
                  Total
                </Text>

                <Text style={styles.cartTotalValue}>
                  {totalPanier.toLocaleString(
                    "fr-FR",
                    {
                      style: "currency",
                      currency: "EUR",
                    }
                  )}
                </Text>
              </View>

              <Pressable
                onPress={validerPanier}
                disabled={
                  sendingAchat ||
                  panier.length === 0
                }
                accessibilityRole="button"
                accessibilityLabel="Valider ma commande"
                style={({ pressed }) => [
                  styles.cartSubmitButton,
                  sendingAchat &&
                    styles.cartSubmitButtonDisabled,
                  pressed &&
                    !sendingAchat &&
                    styles.pressed,
                ]}
              >
                {sendingAchat ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.text}
                  />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={19}
                      color={COLORS.text}
                    />

                    <Text style={styles.cartSubmitButtonText}>
                      Valider ma commande
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={
          empruntSelectionne !== null
        }
        transparent
        animationType="fade"
        onRequestClose={
          fermerDemandeEmprunt
        }
      >
        <View
          style={styles.modalBackdrop}
        >
          <Pressable
            style={
              StyleSheet.absoluteFillObject
            }
            onPress={
              fermerDemandeEmprunt
            }
          />

          <View
            style={styles.loanModal}
          >
            <View
              style={
                styles.loanModalHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.loanModalEyebrow
                  }
                >
                  DEMANDE D’EMPRUNT
                </Text>

                <Text
                  style={
                    styles.loanModalTitle
                  }
                >
                  Confirmer
                </Text>
              </View>

              <Pressable
                onPress={
                  fermerDemandeEmprunt
                }
                disabled={
                  sendingEmprunt
                }
                accessibilityRole="button"
                accessibilityLabel="Fermer"
                style={
                  styles.loanModalClose
                }
              >
                <Ionicons
                  name="close"
                  size={21}
                  color={
                    COLORS.text
                  }
                />
              </Pressable>
            </View>

            {empruntSelectionne ? (
              <>
                <View
                  style={
                    styles.loanProductRow
                  }
                >
                  <Image
                    source={{
                      uri:
                        empruntSelectionne.image ||
                        FALLBACK_PRODUCT_IMAGE,
                    }}
                    style={
                      styles.loanProductImage
                    }
                    resizeMode="cover"
                  />

                  <View
                    style={
                      styles.loanProductInfo
                    }
                  >
                    <Text
                      style={
                        styles.loanProductName
                      }
                      numberOfLines={2}
                    >
                      {
                        empruntSelectionne.nom
                      }
                    </Text>

                    <Text
                      style={
                        styles.loanProductMeta
                      }
                    >
                      {
                        empruntSelectionne.quantite
                      }{" "}
                      disponible
                      {empruntSelectionne.taille
                        ? ` • Taille ${empruntSelectionne.taille}`
                        : ""}
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.loanSection
                  }
                >
                  <Text
                    style={
                      styles.loanSectionLabel
                    }
                  >
                    Quantité
                  </Text>

                  <View
                    style={
                      styles.quantitySelector
                    }
                  >
                    <Pressable
                      onPress={() =>
                        setQuantiteEmprunt(
                          (current) =>
                            Math.max(
                              1,
                              current - 1
                            )
                        )
                      }
                      disabled={
                        quantiteEmprunt <=
                          1 ||
                        sendingEmprunt
                      }
                      style={[
                        styles.quantityButton,
                        quantiteEmprunt <=
                          1 &&
                          styles.quantityButtonDisabled,
                      ]}
                    >
                      <Ionicons
                        name="remove"
                        size={18}
                        color={
                          COLORS.text
                        }
                      />
                    </Pressable>

                    <Text
                      style={
                        styles.quantityValue
                      }
                    >
                      {quantiteEmprunt}
                    </Text>

                    <Pressable
                      onPress={() =>
                        setQuantiteEmprunt(
                          (current) =>
                            Math.min(
                              empruntSelectionne.quantite,
                              current + 1
                            )
                        )
                      }
                      disabled={
                        quantiteEmprunt >=
                          empruntSelectionne.quantite ||
                        sendingEmprunt
                      }
                      style={[
                        styles.quantityButton,
                        quantiteEmprunt >=
                          empruntSelectionne.quantite &&
                          styles.quantityButtonDisabled,
                      ]}
                    >
                      <Ionicons
                        name="add"
                        size={18}
                        color={
                          COLORS.text
                        }
                      />
                    </Pressable>
                  </View>
                </View>

                <View
                  style={
                    styles.loanSection
                  }
                >
                  <Text
                    style={
                      styles.loanSectionLabel
                    }
                  >
                    Durée souhaitée
                  </Text>

                  <View
                    style={
                      styles.loanDurationRow
                    }
                  >
                    {[7, 14, 21].map(
                      (jours) => {
                        const active =
                          dureeEmprunt ===
                          jours;

                        return (
                          <Pressable
                            key={jours}
                            onPress={() =>
                              setDureeEmprunt(
                                jours
                              )
                            }
                            disabled={
                              sendingEmprunt
                            }
                            style={[
                              styles.loanDurationButton,
                              active &&
                                styles.loanDurationButtonActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.loanDurationText,
                                active &&
                                  styles.loanDurationTextActive,
                              ]}
                            >
                              {jours} jours
                            </Text>
                          </Pressable>
                        );
                      }
                    )}
                  </View>

                  <View
                    style={
                      styles.returnDateBox
                    }
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={17}
                      color={
                        COLORS.muted
                      }
                    />

                    <Text
                      style={
                        styles.returnDateText
                      }
                    >
                      Retour prévu :{" "}
                      {new Date(
                        `${getDateRetourPrevue(
                          dureeEmprunt
                        )}T12:00:00`
                      ).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </Text>
                  </View>
                </View>

                <Text
                  style={
                    styles.loanInformation
                  }
                >
                  La demande sera
                  transmise à
                  l’administration.
                  L’équipement ne sera
                  réservé qu’après
                  validation.
                </Text>

                <Pressable
                  onPress={
                    envoyerDemandeEmprunt
                  }
                  disabled={
                    sendingEmprunt
                  }
                  style={({ pressed }) => [
                    styles.loanSubmitButton,
                    pressed &&
                      !sendingEmprunt &&
                      styles.pressed,
                    sendingEmprunt &&
                      styles.loanSubmitButtonDisabled,
                  ]}
                >
                  {sendingEmprunt ? (
                    <ActivityIndicator
                      size="small"
                      color={
                        COLORS.text
                      }
                    />
                  ) : (
                    <>
                      <Ionicons
                        name="paper-plane-outline"
                        size={18}
                        color={
                          COLORS.text
                        }
                      />

                      <Text
                        style={
                          styles.loanSubmitText
                        }
                      >
                        Envoyer la demande
                      </Text>
                    </>
                  )}
                </Pressable>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
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

      <View style={styles.promotionOverlay} />

      <View style={styles.promotionContent}>
        <View style={styles.promotionBadge}>
          <Ionicons
            name="flash"
            size={13}
            color={COLORS.text}
          />

          <Text style={styles.promotionBadgeText}>
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
  statutEmprunt: StatutEmpruntActif | null;
  onPress: () => void;
}

function ProductCard({
  produit,
  mode,
  disabled,
  statutEmprunt,
  onPress,
}: ProductCardProps) {
  const indisponibleStock =
    produit.quantite <= 0;

  const libelleStatutEmprunt =
    statutEmprunt === "EN_ATTENTE"
      ? "Demande en attente"
      : statutEmprunt === "EN_COURS"
        ? "Emprunt en cours"
        : null;

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
            uri:
              produit.image ||
              FALLBACK_PRODUCT_IMAGE,
          }}
          style={styles.productImage}
          resizeMode="cover"
          accessibilityLabel={`Photo du produit ${produit.nom}`}
        />

        <View
          style={[
            styles.stockBadge,
            !indisponibleStock &&
              styles.stockBadgeAvailable,
          ]}
        >
          <Text
            style={styles.stockBadgeText}
          >
            {indisponibleStock
              ? "Rupture"
              : `${produit.quantite} en stock`}
          </Text>
        </View>

        {mode === "EMPRUNT" &&
        libelleStatutEmprunt ? (
          <View
            style={[
              styles.loanStatusBadge,
              statutEmprunt === "EN_COURS" &&
                styles.loanStatusBadgeCurrent,
            ]}
          >
            <Ionicons
              name={
                statutEmprunt === "EN_COURS"
                  ? "checkmark-circle-outline"
                  : "time-outline"
              }
              size={12}
              color={COLORS.text}
            />

            <Text
              style={styles.loanStatusBadgeText}
            >
              {libelleStatutEmprunt}
            </Text>
          </View>
        ) : null}
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
                : libelleStatutEmprunt
                  ? `${produit.nom} : ${libelleStatutEmprunt}`
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
                  : statutEmprunt
                    ? "lock-closed-outline"
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

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  headerActionButton: {
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
    backgroundColor:
      COLORS.surface,
    borderRadius: 28,
  },

  promotionBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  promotionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      "rgba(0, 0, 0, 0.27)",
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

  loanStatusBadge: {
    position: "absolute",
    right: 9,
    bottom: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor:
      "rgba(128,0,32,0.92)",
    borderRadius: 20,
  },

  loanStatusBadgeCurrent: {
    backgroundColor:
      "rgba(23,77,124,0.94)",
  },

  loanStatusBadgeText: {
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

  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor:
      "rgba(0,0,0,0.72)",
  },

  cartModal: {
    width: "100%",
    maxHeight: "88%",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
    backgroundColor:
      COLORS.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  cartModalHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    marginBottom: 15,
    backgroundColor: "#555555",
    borderRadius: 999,
  },

  cartModalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  cartModalEyebrow: {
    color: COLORS.red,
    fontSize: 9,
    letterSpacing: 1.4,
    fontFamily: "Inter_700Bold",
  },

  cartModalTitle: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 26,
    letterSpacing: -0.6,
    fontFamily: "Inter_700Bold",
  },

  cartModalSubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },

  cartModalClose: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      COLORS.surfaceSoft,
    borderRadius: 15,
  },

  cartItemsScroll: {
    maxHeight: 390,
  },

  cartItemsContent: {
    paddingBottom: 4,
  },

  cartItem: {
    flexDirection: "row",
    marginBottom: 11,
    padding: 11,
    backgroundColor:
      COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 19,
  },

  cartItemImage: {
    width: 76,
    height: 86,
    borderRadius: 14,
  },

  cartItemContent: {
    flex: 1,
    marginLeft: 12,
  },

  cartItemTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  cartItemTextBlock: {
    flex: 1,
    paddingRight: 8,
  },

  cartItemName: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 19,
    fontFamily: "Inter_700Bold",
  },

  cartItemUnitPrice: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },

  cartDeleteButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(248,113,113,0.10)",
    borderRadius: 11,
  },

  cartItemBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },

  cartQuantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    padding: 3,
    backgroundColor:
      COLORS.background,
    borderRadius: 12,
  },

  cartQuantityButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "#303030",
    borderRadius: 9,
  },

  cartQuantityButtonDisabled: {
    opacity: 0.35,
  },

  cartQuantityValue: {
    minWidth: 30,
    color: COLORS.text,
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Inter_700Bold",
  },

  cartItemSubtotal: {
    color: COLORS.text,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },

  cartStockText: {
    marginTop: 7,
    color: COLORS.muted,
    fontSize: 9,
    fontFamily: "Inter_400Regular",
  },

  cartSummary: {
    marginTop: 12,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor:
      COLORS.border,
  },

  cartPaymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor:
      COLORS.background,
    borderRadius: 16,
  },

  cartPaymentIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(128,0,32,0.35)",
    borderRadius: 12,
  },

  cartPaymentTextBlock: {
    flex: 1,
    marginLeft: 11,
  },

  cartPaymentLabel: {
    color: COLORS.text,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },

  cartPaymentText: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 14,
    fontFamily: "Inter_400Regular",
  },

  cartTotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 17,
  },

  cartTotalLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  cartTotalValue: {
    color: COLORS.text,
    fontSize: 24,
    letterSpacing: -0.5,
    fontFamily: "Inter_700Bold",
  },

  cartSubmitButton: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 16,
    backgroundColor:
      COLORS.burgundy,
    borderRadius: 17,
  },

  cartSubmitButtonDisabled: {
    opacity: 0.55,
  },

  cartSubmitButtonText: {
    color: COLORS.text,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },

  loanModal: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor:
      COLORS.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  loanModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  loanModalEyebrow: {
    marginBottom: 4,
    color: COLORS.red,
    fontSize: 9,
    letterSpacing: 1.4,
    fontFamily: "Inter_700Bold",
  },

  loanModalTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },

  loanModalClose: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      COLORS.surfaceSoft,
    borderRadius: 15,
  },

  loanProductRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
    backgroundColor:
      COLORS.surfaceSoft,
    borderRadius: 20,
  },

  loanProductImage: {
    width: 72,
    height: 72,
    borderRadius: 15,
  },

  loanProductInfo: {
    flex: 1,
  },

  loanProductName: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 21,
    fontFamily: "Inter_700Bold",
  },

  loanProductMeta: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },

  loanSection: {
    marginTop: 20,
  },

  loanSectionLabel: {
    marginBottom: 10,
    color: COLORS.text,
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  quantitySelector: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 5,
    backgroundColor:
      COLORS.background,
    borderRadius: 16,
  },

  quantityButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      COLORS.surfaceSoft,
    borderRadius: 12,
  },

  quantityButtonDisabled: {
    opacity: 0.35,
  },

  quantityValue: {
    minWidth: 24,
    color: COLORS.text,
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Inter_700Bold",
  },

  loanDurationRow: {
    flexDirection: "row",
    gap: 8,
  },

  loanDurationButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 43,
    backgroundColor:
      COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
  },

  loanDurationButtonActive: {
    backgroundColor:
      COLORS.burgundy,
    borderColor:
      COLORS.burgundy,
  },

  loanDurationText: {
    color: COLORS.muted,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },

  loanDurationTextActive: {
    color: COLORS.text,
  },

  returnDateBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    backgroundColor:
      COLORS.background,
    borderRadius: 14,
  },

  returnDateText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: "Inter_400Regular",
  },

  loanInformation: {
    marginTop: 18,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
    fontFamily: "Inter_400Regular",
  },

  loanSubmitButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 20,
    backgroundColor:
      COLORS.burgundy,
    borderRadius: 17,
  },

  loanSubmitButtonDisabled: {
    opacity: 0.55,
  },

  loanSubmitText: {
    color: COLORS.text,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },

  loadingBox: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 16,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
  },

  loadingText: {
    color: COLORS.muted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },

  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    marginBottom: 12,
    padding: 14,
    backgroundColor:
      "rgba(127,29,29,0.22)",
    borderWidth: 1,
    borderColor:
      "rgba(248,113,113,0.28)",
    borderRadius: 18,
  },

  errorText: {
    flex: 1,
    color: "#FECACA",
    fontSize: 11,
    lineHeight: 16,
    fontFamily: "Inter_400Regular",
  },

  retryButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor:
      "rgba(255,255,255,0.08)",
    borderRadius: 12,
  },

  retryButtonText: {
    color: COLORS.text,
    fontSize: 10,
    fontFamily: "Inter_700Bold",
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