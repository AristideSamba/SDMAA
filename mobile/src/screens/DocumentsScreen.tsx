// src/screens/DocumentsScreen.tsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import Reanimated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import api from "../services/api";

type DocumentFilter = "TOUS" | "EN_ATTENTE" | "VALIDES" | "EXPIRES";
type DocumentStatusVariant = "waiting" | "success" | "danger" | "neutral";

interface DocumentDTO {
  id: number;
  titre?: string | null;
  type?: string | null;
  urlFichier?: string | null;
  dateUpload?: string | null;
  dateExpiration?: string | null;
  estValide?: boolean | null;
  utilisateurId?: number | null;
  utilisateurNom?: string | null;
  activiteId?: number | null;
  activiteTitre?: string | null;
}

interface SelectedDocument {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

interface StatusInfo {
  label: string;
  variant: DocumentStatusVariant;
  icon: keyof typeof Ionicons.glyphMap;
}

const COLORS = {
  background: "#121212",
  backgroundElevated: "#171717",
  card: "#1B1B1B",
  cardSoft: "#252525",
  border: "#303030",
  borderSoft: "#282828",
  text: "#FFFFFF",
  textSecondary: "#B3B3B3",
  textMuted: "#7C7C7C",
  red: "#E50914",
  burgundy: "#800020",
  blue: "#60A5FA",
  blueCard: "#172733",
  green: "#34D399",
  amber: "#FBBF24",
  danger: "#F87171",
};

const DOCUMENT_FILTERS: Array<{ id: DocumentFilter; label: string }> = [
  { id: "TOUS", label: "Tous" },
  { id: "EN_ATTENTE", label: "En attente" },
  { id: "VALIDES", label: "Validés" },
  { id: "EXPIRES", label: "Expirés" },
];

const DOCUMENT_TYPES = [
  "Certificat médical",
  "Licence",
  "Passeport",
  "Autorisation parentale",
  "Diplôme",
  "Autre",
];

export default function DocumentsScreen() {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const [documents, setDocuments] = useState<DocumentDTO[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<DocumentFilter>("TOUS");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedDocument | null>(null);
  const [titre, setTitre] = useState("");
  const [typeDocument, setTypeDocument] = useState(DOCUMENT_TYPES[0]);
  const [dateExpiration, setDateExpiration] = useState("");

  const fetchDocuments = useCallback(async () => {
    try {
      setError("");

      const response = await api.get<DocumentDTO[]>("/documents/me");

      setDocuments(Array.isArray(response.data) ? response.data : []);
    } catch (requestError: any) {
      console.error("Erreur chargement documents :", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          "Impossible de charger vos documents pour le moment."
      );

      setDocuments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchDocuments();
    }
  }, [fetchDocuments, isFocused]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDocuments();
  }, [fetchDocuments]);

  const filteredDocuments = useMemo(() => {
    return [...documents]
      .filter((document) => {
        const status = getDocumentStatus(document);

        if (selectedFilter === "EN_ATTENTE") {
          return status.variant === "waiting";
        }

        if (selectedFilter === "VALIDES") {
          return status.variant === "success";
        }

        if (selectedFilter === "EXPIRES") {
          return status.label === "Expiré";
        }

        return true;
      })
      .sort(
        (a, b) =>
          parseDateValue(b.dateUpload) -
          parseDateValue(a.dateUpload)
      );
  }, [documents, selectedFilter]);

  const statistics = useMemo(() => {
    return {
      total: documents.length,
      waiting: documents.filter(
        (document) => getDocumentStatus(document).variant === "waiting"
      ).length,
      valid: documents.filter(
        (document) => getDocumentStatus(document).variant === "success"
      ).length,
    };
  }, [documents]);

  const resetUploadForm = useCallback(() => {
    setSelectedFile(null);
    setTitre("");
    setTypeDocument(DOCUMENT_TYPES[0]);
    setDateExpiration("");
  }, []);

  const closeUploadModal = useCallback(() => {
    if (uploading) return;

    setUploadModalVisible(false);
    resetUploadForm();
  }, [resetUploadForm, uploading]);

  const pickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/jpeg",
          "image/png",
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      if (!asset) return;

      const mimeType = asset.mimeType || guessMimeType(asset.name);

      setSelectedFile({
        uri: asset.uri,
        name: asset.name || `document-${Date.now()}`,
        mimeType,
        size: asset.size ?? undefined,
      });

      if (!titre.trim()) {
        setTitre(removeFileExtension(asset.name));
      }
    } catch (pickError) {
      console.error("Erreur sélection document :", pickError);

      Alert.alert(
        "Sélection impossible",
        "Impossible de sélectionner ce document."
      );
    }
  }, [titre]);

  const uploadDocument = useCallback(async () => {
    if (uploading) return;

    if (!selectedFile) {
      Alert.alert(
        "Document manquant",
        "Sélectionnez un fichier avant de continuer."
      );
      return;
    }

    if (!titre.trim()) {
      Alert.alert(
        "Titre obligatoire",
        "Saisissez un titre pour ce document."
      );
      return;
    }

    const expiration = dateExpiration.trim();

    if (expiration && !isValidDateInput(expiration)) {
      Alert.alert(
        "Date invalide",
        "Utilisez le format AAAA-MM-JJ, par exemple 2027-08-12."
      );
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append(
        "file",
        {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.mimeType,
        } as any
      );

      formData.append("titre", titre.trim());
      formData.append("typeDocument", typeDocument.trim());

      if (expiration) {
        formData.append("dateExpiration", expiration);
      }

      await api.post("/documents/me", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadModalVisible(false);
      resetUploadForm();

      await fetchDocuments();

      Alert.alert(
        "Document envoyé",
        "Votre document a bien été transmis. Il apparaît maintenant en attente de validation."
      );
    } catch (requestError: any) {
      console.error("Erreur upload document :", requestError);

      Alert.alert(
        "Envoi impossible",
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          "Impossible d'envoyer le document."
      );
    } finally {
      setUploading(false);
    }
  }, [
    dateExpiration,
    fetchDocuments,
    resetUploadForm,
    selectedFile,
    titre,
    typeDocument,
    uploading,
  ]);

  if (loading) {
    return <DocumentsLoading isFocused={isFocused} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {isFocused ? <StatusBar style="light" animated /> : null}

      <FlatList
        data={filteredDocuments}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <Reanimated.View
            entering={FadeInDown.duration(380).delay(index * 45)}
          >
            <DocumentCard document={item} />
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
          { paddingBottom: insets.bottom + 120 },
          filteredDocuments.length === 0 && styles.emptyListContent,
        ]}
        ListHeaderComponent={
          <View>
            <Reanimated.View entering={FadeInUp.duration(330)}>
              <DocumentsHeader
                onAdd={() => setUploadModalVisible(true)}
              />
            </Reanimated.View>

            <Reanimated.View
              entering={FadeInUp.duration(420).delay(50)}
            >
              <View style={styles.introSection}>
                <Text style={styles.introEyebrow}>
                  ESPACE DOCUMENTS
                </Text>

                <Text style={styles.introTitle}>
                  Mes documents
                </Text>

                <Text style={styles.introText}>
                  Centralisez vos justificatifs et suivez leur validation par le club.
                </Text>
              </View>
            </Reanimated.View>

            <StatisticsSection
              total={statistics.total}
              waiting={statistics.waiting}
              valid={statistics.valid}
            />

            <FilterSection
              selectedFilter={selectedFilter}
              onChange={setSelectedFilter}
            />

            {error ? (
              <ErrorBox
                message={error}
                onRetry={fetchDocuments}
              />
            ) : null}

            <SectionHeader
              title="Documents disponibles"
              count={filteredDocuments.length}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyDocuments
            hasError={Boolean(error)}
            selectedFilter={selectedFilter}
            onAdd={() => setUploadModalVisible(true)}
          />
        }
      />

      <UploadDocumentModal
        visible={uploadModalVisible}
        selectedFile={selectedFile}
        titre={titre}
        typeDocument={typeDocument}
        dateExpiration={dateExpiration}
        uploading={uploading}
        onClose={closeUploadModal}
        onPickDocument={pickDocument}
        onChangeTitre={setTitre}
        onChangeType={setTypeDocument}
        onChangeDateExpiration={setDateExpiration}
        onSubmit={uploadDocument}
      />
    </SafeAreaView>
  );
}

