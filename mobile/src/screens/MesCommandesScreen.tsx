import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import type {
  RootStackParamList,
} from "../navigation/RootNavigator";
import Reanimated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import api from "../services/api";


type NavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    "MesCommandes"
  >;
type CommandeTab = "ACHATS" | "EMPRUNTS";
type EmpruntFilter = "TOUS" | "EN_ATTENTE" | "EN_COURS" | "TERMINE";
type AchatFilter = "TOUS" | "EN_ATTENTE" | "PAYE" | "REFUSE";

type StatusVariant = "waiting" | "success" | "danger" | "neutral";

interface StatusInfo {
  label: string;
  variant: StatusVariant;
  icon: keyof typeof Ionicons.glyphMap;
}

interface EmpruntEquipementDTO {
  id: number;
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

interface AchatEquipementDTO {
  id: number;
  dateAchat?: string | null;
  quantite?: number | null;
  montantTotal?: number | null;
  modePaiement?: string | null;
  statutPaiement?: string | null;

  utilisateurId?: number | null;
  utilisateurNom?: string | null;
  utilisateurPrenom?: string | null;

  equipementId?: number | null;
  equipementNom?: string | null;
  equipementType?: string | null;
  lienImage?: string | null;
  quantiteDisponible?: number | null;
}

type CommandeListItem =
  | {
      type: "ACHAT";
      data: AchatEquipementDTO;
    }
  | {
      type: "EMPRUNT";
      data: EmpruntEquipementDTO;
    };

const COLORS = {
  background: "#121212",
  backgroundElevated: "#171717",
  card: "#1B1B1B",
  cardSoft: "#292929",
  border: "#303030",
  borderSoft: "#282828",
  text: "#FFFFFF",
  textSecondary: "#B3B3B3",
  textMuted: "#7C7C7C",
  red: "#E50914",
  burgundy: "#800020",
  green: "#3DDC84",
  amber: "#F5B942",
  danger: "#F87171",
};

const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=900&q=80";

const EMPRUNT_FILTERS: Array<{ id: EmpruntFilter; label: string }> = [
  { id: "TOUS", label: "Tous" },
  { id: "EN_ATTENTE", label: "En attente" },
  { id: "EN_COURS", label: "En cours" },
  { id: "TERMINE", label: "Terminés" },
];

const ACHAT_FILTERS: Array<{ id: AchatFilter; label: string }> = [
  { id: "TOUS", label: "Tous" },
  { id: "EN_ATTENTE", label: "En attente" },
  { id: "PAYE", label: "Payés" },
  { id: "REFUSE", label: "Refusés" },
];

export default function MesCommandesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const [selectedTab, setSelectedTab] = useState<CommandeTab>("EMPRUNTS");
  const [empruntFilter, setEmpruntFilter] = useState<EmpruntFilter>("TOUS");
  const [achatFilter, setAchatFilter] = useState<AchatFilter>("TOUS");

  const [emprunts, setEmprunts] = useState<EmpruntEquipementDTO[]>([]);
  const [achats, setAchats] = useState<AchatEquipementDTO[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchCommandes = useCallback(async () => {
    try {
      setError("");

      const [empruntsResponse, achatsResponse] = await Promise.all([
        api.get<EmpruntEquipementDTO[]>("/emprunts-equipements/me"),
        api.get<AchatEquipementDTO[]>("/achats-equipements/me"),
      ]);

      setEmprunts(
        Array.isArray(empruntsResponse.data)
          ? empruntsResponse.data
          : []
      );

      setAchats(
        Array.isArray(achatsResponse.data)
          ? achatsResponse.data
          : []
      );
    } catch (requestError: any) {
      console.error("Erreur chargement des commandes :", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          "Impossible de charger vos commandes pour le moment."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchCommandes();
    }
  }, [fetchCommandes, isFocused]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCommandes();
  }, [fetchCommandes]);

  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("Main");
  }, [navigation]);

  const filteredEmprunts = useMemo(() => {
    return [...emprunts]
      .filter((emprunt) => {
        const statut = normalizeValue(emprunt.statutEmprunt);
        if (empruntFilter === "EN_ATTENTE") return statut === "EN_ATTENTE";
        if (empruntFilter === "EN_COURS") return statut === "EN_COURS";
        if (empruntFilter === "TERMINE") return statut === "RETOURNE" || statut === "REFUSE";
        return true;
      })
      .sort((a, b) => parseDateValue(b.dateEmprunt) - parseDateValue(a.dateEmprunt));
  }, [emprunts, empruntFilter]);

  const filteredAchats = useMemo(() => {
    return [...achats]
      .filter((achat) => {
        const statut = normalizeValue(achat.statutPaiement);

        if (achatFilter === "EN_ATTENTE") {
          return statut === "EN_ATTENTE";
        }

        if (achatFilter === "PAYE") {
          return statut === "PAYE";
        }

        if (achatFilter === "REFUSE") {
          return statut === "REFUSE";
        }

        return true;
      })
      .sort(
        (a, b) =>
          parseDateValue(b.dateAchat) -
          parseDateValue(a.dateAchat)
      );
  }, [achats, achatFilter]);

  const empruntStatistics = useMemo(() => {
    const enAttente = emprunts.filter(
      (item) => normalizeValue(item.statutEmprunt) === "EN_ATTENTE"
    ).length;

    const enCours = emprunts.filter(
      (item) => normalizeValue(item.statutEmprunt) === "EN_COURS"
    ).length;

    return {
      total: emprunts.length,
      enAttente,
      enCours,
    };
  }, [emprunts]);

  const achatStatistics = useMemo(() => {
    const enAttente = achats.filter(
      (item) => normalizeValue(item.statutPaiement) === "EN_ATTENTE"
    ).length;

    const payes = achats.filter(
      (item) => normalizeValue(item.statutPaiement) === "PAYE"
    ).length;

    return {
      total: achats.length,
      enAttente,
      payes,
    };
  }, [achats]);

  const listData = useMemo<CommandeListItem[]>(() => {
    if (selectedTab === "ACHATS") {
      return filteredAchats.map((achat) => ({
        type: "ACHAT" as const,
        data: achat,
      }));
    }

    return filteredEmprunts.map((emprunt) => ({
      type: "EMPRUNT" as const,
      data: emprunt,
    }));
  }, [
    selectedTab,
    filteredAchats,
    filteredEmprunts,
  ]);

  if (loading) {
    return <LoadingScreen isFocused={isFocused} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {isFocused ? <StatusBar style="light" animated /> : null}

      <FlatList
        data={listData}
        keyExtractor={(item) =>
          `${item.type}-${item.data.id}`
        }
        renderItem={({ item, index }) => (
          <Reanimated.View entering={FadeInDown.duration(380).delay(index * 45)}>
            {item.type === "ACHAT" ? (
              <AchatCard achat={item.data} />
            ) : (
              <EmpruntCard emprunt={item.data} />
            )}
          </Reanimated.View>
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.red}
            colors={[COLORS.red]}
            progressBackgroundColor={COLORS.card}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 110 },
          listData.length === 0 &&
            styles.emptyListContent,
        ]}
        ListHeaderComponent={
          <View>
            <Reanimated.View entering={FadeInUp.duration(330)}>
              <ScreenHeader onGoBack={handleGoBack} />
            </Reanimated.View>

            <Reanimated.View entering={FadeInUp.duration(420).delay(50)}>
              <View style={styles.introSection}>
                <Text style={styles.introEyebrow}>BOUTIQUE SDMAA</Text>
                <Text style={styles.introTitle}>Suivi de mes commandes</Text>
                <Text style={styles.introText}>
                  Retrouvez vos achats et suivez vos demandes d’emprunt de matériel.
                </Text>
              </View>
            </Reanimated.View>

            <CommandTabs selectedTab={selectedTab} onChange={setSelectedTab} />

            {selectedTab === "EMPRUNTS" ? (
              <>
                <StatisticsSection
                  total={empruntStatistics.total}
                  waiting={empruntStatistics.enAttente}
                  current={empruntStatistics.enCours}
                  labels={{
                    total: "Total",
                    waiting: "En attente",
                    current: "En cours",
                  }}
                  icons={{
                    total: "layers-outline",
                    waiting: "time-outline",
                    current: "repeat-outline",
                  }}
                />

                <EmpruntFilterSection
                  selectedFilter={empruntFilter}
                  onChange={setEmpruntFilter}
                />

                {error ? (
                  <ErrorBox
                    message={error}
                    onRetry={fetchCommandes}
                  />
                ) : null}

                <SectionHeader
                  eyebrow="MES EMPRUNTS"
                  title="Historique"
                  count={filteredEmprunts.length}
                />
              </>
            ) : (
              <>
                <StatisticsSection
                  total={achatStatistics.total}
                  waiting={achatStatistics.enAttente}
                  current={achatStatistics.payes}
                  labels={{
                    total: "Total",
                    waiting: "En attente",
                    current: "Payés",
                  }}
                  icons={{
                    total: "bag-handle-outline",
                    waiting: "time-outline",
                    current: "checkmark-circle-outline",
                  }}
                />

                <AchatFilterSection
                  selectedFilter={achatFilter}
                  onChange={setAchatFilter}
                />

                {error ? (
                  <ErrorBox
                    message={error}
                    onRetry={fetchCommandes}
                  />
                ) : null}

                <SectionHeader
                  eyebrow="MES ACHATS"
                  title="Mes commandes"
                  count={filteredAchats.length}
                />
              </>
            )}
          </View>
        }
        ListEmptyComponent={
          selectedTab === "ACHATS" ? (
            <EmptyState
              icon={
                error
                  ? "cloud-offline-outline"
                  : "bag-handle-outline"
              }
              title={
                error
                  ? "Chargement impossible"
                  : achatFilter === "TOUS"
                    ? "Aucun achat"
                    : "Aucun résultat"
              }
              description={
                error
                  ? "Actualisez la page ou réessayez dans quelques instants."
                  : achatFilter === "TOUS"
                    ? "Vos commandes d’achat apparaîtront ici après leur validation dans la boutique."
                    : "Aucun achat ne correspond au filtre sélectionné."
              }
            />
          ) : (
            <EmptyState
              icon={
                error
                  ? "cloud-offline-outline"
                  : "repeat-outline"
              }
              title={
                error
                  ? "Chargement impossible"
                  : empruntFilter === "TOUS"
                    ? "Aucun emprunt"
                    : "Aucun résultat"
              }
              description={
                error
                  ? "Actualisez la page ou réessayez dans quelques instants."
                  : empruntFilter === "TOUS"
                    ? "Vos demandes d’emprunt apparaîtront ici après leur création dans la boutique."
                    : "Aucun emprunt ne correspond au filtre sélectionné."
              }
            />
          )
        }
      />
    </SafeAreaView>
  );
}