function DocumentsHeader({
  onAdd,
}: {
  onAdd: () => void;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerSpacer} />

      <Text style={styles.headerTitle}>
        Documents
      </Text>

      <Pressable
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel="Ajouter un document"
        style={({ pressed }) => [
          styles.headerAddButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <Ionicons name="add" size={23} color={COLORS.text} />
      </Pressable>
    </View>
  );
}

function StatisticsSection({
  total,
  waiting,
  valid,
}: {
  total: number;
  waiting: number;
  valid: number;
}) {
  return (
    <View style={styles.statisticsContainer}>
      <StatisticCard
        icon="documents-outline"
        value={total}
        label="Total"
      />

      <StatisticCard
        icon="time-outline"
        value={waiting}
        label="En attente"
      />

      <StatisticCard
        icon="checkmark-circle-outline"
        value={valid}
        label="Validés"
      />
    </View>
  );
}

function StatisticCard({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
}) {
  return (
    <View style={styles.statisticCard}>
      <View style={styles.statisticIcon}>
        <Ionicons name={icon} size={17} color={COLORS.blue} />
      </View>

      <Text style={styles.statisticValue}>
        {value}
      </Text>

      <Text style={styles.statisticLabel}>
        {label}
      </Text>
    </View>
  );
}

function FilterSection({
  selectedFilter,
  onChange,
}: {
  selectedFilter: DocumentFilter;
  onChange: (filter: DocumentFilter) => void;
}) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterEyebrow}>
        FILTRER
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {DOCUMENT_FILTERS.map((filter) => {
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
              <Text
                style={[
                  styles.filterButtonText,
                  selected && styles.filterButtonTextSelected,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function SectionHeader({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionEyebrow}>
          MES DOCUMENTS
        </Text>

        <Text style={styles.sectionTitle}>
          {title}
        </Text>
      </View>

      <View style={styles.countPill}>
        <Text style={styles.countText}>
          {count}
        </Text>
      </View>
    </View>
  );
}

function DocumentCard({
  document,
}: {
  document: DocumentDTO;
}) {
  const status = getDocumentStatus(document);
  const presentation = getDocumentPresentation(document.type);

  const handleOpen = async () => {
    if (!document.urlFichier) {
      Alert.alert(
        "Document indisponible",
        "Aucun fichier n'est associé à ce document."
      );
      return;
    }

    try {
      await Linking.openURL(document.urlFichier);
    } catch (openError) {
      console.error("Erreur ouverture document :", openError);

      Alert.alert(
        "Ouverture impossible",
        "Impossible d'ouvrir ce document."
      );
    }
  };

  return (
    <Pressable
      onPress={handleOpen}
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir ${document.titre || "le document"}`}
      style={({ pressed }) => [
        styles.documentCard,
        {
          backgroundColor: presentation.cardColor,
          borderColor: presentation.borderColor,
        },
        pressed && styles.buttonPressed,
      ]}
    >
      <View
        style={[
          styles.documentIcon,
          {
            backgroundColor: presentation.iconBackground,
          },
        ]}
      >
        <Ionicons
          name={presentation.icon}
          size={23}
          color={presentation.iconColor}
        />
      </View>

      <View style={styles.documentContent}>
        <View style={styles.documentTopRow}>
          <View style={styles.documentTitleBlock}>
            <Text style={styles.documentTitle} numberOfLines={2}>
              {document.titre || "Document"}
            </Text>

            <Text style={styles.documentType}>
              {document.type || "Document"}
            </Text>
          </View>

          <StatusBadge status={status} />
        </View>

        <View style={styles.documentMetadata}>
          <MetadataItem
            icon="cloud-upload-outline"
            label="Ajouté"
            value={formatDate(document.dateUpload)}
          />

          <MetadataItem
            icon="calendar-outline"
            label="Expiration"
            value={
              document.dateExpiration
                ? formatDate(document.dateExpiration)
                : "Aucune"
            }
          />

          {document.activiteTitre ? (
            <MetadataItem
              icon="fitness-outline"
              label="Activité"
              value={document.activiteTitre}
            />
          ) : null}
        </View>

        <View style={styles.documentFooter}>
          <Text style={styles.openDocumentText}>
            Ouvrir le document
          </Text>

          <Ionicons
            name="open-outline"
            size={16}
            color={COLORS.textSecondary}
          />
        </View>
      </View>
    </Pressable>
  );
}

function StatusBadge({
  status,
}: {
  status: StatusInfo;
}) {
  return (
    <View
      style={[
        styles.statusBadge,
        getStatusBadgeStyle(status.variant),
      ]}
    >
      <Ionicons
        name={status.icon}
        size={12}
        color={getStatusColor(status.variant)}
      />

      <Text
        style={[
          styles.statusBadgeText,
          { color: getStatusColor(status.variant) },
        ]}
      >
        {status.label}
      </Text>
    </View>
  );
}

function MetadataItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metadataItem}>
      <View style={styles.metadataIcon}>
        <Ionicons
          name={icon}
          size={15}
          color={COLORS.textSecondary}
        />
      </View>

      <View style={styles.metadataText}>
        <Text style={styles.metadataLabel}>
          {label}
        </Text>

        <Text style={styles.metadataValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function ErrorBox({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.errorBox}>
      <Ionicons
        name="alert-circle-outline"
        size={20}
        color={COLORS.red}
      />

      <Text style={styles.errorText}>
        {message}
      </Text>

      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [
          styles.retryButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <Ionicons name="refresh" size={17} color={COLORS.text} />
      </Pressable>
    </View>
  );
}

function EmptyDocuments({
  hasError,
  selectedFilter,
  onAdd,
}: {
  hasError: boolean;
  selectedFilter: DocumentFilter;
  onAdd: () => void;
}) {
  const title = hasError
    ? "Chargement impossible"
    : selectedFilter === "TOUS"
      ? "Aucun document"
      : "Aucun résultat";

  const description = hasError
    ? "Actualisez la page ou réessayez dans quelques instants."
    : selectedFilter === "TOUS"
      ? "Ajoutez votre premier justificatif pour le retrouver ici."
      : "Aucun document ne correspond au filtre sélectionné.";

  return (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[
          "rgba(96,165,250,0.18)",
          "rgba(96,165,250,0.05)",
        ]}
        style={styles.emptyIconContainer}
      >
        <Ionicons
          name={hasError ? "cloud-offline-outline" : "documents-outline"}
          size={34}
          color={COLORS.blue}
        />
      </LinearGradient>

      <Text style={styles.emptyTitle}>
        {title}
      </Text>

      <Text style={styles.emptyDescription}>
        {description}
      </Text>

      {!hasError && selectedFilter === "TOUS" ? (
        <Pressable
          onPress={onAdd}
          style={({ pressed }) => [
            styles.emptyAction,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="add" size={17} color={COLORS.text} />

          <Text style={styles.emptyActionText}>
            Ajouter un document
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function UploadDocumentModal({
  visible,
  selectedFile,
  titre,
  typeDocument,
  dateExpiration,
  uploading,
  onClose,
  onPickDocument,
  onChangeTitre,
  onChangeType,
  onChangeDateExpiration,
  onSubmit,
}: {
  visible: boolean;
  selectedFile: SelectedDocument | null;
  titre: string;
  typeDocument: string;
  dateExpiration: string;
  uploading: boolean;
  onClose: () => void;
  onPickDocument: () => void;
  onChangeTitre: (value: string) => void;
  onChangeType: (value: string) => void;
  onChangeDateExpiration: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
        />

        <View style={styles.uploadModal}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalEyebrow}>
                MES DOCUMENTS
              </Text>

              <Text style={styles.modalTitle}>
                Ajouter un document
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              disabled={uploading}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={21} color={COLORS.text} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.inputLabel}>
              FICHIER
            </Text>

            <Pressable
              onPress={onPickDocument}
              disabled={uploading}
              style={({ pressed }) => [
                styles.filePicker,
                selectedFile && styles.filePickerSelected,
                pressed && !uploading && styles.buttonPressed,
              ]}
            >
              <View style={styles.filePickerIcon}>
                <Ionicons
                  name={
                    selectedFile
                      ? "document-attach-outline"
                      : "cloud-upload-outline"
                  }
                  size={24}
                  color={COLORS.blue}
                />
              </View>

              <View style={styles.filePickerContent}>
                <Text style={styles.filePickerTitle} numberOfLines={1}>
                  {selectedFile
                    ? selectedFile.name
                    : "Sélectionner un fichier"}
                </Text>

                <Text style={styles.filePickerText}>
                  {selectedFile
                    ? formatFileSize(selectedFile.size)
                    : "PDF, DOC, DOCX, JPG ou PNG • 10 Mo max"}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.textMuted}
              />
            </Pressable>

            <Text style={styles.inputLabel}>
              TITRE
            </Text>

            <TextInput
              value={titre}
              onChangeText={onChangeTitre}
              editable={!uploading}
              placeholder="Ex. Certificat médical 2026"
              placeholderTextColor="#666666"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>
              TYPE DE DOCUMENT
            </Text>

            <View style={styles.typeSelector}>
              {DOCUMENT_TYPES.map((type) => {
                const selected = typeDocument === type;

                return (
                  <Pressable
                    key={type}
                    onPress={() => onChangeType(type)}
                    disabled={uploading}
                    style={({ pressed }) => [
                      styles.typeButton,
                      selected && styles.typeButtonSelected,
                      pressed && !uploading && styles.buttonPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        selected && styles.typeButtonTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>
              DATE D’EXPIRATION
              <Text style={styles.optionalLabel}>
                {" "}
                (optionnelle)
              </Text>
            </Text>

            <TextInput
              value={dateExpiration}
              onChangeText={onChangeDateExpiration}
              editable={!uploading}
              placeholder="AAAA-MM-JJ"
              placeholderTextColor="#666666"
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
              style={styles.input}
            />

            <View style={styles.validationInfo}>
              <Ionicons
                name="shield-checkmark-outline"
                size={19}
                color={COLORS.amber}
              />

              <Text style={styles.validationInfoText}>
                Après l’envoi, le document restera en attente jusqu’à sa validation par l’administration.
              </Text>
            </View>

            <Pressable
              onPress={onSubmit}
              disabled={uploading}
              style={({ pressed }) => [
                styles.submitButton,
                uploading && styles.submitButtonDisabled,
                pressed && !uploading && styles.buttonPressed,
              ]}
            >
              {uploading ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.text}
                />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={19}
                    color={COLORS.text}
                  />

                  <Text style={styles.submitButtonText}>
                    Envoyer le document
                  </Text>
                </>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function DocumentsLoading({
  isFocused,
}: {
  isFocused: boolean;
}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {isFocused ? <StatusBar style="light" animated /> : null}

      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[COLORS.blue, "#1D4F7A"]}
          style={styles.loadingLogo}
        >
          <Ionicons
            name="documents-outline"
            size={28}
            color={COLORS.text}
          />
        </LinearGradient>

        <ActivityIndicator size="small" color={COLORS.text} />

        <Text style={styles.loadingText}>
          Chargement de vos documents…
        </Text>
      </View>
    </SafeAreaView>
  );
}

function parseDateValue(value?: string | null): number {
  if (!value) return 0;

  const parsed = new Date(`${value}T12:00:00`).getTime();

  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDate(value?: string | null): string {
  if (!value) return "Non renseigné";

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function isDocumentExpired(document: DocumentDTO): boolean {
  if (!document.dateExpiration) {
    return false;
  }

  const expiration = parseDateValue(document.dateExpiration);

  if (!expiration) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return expiration < today.getTime();
}

function getDocumentStatus(document: DocumentDTO): StatusInfo {
  if (isDocumentExpired(document)) {
    return {
      label: "Expiré",
      variant: "danger",
      icon: "alert-circle-outline",
    };
  }

  if (document.estValide === true) {
    return {
      label: "Validé",
      variant: "success",
      icon: "checkmark-circle-outline",
    };
  }

  return {
    label: "En attente",
    variant: "waiting",
    icon: "time-outline",
  };
}

function getStatusColor(variant: DocumentStatusVariant): string {
  if (variant === "success") return COLORS.green;
  if (variant === "danger") return COLORS.danger;
  if (variant === "waiting") return COLORS.amber;

  return COLORS.textSecondary;
}

function getStatusBadgeStyle(variant: DocumentStatusVariant) {
  if (variant === "success") return styles.statusBadgeSuccess;
  if (variant === "danger") return styles.statusBadgeDanger;
  if (variant === "waiting") return styles.statusBadgeWaiting;

  return styles.statusBadgeNeutral;
}

function getDocumentPresentation(type?: string | null) {
  const normalized = String(type || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("certificat")) {
    return {
      icon: "medical-outline" as const,
      iconColor: "#60A5FA",
      iconBackground: "rgba(96,165,250,0.13)",
      cardColor: "#172733",
      borderColor: "rgba(96,165,250,0.16)",
    };
  }

  if (normalized.includes("licence")) {
    return {
      icon: "ribbon-outline" as const,
      iconColor: "#A78BFA",
      iconBackground: "rgba(167,139,250,0.13)",
      cardColor: "#211D2D",
      borderColor: "rgba(167,139,250,0.16)",
    };
  }

  if (
    normalized.includes("passeport") ||
    normalized.includes("identite")
  ) {
    return {
      icon: "id-card-outline" as const,
      iconColor: "#34D399",
      iconBackground: "rgba(52,211,153,0.12)",
      cardColor: "#172821",
      borderColor: "rgba(52,211,153,0.15)",
    };
  }

  if (normalized.includes("autorisation")) {
    return {
      icon: "shield-checkmark-outline" as const,
      iconColor: "#FBBF24",
      iconBackground: "rgba(251,191,36,0.12)",
      cardColor: "#2A2417",
      borderColor: "rgba(251,191,36,0.14)",
    };
  }

  if (normalized.includes("diplome")) {
    return {
      icon: "school-outline" as const,
      iconColor: "#FB7185",
      iconBackground: "rgba(251,113,133,0.12)",
      cardColor: "#2C1C22",
      borderColor: "rgba(251,113,133,0.15)",
    };
  }

  return {
    icon: "document-text-outline" as const,
    iconColor: COLORS.textSecondary,
    iconBackground: "rgba(255,255,255,0.06)",
    cardColor: COLORS.card,
    borderColor: COLORS.border,
  };
}

function isValidDateInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T12:00:00`);

  return !Number.isNaN(date.getTime());
}

function guessMimeType(fileName?: string): string {
  const value = String(fileName || "").toLowerCase();

  if (value.endsWith(".pdf")) return "application/pdf";
  if (value.endsWith(".doc")) return "application/msword";
  if (value.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (value.endsWith(".png")) return "image/png";
  if (value.endsWith(".jpg") || value.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  return "application/octet-stream";
}

function removeFileExtension(fileName?: string): string {
  return String(fileName || "")
    .replace(/\.[^/.]+$/, "")
    .trim();
}

function formatFileSize(size?: number): string {
  if (!size || size <= 0) {
    return "Fichier sélectionné";
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} Ko`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  listContent: {
    paddingTop: 14,
    paddingHorizontal: 16,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  header: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 17,
    letterSpacing: -0.25,
    fontFamily: "Inter_700Bold",
  },

  headerSpacer: {
    width: 46,
    height: 46,
  },

  headerAddButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.burgundy,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
  },

  introSection: {
    marginTop: 2,
    marginBottom: 18,
    paddingHorizontal: 2,
  },

  introEyebrow: {
    color: COLORS.blue,
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

  statisticsContainer: {
    flexDirection: "row",
    gap: 8,
  },

  statisticCard: {
    flex: 1,
    minHeight: 108,
    padding: 13,
    backgroundColor: COLORS.blueCard,
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.13)",
    borderRadius: 20,
  },

  statisticIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(96,165,250,0.11)",
    borderRadius: 11,
  },

  statisticValue: {
    marginTop: 12,
    color: COLORS.text,
    fontSize: 23,
    fontFamily: "Inter_700Bold",
  },

  statisticLabel: {
    marginTop: 3,
    color: "#9FB2C2",
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
  },

  filterSection: {
    marginTop: 24,
  },

  filterEyebrow: {
    marginBottom: 11,
    color: COLORS.textMuted,
    fontSize: 10,
    letterSpacing: 1.4,
    fontFamily: "Inter_700Bold",
  },

  filters: {
    gap: 8,
    paddingRight: 18,
  },

  filterButton: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 14,
  },

  filterButtonSelected: {
    backgroundColor: COLORS.burgundy,
    borderColor: COLORS.burgundy,
  },

  filterButtonText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },

  filterButtonTextSelected: {
    color: COLORS.text,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 27,
    marginBottom: 14,
  },

  sectionEyebrow: {
    color: COLORS.textMuted,
    fontSize: 10,
    letterSpacing: 1.4,
    fontFamily: "Inter_700Bold",
  },

  sectionTitle: {
    marginTop: 5,
    color: COLORS.text,
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },

  countPill: {
    minWidth: 35,
    minHeight: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 18,
  },

  countText: {
    color: COLORS.text,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },

  documentCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    padding: 15,
    borderWidth: 1,
    borderRadius: 22,
  },

  documentIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },

  documentContent: {
    flex: 1,
    marginLeft: 13,
  },

  documentTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  documentTitleBlock: {
    flex: 1,
    paddingRight: 8,
  },

  documentTitle: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter_700Bold",
  },

  documentType: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },

  documentMetadata: {
    marginTop: 15,
    gap: 9,
  },

  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  metadataIcon: {
    width: 31,
    height: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
  },

  metadataText: {
    flex: 1,
    marginLeft: 9,
  },

  metadataLabel: {
    color: COLORS.textMuted,
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.55,
    fontFamily: "Inter_700Bold",
  },

  metadataValue: {
    marginTop: 2,
    color: COLORS.text,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },

  documentFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },

  openDocumentText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },

  statusBadge: {
    minHeight: 29,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    borderWidth: 1,
    borderRadius: 999,
  },

  statusBadgeWaiting: {
    backgroundColor: "rgba(251,191,36,0.09)",
    borderColor: "rgba(251,191,36,0.20)",
  },

  statusBadgeSuccess: {
    backgroundColor: "rgba(52,211,153,0.09)",
    borderColor: "rgba(52,211,153,0.20)",
  },

  statusBadgeDanger: {
    backgroundColor: "rgba(248,113,113,0.09)",
    borderColor: "rgba(248,113,113,0.20)",
  },

  statusBadgeNeutral: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.08)",
  },

  statusBadgeText: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.35,
    fontFamily: "Inter_700Bold",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    padding: 13,
    backgroundColor: "#281719",
    borderWidth: 1,
    borderColor: "rgba(229,9,20,0.22)",
    borderRadius: 17,
  },

  errorText: {
    flex: 1,
    marginHorizontal: 10,
    color: "#F5A0A5",
    fontSize: 11,
    lineHeight: 16,
    fontFamily: "Inter_400Regular",
  },

  retryButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.red,
    borderRadius: 11,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    paddingHorizontal: 30,
  },

  emptyIconContainer: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  },

  emptyTitle: {
    marginTop: 17,
    color: COLORS.text,
    fontSize: 17,
    textAlign: "center",
    fontFamily: "Inter_700Bold",
  },

  emptyDescription: {
    maxWidth: 290,
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },

  emptyAction: {
    minHeight: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 18,
    paddingHorizontal: 15,
    backgroundColor: COLORS.burgundy,
    borderRadius: 14,
  },

  emptyActionText: {
    color: COLORS.text,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.74)",
  },

  uploadModal: {
    width: "100%",
    maxHeight: "92%",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
    backgroundColor: COLORS.backgroundElevated,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  modalHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    marginBottom: 15,
    backgroundColor: "#555555",
    borderRadius: 999,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  modalEyebrow: {
    color: COLORS.blue,
    fontSize: 9,
    letterSpacing: 1.4,
    fontFamily: "Inter_700Bold",
  },

  modalTitle: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 24,
    letterSpacing: -0.5,
    fontFamily: "Inter_700Bold",
  },

  modalCloseButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cardSoft,
    borderRadius: 15,
  },

  inputLabel: {
    marginTop: 16,
    marginBottom: 8,
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 1.15,
    fontFamily: "Inter_700Bold",
  },

  optionalLabel: {
    color: "#666666",
    textTransform: "none",
    letterSpacing: 0,
    fontFamily: "Inter_400Regular",
  },

  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    color: COLORS.text,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },

  filePicker: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
  },

  filePickerSelected: {
    backgroundColor: COLORS.blueCard,
    borderColor: "rgba(96,165,250,0.25)",
  },

  filePickerIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(96,165,250,0.11)",
    borderRadius: 15,
  },

  filePickerContent: {
    flex: 1,
    marginHorizontal: 12,
  },

  filePickerTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },

  filePickerText: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 9,
    fontFamily: "Inter_400Regular",
  },

  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  typeButton: {
    minHeight: 39,
    justifyContent: "center",
    paddingHorizontal: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
  },

  typeButtonSelected: {
    backgroundColor: COLORS.blueCard,
    borderColor: "rgba(96,165,250,0.30)",
  },

  typeButtonText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },

  typeButtonTextSelected: {
    color: COLORS.blue,
  },

  validationInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginTop: 20,
    padding: 12,
    backgroundColor: "rgba(251,191,36,0.06)",
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.13)",
    borderRadius: 15,
  },

  validationInfoText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 16,
    fontFamily: "Inter_400Regular",
  },

  submitButton: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 20,
    marginBottom: 8,
    backgroundColor: COLORS.burgundy,
    borderRadius: 17,
  },

  submitButtonDisabled: {
    opacity: 0.55,
  },

  submitButtonText: {
    color: COLORS.text,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },

  loadingLogo: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },

  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },

  buttonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
});