function ScreenHeader({ onGoBack }: { onGoBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onGoBack}
        accessibilityRole="button"
        accessibilityLabel="Retour"
        style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
      >
        <Ionicons name="chevron-back" size={23} color={COLORS.text} />
      </Pressable>
      <Text style={styles.headerTitle}>Mes commandes</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function CommandTabs({ selectedTab, onChange }: {
  selectedTab: CommandeTab;
  onChange: (tab: CommandeTab) => void;
}) {
  return (
    <View style={styles.tabsContainer}>
      <TabButton
        active={selectedTab === "ACHATS"}
        icon="card-outline"
        label="Achats"
        onPress={() => onChange("ACHATS")}
      />
      <TabButton
        active={selectedTab === "EMPRUNTS"}
        icon="repeat-outline"
        label="Emprunts"
        onPress={() => onChange("EMPRUNTS")}
      />
    </View>
  );
}

function TabButton({ active, icon, label, onPress }: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.tabButton,
        active && styles.tabButtonActive,
        pressed && styles.buttonPressed,
      ]}
    >
      <Ionicons name={icon} size={18} color={active ? COLORS.text : COLORS.textSecondary} />
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

function StatisticsSection({
  total,
  waiting,
  current,
  labels,
  icons,
}: {
  total: number;
  waiting: number;
  current: number;
  labels: {
    total: string;
    waiting: string;
    current: string;
  };
  icons: {
    total: keyof typeof Ionicons.glyphMap;
    waiting: keyof typeof Ionicons.glyphMap;
    current: keyof typeof Ionicons.glyphMap;
  };
}) {
  return (
    <View style={styles.statisticsContainer}>
      <StatisticCard
        icon={icons.total}
        value={total}
        label={labels.total}
      />

      <StatisticCard
        icon={icons.waiting}
        value={waiting}
        label={labels.waiting}
      />

      <StatisticCard
        icon={icons.current}
        value={current}
        label={labels.current}
      />
    </View>
  );
}

function StatisticCard({ icon, value, label }: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
}) {
  return (
    <View style={styles.statisticCard}>
      <Ionicons name={icon} size={17} color={COLORS.red} />
      <Text style={styles.statisticValue}>{value}</Text>
      <Text style={styles.statisticLabel}>{label}</Text>
    </View>
  );
}

function EmpruntFilterSection({ selectedFilter, onChange }: {
  selectedFilter: EmpruntFilter;
  onChange: (filter: EmpruntFilter) => void;
}) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterEyebrow}>FILTRER</Text>
      <View style={styles.filters}>
        {EMPRUNT_FILTERS.map((filter) => {
          const selected = selectedFilter === filter.id;
          return (
            <Pressable
              key={filter.id}
              onPress={() => onChange(filter.id)}
              style={({ pressed }) => [
                styles.filterButton,
                selected && styles.filterButtonSelected,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={[styles.filterButtonText, selected && styles.filterButtonTextSelected]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function AchatFilterSection({
  selectedFilter,
  onChange,
}: {
  selectedFilter: AchatFilter;
  onChange: (filter: AchatFilter) => void;
}) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterEyebrow}>
        FILTRER
      </Text>

      <View style={styles.filters}>
        {ACHAT_FILTERS.map((filter) => {
          const selected =
            selectedFilter === filter.id;

          return (
            <Pressable
              key={filter.id}
              onPress={() =>
                onChange(filter.id)
              }
              style={({ pressed }) => [
                styles.filterButton,
                selected &&
                  styles.filterButtonSelected,
                pressed &&
                  styles.buttonPressed,
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selected &&
                    styles.filterButtonTextSelected,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function SectionHeader({ eyebrow, title, count }: {
  eyebrow: string;
  title: string;
  count: number;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.countPill}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
  );
}

function AchatCard({
  achat,
}: {
  achat: AchatEquipementDTO;
}) {
  const status =
    getPurchaseStatus(
      achat.statutPaiement
    );

  const imageUrl =
    resolveImageUrl(
      achat.lienImage
    );

  return (
    <View style={styles.purchaseCard}>
      <View style={styles.purchaseAccent} />

      <View style={styles.purchaseTopRow}>
        <Image
          source={{
            uri:
              imageUrl ||
              FALLBACK_PRODUCT_IMAGE,
          }}
          style={styles.purchaseImage}
          resizeMode="cover"
        />

        <View style={styles.purchaseHeaderContent}>
          <StatusBadge
            status={status}
          />

          <Text
            style={styles.purchaseName}
            numberOfLines={2}
          >
            {achat.equipementNom ||
              "Équipement"}
          </Text>

          {achat.equipementType ? (
            <Text
              style={styles.purchaseType}
            >
              {formatEquipmentType(
                achat.equipementType
              )}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.informationList}>
        <InformationRow
          icon="cube-outline"
          label="Quantité"
          value={String(
            achat.quantite ?? 1
          )}
        />

        <InformationRow
          icon="calendar-outline"
          label="Commandé le"
          value={formatDate(
            achat.dateAchat
          )}
        />

        <InformationRow
          icon="wallet-outline"
          label="Paiement"
          value={formatPaymentMode(
            achat.modePaiement
          )}
        />
      </View>

      <View style={styles.purchaseTotalRow}>
        <Text style={styles.purchaseTotalLabel}>
          Montant total
        </Text>

        <Text style={styles.purchaseTotalValue}>
          {formatCurrency(
            achat.montantTotal
          )}
        </Text>
      </View>

      {normalizeValue(
        achat.statutPaiement
      ) === "EN_ATTENTE" ? (
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={COLORS.amber}
          />

          <Text style={styles.infoBoxText}>
            Votre commande a été transmise à l’administration. Le paiement s’effectue sur place.
          </Text>
        </View>
      ) : null}

      {normalizeValue(
        achat.statutPaiement
      ) === "PAYE" ? (
        <View
          style={[
            styles.infoBox,
            styles.infoBoxSuccess,
          ]}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={18}
            color={COLORS.green}
          />

          <Text style={styles.infoBoxText}>
            Votre paiement a été validé par l’administration.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function EmpruntCard({ emprunt }: { emprunt: EmpruntEquipementDTO }) {
  const status = getLoanStatus(emprunt.statutEmprunt);
  const returned = normalizeValue(emprunt.statutEmprunt) === "RETOURNE";

  return (
    <View style={styles.loanCard}>
      <View style={styles.cardAccent} />

      <View style={styles.cardTopRow}>
        <View style={styles.productIcon}>
          <Ionicons
            name={getEquipmentIcon(emprunt.equipementType)}
            size={23}
            color={COLORS.text}
          />
        </View>
        <StatusBadge status={status} />
      </View>

      <Text style={styles.productName}>{emprunt.equipementNom || "Équipement"}</Text>
      {emprunt.equipementType ? (
        <Text style={styles.productType}>{formatEquipmentType(emprunt.equipementType)}</Text>
      ) : null}

      <View style={styles.informationList}>
        <InformationRow icon="cube-outline" label="Quantité" value={String(emprunt.quantite ?? 1)} />
        <InformationRow icon="calendar-outline" label="Demandé le" value={formatDate(emprunt.dateEmprunt)} />
        <InformationRow
          icon={returned ? "checkmark-circle-outline" : "calendar-number-outline"}
          label={returned ? "Retourné le" : "Retour prévu"}
          value={formatDate(returned ? emprunt.dateRetourEffective : emprunt.dateRetourPrevue)}
        />
      </View>

      {normalizeValue(emprunt.statutEmprunt) === "EN_ATTENTE" ? (
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.amber} />
          <Text style={styles.infoBoxText}>
            Votre demande a été transmise à l’administration. Le matériel n’est pas encore réservé.
          </Text>
        </View>
      ) : null}

      {normalizeValue(emprunt.statutEmprunt) === "EN_COURS" ? (
        <View style={[styles.infoBox, styles.infoBoxSuccess]}>
          <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.green} />
          <Text style={styles.infoBoxText}>
            Cet équipement est actuellement enregistré comme étant en votre possession.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function InformationRow({ icon, label, value }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.informationRow}>
      <Ionicons name={icon} size={17} color={COLORS.textSecondary} />
      <View style={styles.informationText}>
        <Text style={styles.informationLabel}>{label}</Text>
        <Text style={styles.informationValue}>{value}</Text>
      </View>
    </View>
  );
}

function StatusBadge({ status }: { status: StatusInfo }) {
  const badgeStyle = getStatusBadgeStyle(status.variant);
  const badgeTextStyle = getStatusBadgeTextStyle(status.variant);

  return (
    <View style={[styles.statusBadge, badgeStyle]}>
      <Ionicons
        name={status.icon}
        size={13}
        color={getStatusColor(status.variant)}
      />

      <Text style={[styles.statusBadgeText, badgeTextStyle]}>
        {status.label}
      </Text>
    </View>
  );
}

function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{message}</Text>
      <Pressable onPress={onRetry} style={styles.retryButton}>
        <Ionicons name="refresh" size={17} color={COLORS.text} />
      </Pressable>
    </View>
  );
}

function EmptyState({ icon, title, description }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={["rgba(229,9,20,0.17)", "rgba(229,9,20,0.05)"]}
        style={styles.emptyIconContainer}
      >
        <Ionicons name={icon} size={34} color={COLORS.red} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

function LoadingScreen({ isFocused }: { isFocused: boolean }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {isFocused ? <StatusBar style="light" animated /> : null}
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.text} />
        <Text style={styles.loadingText}>Chargement de vos commandes…</Text>
      </View>
    </SafeAreaView>
  );
}

function normalizeValue(value?: string | null): string {
  return value?.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") ?? "";
}

function parseDateValue(value?: string | null): number {
  if (!value) return 0;
  const parsed = new Date(`${value}T12:00:00`).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDate(value?: string | null): string {
  if (!value) return "Non renseigné";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatCurrency(
  value?: number | null
): string {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return "0,00 €";
  }

  return amount.toLocaleString(
    "fr-FR",
    {
      style: "currency",
      currency: "EUR",
    }
  );
}

function formatPaymentMode(
  value?: string | null
): string {
  switch (normalizeValue(value)) {
    case "ESPECES":
      return "Espèces";

    case "CARTE":
      return "Carte bancaire";

    case "VIREMENT":
      return "Virement";

    case "CHEQUE":
      return "Chèque";

    default:
      return value || "Sur place";
  }
}

function resolveImageUrl(
  value?: string | null
): string | null {
  if (!value?.trim()) {
    return null;
  }

  const cleanedValue =
    value.trim();

  if (
    cleanedValue.startsWith("http://") ||
    cleanedValue.startsWith("https://") ||
    cleanedValue.startsWith("file://") ||
    cleanedValue.startsWith("content://")
  ) {
    return cleanedValue;
  }

  const baseUrl = String(
    api.defaults.baseURL || ""
  )
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");

  const cleanedPath =
    cleanedValue
      .replace(/^\/+/, "")
      .replace(/^uploads\//, "");

  return `${baseUrl}/uploads/${cleanedPath}`;
}

function getPurchaseStatus(
  value?: string | null
): StatusInfo {
  switch (normalizeValue(value)) {
    case "EN_ATTENTE":
      return {
        label: "En attente",
        variant: "waiting",
        icon: "time-outline",
      };

    case "PAYE":
      return {
        label: "Payé",
        variant: "success",
        icon: "checkmark-circle-outline",
      };

    case "REFUSE":
      return {
        label: "Refusé",
        variant: "danger",
        icon: "close-circle-outline",
      };

    default:
      return {
        label:
          value || "Statut inconnu",
        variant: "neutral",
        icon: "help-circle-outline",
      };
  }
}

function getLoanStatus(value?: string | null): StatusInfo {
  switch (normalizeValue(value)) {
    case "EN_ATTENTE":
      return { label: "En attente", variant: "waiting", icon: "time-outline" };
    case "EN_COURS":
      return { label: "En cours", variant: "success", icon: "repeat-outline" };
    case "RETOURNE":
      return { label: "Retourné", variant: "neutral", icon: "checkmark-done-outline" };
    case "REFUSE":
      return { label: "Refusé", variant: "danger", icon: "close-circle-outline" };
    default:
      return { label: value || "Statut inconnu", variant: "neutral", icon: "help-circle-outline" };
  }
}

function getStatusColor(variant: StatusVariant): string {
  if (variant === "waiting") return COLORS.amber;
  if (variant === "success") return COLORS.green;
  if (variant === "danger") return COLORS.danger;
  return COLORS.textSecondary;
}

function getStatusBadgeStyle(variant: StatusVariant) {
  switch (variant) {
    case "waiting":
      return styles.statusBadge_waiting;
    case "success":
      return styles.statusBadge_success;
    case "danger":
      return styles.statusBadge_danger;
    default:
      return styles.statusBadge_neutral;
  }
}

function getStatusBadgeTextStyle(variant: StatusVariant) {
  switch (variant) {
    case "waiting":
      return styles.statusBadgeText_waiting;
    case "success":
      return styles.statusBadgeText_success;
    case "danger":
      return styles.statusBadgeText_danger;
    default:
      return styles.statusBadgeText_neutral;
  }
}

function getEquipmentIcon(type?: string | null): keyof typeof Ionicons.glyphMap {
  const value = normalizeValue(type);
  if (value.includes("DOBOK") || value.includes("TENUE")) return "shirt-outline";
  if (value.includes("CEINTURE")) return "ribbon-outline";
  if (value.includes("PROTECTION") || value.includes("PLASTRON") || value.includes("CASQUE")) {
    return "shield-outline";
  }
  return "cube-outline";
}

function formatEquipmentType(type?: string | null): string {
  if (!type) return "";
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  listContent: { paddingTop: 14, paddingHorizontal: 16 },
  emptyListContent: { flexGrow: 1 },
  header: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  backButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
  },
  headerTitle: { color: COLORS.text, fontSize: 17, fontFamily: "Inter_700Bold" },
  headerSpacer: { width: 46, height: 46 },

  introSection: {
    marginTop: 2,
    marginBottom: 18,
    paddingHorizontal: 2,
  },

  introEyebrow: {
    color: COLORS.red,
    fontSize: 10,
    letterSpacing: 1.5,
    fontFamily: "Inter_700Bold",
  },

  introTitle: {
    marginTop: 6,
    color: COLORS.text,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.5,
    fontFamily: "Inter_700Bold",
  },

  introText: {
    maxWidth: 330,
    marginTop: 7,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
  },

  tabsContainer: {
    flexDirection: "row",
    marginTop: 18,
    padding: 5,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 18,
  },
  tabButton: { flex: 1, minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14 },
  tabButtonActive: { backgroundColor: COLORS.burgundy },
  tabButtonText: { color: COLORS.textSecondary, fontSize: 13, fontFamily: "Inter_600SemiBold" },
  tabButtonTextActive: { color: COLORS.text },
  statisticsContainer: { flexDirection: "row", gap: 8, marginTop: 16 },
  statisticCard: { flex: 1, minHeight: 105, padding: 13, backgroundColor: COLORS.card, borderRadius: 20 },
  statisticValue: { marginTop: 12, color: COLORS.text, fontSize: 23, fontFamily: "Inter_700Bold" },
  statisticLabel: { marginTop: 3, color: COLORS.textMuted, fontSize: 9, fontFamily: "Inter_600SemiBold" },
  filterSection: { marginTop: 24 },
  filterEyebrow: { marginBottom: 11, color: COLORS.textMuted, fontSize: 10, letterSpacing: 1.4, fontFamily: "Inter_700Bold" },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterButton: { minHeight: 40, justifyContent: "center", paddingHorizontal: 14, backgroundColor: COLORS.card, borderRadius: 14 },
  filterButtonSelected: { backgroundColor: COLORS.red },
  filterButtonText: { color: COLORS.textSecondary, fontSize: 11, fontFamily: "Inter_600SemiBold" },
  filterButtonTextSelected: { color: COLORS.text },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 27, marginBottom: 14 },
  sectionEyebrow: { color: COLORS.textMuted, fontSize: 10, letterSpacing: 1.4, fontFamily: "Inter_700Bold" },
  sectionTitle: { marginTop: 5, color: COLORS.text, fontSize: 20, fontFamily: "Inter_700Bold" },
  countPill: { minWidth: 35, minHeight: 35, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.card, borderRadius: 18 },
  countText: { color: COLORS.text, fontSize: 12, fontFamily: "Inter_700Bold" },
  purchaseCard: {
    position: "relative",
    overflow: "hidden",
    marginBottom: 13,
    padding: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 24,
  },

  purchaseAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 3,
    backgroundColor: "#60A5FA",
  },

  purchaseTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  purchaseImage: {
    width: 82,
    height: 92,
    backgroundColor: COLORS.cardSoft,
    borderRadius: 17,
  },

  purchaseHeaderContent: {
    flex: 1,
    alignItems: "flex-start",
    marginLeft: 14,
  },

  purchaseName: {
    marginTop: 11,
    color: COLORS.text,
    fontSize: 18,
    lineHeight: 23,
    letterSpacing: -0.3,
    fontFamily: "Inter_700Bold",
  },

  purchaseType: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },

  purchaseTotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
  },

  purchaseTotalLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },

  purchaseTotalValue: {
    color: COLORS.text,
    fontSize: 20,
    letterSpacing: -0.4,
    fontFamily: "Inter_700Bold",
  },

  loanCard: { position: "relative", overflow: "hidden", marginBottom: 13, padding: 18, backgroundColor: COLORS.card, borderRadius: 24 },
  cardAccent: { position: "absolute", top: 0, left: 0, bottom: 0, width: 3, backgroundColor: COLORS.red },
  cardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  productIcon: { width: 47, height: 47, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.cardSoft, borderRadius: 16 },
  productName: { marginTop: 17, color: COLORS.text, fontSize: 20, lineHeight: 25, fontFamily: "Inter_700Bold" },
  productType: { marginTop: 5, color: COLORS.textSecondary, fontSize: 11, fontFamily: "Inter_400Regular" },
  informationList: { marginTop: 18, gap: 10 },
  informationRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  informationText: { flex: 1 },
  informationLabel: { color: COLORS.textMuted, fontSize: 9, textTransform: "uppercase", letterSpacing: 0.65, fontFamily: "Inter_700Bold" },
  informationValue: { marginTop: 3, color: COLORS.text, fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, minHeight: 30, paddingHorizontal: 10, borderWidth: 1, borderRadius: 999 },
  statusBadge_waiting: { backgroundColor: "rgba(245,185,66,0.10)", borderColor: "rgba(245,185,66,0.22)" },
  statusBadge_success: { backgroundColor: "rgba(61,220,132,0.10)", borderColor: "rgba(61,220,132,0.22)" },
  statusBadge_danger: { backgroundColor: "rgba(248,113,113,0.10)", borderColor: "rgba(248,113,113,0.22)" },
  statusBadge_neutral: { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.09)" },
  statusBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  statusBadgeText_waiting: { color: COLORS.amber },
  statusBadgeText_success: { color: COLORS.green },
  statusBadgeText_danger: { color: COLORS.danger },
  statusBadgeText_neutral: { color: COLORS.textSecondary },
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 9, marginTop: 17, padding: 12, backgroundColor: "rgba(245,185,66,0.07)", borderRadius: 16 },
  infoBoxSuccess: { backgroundColor: "rgba(61,220,132,0.06)" },
  infoBoxText: { flex: 1, color: COLORS.textSecondary, fontSize: 10, lineHeight: 16, fontFamily: "Inter_400Regular" },
  errorBox: { flexDirection: "row", alignItems: "center", marginTop: 16, padding: 13, backgroundColor: "#281719", borderRadius: 17 },
  errorText: { flex: 1, color: "#FECACA", fontSize: 11, lineHeight: 16, fontFamily: "Inter_400Regular" },
  retryButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 58, paddingHorizontal: 30 },
  emptyIconContainer: { width: 70, height: 70, alignItems: "center", justifyContent: "center", borderRadius: 24 },
  emptyTitle: { marginTop: 17, color: COLORS.text, fontSize: 17, textAlign: "center", fontFamily: "Inter_700Bold" },
  emptyDescription: { maxWidth: 290, marginTop: 8, color: COLORS.textSecondary, fontSize: 12, lineHeight: 19, textAlign: "center", fontFamily: "Inter_400Regular" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { color: COLORS.textSecondary, fontSize: 12, fontFamily: "Inter_400Regular" },
  buttonPressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
});