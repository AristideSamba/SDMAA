// src/screens/DocumentsScreen.tsx

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

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import Reanimated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import api from "../services/api";

type DocumentsTab =
  | "PERSONNELS"
  | "CLUB";

type DocumentFilter =
  | "TOUS"
  | "EN_ATTENTE"
  | "VALIDES"
  | "EXPIRES";

type StatusVariant =
  | "waiting"
  | "success"
  | "danger"
  | "neutral";

interface DocumentDTO {
  id: number;
  titre?: string | null;
  type?: string | null;
  urlFichier?: string | null;
  dateUpload?: string | null;
  dateExpiration?: string | null;
  estValide?: boolean | null;
  categorieDocument?: string | null;

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
  variant: StatusVariant;
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

const FILTERS: Array<{
  id: DocumentFilter;
  label: string;
}> = [
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
] as const;

type DocumentType =
  (typeof DOCUMENT_TYPES)[number];

const DEFAULT_DOCUMENT_TYPE:
  DocumentType =
  "Certificat médical";

export default function DocumentsScreen() {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const [selectedTab, setSelectedTab] =
    useState<DocumentsTab>("PERSONNELS");

  const [selectedFilter, setSelectedFilter] =
    useState<DocumentFilter>("TOUS");

  const [myDocuments, setMyDocuments] =
    useState<DocumentDTO[]>([]);

  const [clubDocuments, setClubDocuments] =
    useState<DocumentDTO[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [uploadModalVisible, setUploadModalVisible] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState<SelectedDocument | null>(null);

  const [titre, setTitre] =
    useState("");

  const [typeDocument, setTypeDocument] =
    useState<DocumentType>(
      DEFAULT_DOCUMENT_TYPE
    );

  const [dateExpiration, setDateExpiration] =
    useState("");

  const fetchDocuments =
    useCallback(async () => {
      try {
        setError("");

        const [
          myDocumentsResponse,
          clubDocumentsResponse,
        ] = await Promise.all([
          api.get<DocumentDTO[]>(
            "/documents/me"
          ),
          api.get<DocumentDTO[]>(
            "/documents/club"
          ),
        ]);

        setMyDocuments(
          Array.isArray(
            myDocumentsResponse.data
          )
            ? myDocumentsResponse.data
            : []
        );

        setClubDocuments(
          Array.isArray(
            clubDocumentsResponse.data
          )
            ? clubDocumentsResponse.data
            : []
        );
      } catch (requestError: any) {
        console.error(
          "Erreur chargement documents :",
          requestError
        );

        setError(
          requestError?.response?.data?.message ||
            requestError?.response?.data?.error ||
            "Impossible de charger les documents pour le moment."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);

  useEffect(() => {
    if (isFocused) {
      fetchDocuments();
    }
  }, [
    fetchDocuments,
    isFocused,
  ]);

  const handleRefresh =
    useCallback(() => {
      setRefreshing(true);
      fetchDocuments();
    }, [fetchDocuments]);

  const sourceDocuments =
    selectedTab === "PERSONNELS"
      ? myDocuments
      : clubDocuments;

  const filteredDocuments =
    useMemo(() => {
      return [...sourceDocuments]
        .filter((document) => {
          if (
            selectedTab === "CLUB"
          ) {
            return selectedFilter ===
              "EXPIRES"
              ? isDocumentExpired(
                  document
                )
              : true;
          }

          const status =
            getDocumentStatus(
              document,
              selectedTab
            );

          if (
            selectedFilter ===
            "EN_ATTENTE"
          ) {
            return (
              status.variant ===
              "waiting"
            );
          }

          if (
            selectedFilter ===
            "VALIDES"
          ) {
            return (
              status.variant ===
              "success"
            );
          }

          if (
            selectedFilter ===
            "EXPIRES"
          ) {
            return (
              status.label ===
              "Expiré"
            );
          }

          return true;
        })
        .sort(
          (first, second) =>
            parseDateValue(
              second.dateUpload
            ) -
            parseDateValue(
              first.dateUpload
            )
        );
    }, [
      selectedFilter,
      selectedTab,
      sourceDocuments,
    ]);

  const visibleFilters =
    useMemo(() => {
      if (
        selectedTab === "CLUB"
      ) {
        return FILTERS.filter(
          (filter) =>
            filter.id === "TOUS" ||
            filter.id === "EXPIRES"
        );
      }

      return FILTERS;
    }, [selectedTab]);

  const resetUploadForm =
    useCallback(() => {
      setSelectedFile(null);
      setTitre("");
      setTypeDocument(
        DEFAULT_DOCUMENT_TYPE
      );
      setDateExpiration("");
    }, []);

  const closeUploadModal =
    useCallback(() => {
      if (uploading) return;

      setUploadModalVisible(false);
      resetUploadForm();
    }, [
      resetUploadForm,
      uploading,
    ]);

  const pickDocument =
    useCallback(async () => {
      try {
        const result =
          await DocumentPicker.getDocumentAsync(
            {
              type: [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "image/jpeg",
                "image/png",
              ],
              copyToCacheDirectory:
                true,
              multiple: false,
            }
          );

        if (result.canceled) {
          return;
        }

        const asset =
          result.assets?.[0];

        if (!asset) {
          return;
        }

        setSelectedFile({
          uri: asset.uri,
          name:
            asset.name ||
            `document-${Date.now()}`,
          mimeType:
            asset.mimeType ||
            guessMimeType(
              asset.name
            ),
          size:
            asset.size ??
            undefined,
        });

        if (!titre.trim()) {
          setTitre(
            removeFileExtension(
              asset.name
            )
          );
        }
      } catch (pickError) {
        console.error(
          "Erreur sélection document :",
          pickError
        );

        Alert.alert(
          "Sélection impossible",
          "Impossible de sélectionner ce document."
        );
      }
    }, [titre]);

  const uploadDocument =
    useCallback(async () => {
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

      const expiration =
        dateExpiration.trim();

      if (
        expiration &&
        !isValidDateInput(
          expiration
        )
      ) {
        Alert.alert(
          "Date invalide",
          "Utilisez le format AAAA-MM-JJ."
        );
        return;
      }

      try {
        setUploading(true);

        const formData =
          new FormData();

        formData.append(
          "file",
          {
            uri: selectedFile.uri,
            name: selectedFile.name,
            type:
              selectedFile.mimeType,
          } as any
        );

        formData.append(
          "titre",
          titre.trim()
        );

        formData.append(
          "typeDocument",
          typeDocument
        );

        if (expiration) {
          formData.append(
            "dateExpiration",
            expiration
          );
        }

        await api.post(
          "/documents/me",
          formData
        );

        setUploadModalVisible(false);
        resetUploadForm();

        await fetchDocuments();

        Alert.alert(
          "Document envoyé",
          "Votre document a bien été transmis et reste en attente de validation."
        );
      } catch (
        requestError: any
      ) {
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
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={["top"]}
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={COLORS.blue}
          />

          <Text
            style={styles.loadingText}
          >
            Chargement des documents…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      {isFocused ? (
        <StatusBar
          style="light"
          animated
        />
      ) : null}

      <FlatList
        data={filteredDocuments}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={({
          item,
          index,
        }) => (
          <Reanimated.View
            entering={FadeInDown
              .duration(360)
              .delay(index * 40)}
          >
            <DocumentCard
              document={item}
              tab={selectedTab}
            />
          </Reanimated.View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={
              handleRefresh
            }
            tintColor={COLORS.red}
            colors={[COLORS.red]}
            progressBackgroundColor={
              COLORS.card
            }
          />
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom:
              insets.bottom + 120,
          },
          filteredDocuments.length ===
            0 &&
            styles.emptyListContent,
        ]}
        ListHeaderComponent={
          <View>
            <Reanimated.View
              entering={
                FadeInUp.duration(
                  320
                )
              }
            >
              <View
                style={styles.header}
              >
                <View
                  style={
                    styles.headerSpacer
                  }
                />

                <Text
                  style={
                    styles.headerTitle
                  }
                >
                  Documents
                </Text>

                {selectedTab ===
                "PERSONNELS" ? (
                  <Pressable
                    onPress={() =>
                      setUploadModalVisible(
                        true
                      )
                    }
                    style={
                      styles.headerAddButton
                    }
                  >
                    <Ionicons
                      name="add"
                      size={23}
                      color={
                        COLORS.text
                      }
                    />
                  </Pressable>
                ) : (
                  <View
                    style={
                      styles.headerSpacer
                    }
                  />
                )}
              </View>
            </Reanimated.View>

            <View
              style={
                styles.introSection
              }
            >
              <Text
                style={
                  styles.introEyebrow
                }
              >
                ESPACE DOCUMENTS
              </Text>

              <Text
                style={
                  styles.introTitle
                }
              >
                {selectedTab ===
                "PERSONNELS"
                  ? "Mes documents"
                  : "Documents du club"}
              </Text>

              <Text
                style={
                  styles.introText
                }
              >
                {selectedTab ===
                "PERSONNELS"
                  ? "Centralisez vos justificatifs et suivez leur validation par le club."
                  : "Retrouvez les règlements, formulaires et ressources publiés par le club."}
              </Text>
            </View>

            <DocumentsTabs
              selectedTab={
                selectedTab
              }
              onChange={(tab) => {
                setSelectedTab(tab);
                setSelectedFilter(
                  "TOUS"
                );
              }}
            />

            <FilterSection
              filters={
                visibleFilters
              }
              selectedFilter={
                selectedFilter
              }
              onChange={
                setSelectedFilter
              }
            />

            {error ? (
              <ErrorBox
                message={error}
                onRetry={
                  fetchDocuments
                }
              />
            ) : null}

            <View
              style={
                styles.sectionHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.sectionEyebrow
                  }
                >
                  {selectedTab ===
                  "PERSONNELS"
                    ? "MES DOCUMENTS"
                    : "RESSOURCES DU CLUB"}
                </Text>

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  {selectedTab ===
                  "PERSONNELS"
                    ? "Documents disponibles"
                    : "À consulter"}
                </Text>
              </View>

              <View
                style={
                  styles.countPill
                }
              >
                <Text
                  style={
                    styles.countText
                  }
                >
                  {
                    filteredDocuments.length
                  }
                </Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            tab={selectedTab}
            hasError={
              Boolean(error)
            }
            onAdd={() =>
              setUploadModalVisible(
                true
              )
            }
          />
        }
      />

      <UploadDocumentModal
        visible={
          uploadModalVisible
        }
        selectedFile={
          selectedFile
        }
        titre={titre}
        typeDocument={
          typeDocument
        }
        dateExpiration={
          dateExpiration
        }
        uploading={uploading}
        onClose={
          closeUploadModal
        }
        onPickDocument={
          pickDocument
        }
        onChangeTitre={
          setTitre
        }
        onChangeType={
          setTypeDocument
        }
        onChangeDateExpiration={
          setDateExpiration
        }
        onSubmit={
          uploadDocument
        }
      />
    </SafeAreaView>
  );
}

function DocumentsTabs({
  selectedTab,
  onChange,
}: {
  selectedTab: DocumentsTab;
  onChange: (
    tab: DocumentsTab
  ) => void;
}) {
  return (
    <View
      style={styles.tabsContainer}
    >
      <TabButton
        active={
          selectedTab ===
          "PERSONNELS"
        }
        icon="person-outline"
        label="Mes documents"
        onPress={() =>
          onChange("PERSONNELS")
        }
      />

      <TabButton
        active={
          selectedTab ===
          "CLUB"
        }
        icon="people-outline"
        label="Documents du club"
        onPress={() =>
          onChange("CLUB")
        }
      />
    </View>
  );
}

function TabButton({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon:
    keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tabButton,
        active &&
          styles.tabButtonActive,
      ]}
    >
      <Ionicons
        name={icon}
        size={17}
        color={
          active
            ? COLORS.text
            : COLORS.textSecondary
        }
      />

      <Text
        style={[
          styles.tabButtonText,
          active &&
            styles.tabButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FilterSection({
  filters,
  selectedFilter,
  onChange,
}: {
  filters: Array<{
    id: DocumentFilter;
    label: string;
  }>;
  selectedFilter:
    DocumentFilter;
  onChange: (
    filter: DocumentFilter
  ) => void;
}) {
  return (
    <View
      style={styles.filterSection}
    >
      <Text
        style={styles.filterEyebrow}
      >
        FILTRER
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.filters
        }
      >
        {filters.map(
          (filter) => {
            const selected =
              filter.id ===
              selectedFilter;

            return (
              <Pressable
                key={filter.id}
                onPress={() =>
                  onChange(filter.id)
                }
                style={[
                  styles.filterButton,
                  selected &&
                    styles.filterButtonSelected,
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
          }
        )}
      </ScrollView>
    </View>
  );
}

function DocumentCard({
  document,
  tab,
}: {
  document: DocumentDTO;
  tab: DocumentsTab;
}) {
  const status =
    getDocumentStatus(
      document,
      tab
    );

  const presentation =
    getDocumentPresentation(
      document.type,
      tab
    );

  const openDocument =
    async () => {
      if (!document.urlFichier) {
        Alert.alert(
          "Document indisponible",
          "Aucun fichier n'est associé à ce document."
        );
        return;
      }

      try {
        await Linking.openURL(
          document.urlFichier
        );
      } catch {
        Alert.alert(
          "Ouverture impossible",
          "Impossible d'ouvrir ce document."
        );
      }
    };

  return (
    <Pressable
      onPress={openDocument}
      style={[
        styles.documentCard,
        {
          backgroundColor:
            presentation.cardColor,
          borderColor:
            presentation.borderColor,
        },
      ]}
    >
      <View
        style={[
          styles.documentIcon,
          {
            backgroundColor:
              presentation.iconBackground,
          },
        ]}
      >
        <Ionicons
          name={
            presentation.icon
          }
          size={23}
          color={
            presentation.iconColor
          }
        />
      </View>

      <View
        style={
          styles.documentContent
        }
      >
        <View
          style={
            styles.documentTopRow
          }
        >
          <View
            style={
              styles.documentTitleBlock
            }
          >
            <Text
              style={
                styles.documentTitle
              }
              numberOfLines={2}
            >
              {document.titre ||
                "Document"}
            </Text>

            <Text
              style={
                styles.documentType
              }
            >
              {document.type ||
                "Document"}
            </Text>
          </View>

          <StatusBadge
            status={status}
          />
        </View>

        <View
          style={
            styles.documentMetadata
          }
        >
          <MetadataItem
            icon="calendar-outline"
            label="Publié"
            value={formatDate(
              document.dateUpload
            )}
          />

          {document.dateExpiration ? (
            <MetadataItem
              icon="time-outline"
              label="Expiration"
              value={formatDate(
                document.dateExpiration
              )}
            />
          ) : null}

          {document.activiteTitre ? (
            <MetadataItem
              icon="fitness-outline"
              label="Activité"
              value={
                document.activiteTitre
              }
            />
          ) : null}
        </View>

        <View
          style={
            styles.documentFooter
          }
        >
          <Text
            style={
              styles.openDocumentText
            }
          >
            Ouvrir le document
          </Text>

          <Ionicons
            name="open-outline"
            size={16}
            color={
              COLORS.textSecondary
            }
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
        getStatusBadgeStyle(
          status.variant
        ),
      ]}
    >
      <Ionicons
        name={status.icon}
        size={12}
        color={getStatusColor(
          status.variant
        )}
      />

      <Text
        style={[
          styles.statusBadgeText,
          {
            color:
              getStatusColor(
                status.variant
              ),
          },
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
  icon:
    keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View
      style={styles.metadataItem}
    >
      <Ionicons
        name={icon}
        size={15}
        color={
          COLORS.textSecondary
        }
      />

      <View
        style={
          styles.metadataText
        }
      >
        <Text
          style={
            styles.metadataLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.metadataValue
          }
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function EmptyState({
  tab,
  hasError,
  onAdd,
}: {
  tab: DocumentsTab;
  hasError: boolean;
  onAdd: () => void;
}) {
  return (
    <View
      style={styles.emptyContainer}
    >
      <LinearGradient
        colors={[
          "rgba(96,165,250,0.18)",
          "rgba(96,165,250,0.05)",
        ]}
        style={
          styles.emptyIconContainer
        }
      >
        <Ionicons
          name={
            hasError
              ? "cloud-offline-outline"
              : tab ===
                  "PERSONNELS"
                ? "document-text-outline"
                : "library-outline"
          }
          size={34}
          color={COLORS.blue}
        />
      </LinearGradient>

      <Text
        style={styles.emptyTitle}
      >
        {hasError
          ? "Chargement impossible"
          : tab === "PERSONNELS"
            ? "Aucun document"
            : "Aucun document du club"}
      </Text>

      <Text
        style={
          styles.emptyDescription
        }
      >
        {hasError
          ? "Réessayez dans quelques instants."
          : tab === "PERSONNELS"
            ? "Ajoutez votre premier justificatif."
            : "Les ressources publiées par le club apparaîtront ici."}
      </Text>

      {!hasError &&
      tab === "PERSONNELS" ? (
        <Pressable
          onPress={onAdd}
          style={
            styles.emptyAction
          }
        >
          <Ionicons
            name="add"
            size={17}
            color={COLORS.text}
          />

          <Text
            style={
              styles.emptyActionText
            }
          >
            Ajouter un document
          </Text>
        </Pressable>
      ) : null}
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

      <Text
        style={styles.errorText}
      >
        {message}
      </Text>

      <Pressable
        onPress={onRetry}
        style={
          styles.retryButton
        }
      >
        <Ionicons
          name="refresh"
          size={17}
          color={COLORS.text}
        />
      </Pressable>
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
  selectedFile:
    SelectedDocument | null;
  titre: string;
  typeDocument: DocumentType;
  dateExpiration: string;
  uploading: boolean;
  onClose: () => void;
  onPickDocument: () => void;
  onChangeTitre: (
    value: string
  ) => void;
  onChangeType: (
    value: DocumentType
  ) => void;
  onChangeDateExpiration: (
    value: string
  ) => void;
  onSubmit: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={
        onClose
      }
    >
      <View
        style={
          styles.modalBackdrop
        }
      >
        <Pressable
          style={
            StyleSheet.absoluteFillObject
          }
          onPress={onClose}
        />

        <View
          style={
            styles.uploadModal
          }
        >
          <View
            style={
              styles.modalHandle
            }
          />

          <View
            style={
              styles.modalHeader
            }
          >
            <Text
              style={
                styles.modalTitle
              }
            >
              Ajouter un document
            </Text>

            <Pressable
              onPress={onClose}
              disabled={uploading}
              style={
                styles.modalCloseButton
              }
            >
              <Ionicons
                name="close"
                size={21}
                color={COLORS.text}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
          >
            <Text
              style={styles.inputLabel}
            >
              FICHIER
            </Text>

            <Pressable
              onPress={
                onPickDocument
              }
              disabled={uploading}
              style={
                styles.filePicker
              }
            >
              <Ionicons
                name="cloud-upload-outline"
                size={24}
                color={COLORS.blue}
              />

              <View
                style={
                  styles.filePickerContent
                }
              >
                <Text
                  style={
                    styles.filePickerTitle
                  }
                  numberOfLines={1}
                >
                  {selectedFile
                    ? selectedFile.name
                    : "Sélectionner un fichier"}
                </Text>

                <Text
                  style={
                    styles.filePickerText
                  }
                >
                  {selectedFile
                    ? formatFileSize(
                        selectedFile.size
                      )
                    : "PDF, DOC, DOCX, JPG ou PNG • 10 Mo max"}
                </Text>
              </View>
            </Pressable>

            <Text
              style={styles.inputLabel}
            >
              TITRE
            </Text>

            <TextInput
              value={titre}
              onChangeText={
                onChangeTitre
              }
              style={styles.input}
              placeholder="Ex. Certificat médical 2026"
              placeholderTextColor="#666666"
            />

            <Text
              style={styles.inputLabel}
            >
              TYPE
            </Text>

            <View
              style={
                styles.typeSelector
              }
            >
              {DOCUMENT_TYPES.map(
                (type) => (
                  <Pressable
                    key={type}
                    onPress={() =>
                      onChangeType(type)
                    }
                    style={[
                      styles.typeButton,
                      typeDocument ===
                        type &&
                        styles.typeButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        typeDocument ===
                          type &&
                          styles.typeButtonTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </Pressable>
                )
              )}
            </View>

            <Text
              style={styles.inputLabel}
            >
              DATE D’EXPIRATION
              <Text
                style={
                  styles.optionalLabel
                }
              >
                {" "}
                (optionnelle)
              </Text>
            </Text>

            <TextInput
              value={
                dateExpiration
              }
              onChangeText={
                onChangeDateExpiration
              }
              style={styles.input}
              placeholder="AAAA-MM-JJ"
              placeholderTextColor="#666666"
            />

            <Pressable
              onPress={onSubmit}
              disabled={uploading}
              style={[
                styles.submitButton,
                uploading &&
                  styles.submitButtonDisabled,
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

                  <Text
                    style={
                      styles.submitButtonText
                    }
                  >
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

function parseDateValue(
  value?: string | null
): number {
  if (!value) return 0;

  const parsed =
    new Date(
      `${value}T12:00:00`
    ).getTime();

  return Number.isNaN(parsed)
    ? 0
    : parsed;
}

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return "Non renseigné";
  }

  const date =
    new Date(
      `${value}T12:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function isDocumentExpired(
  document: DocumentDTO
): boolean {
  if (!document.dateExpiration) {
    return false;
  }

  const expiration =
    parseDateValue(
      document.dateExpiration
    );

  if (!expiration) {
    return false;
  }

  const today = new Date();
  today.setHours(
    0,
    0,
    0,
    0
  );

  return (
    expiration <
    today.getTime()
  );
}

function getDocumentStatus(
  document: DocumentDTO,
  tab: DocumentsTab
): StatusInfo {
  if (
    isDocumentExpired(document)
  ) {
    return {
      label: "Expiré",
      variant: "danger",
      icon: "alert-circle-outline",
    };
  }

  if (tab === "CLUB") {
    return {
      label: "Disponible",
      variant: "success",
      icon: "checkmark-circle-outline",
    };
  }

  if (
    document.estValide === true
  ) {
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

function getStatusColor(
  variant: StatusVariant
): string {
  if (variant === "success") {
    return COLORS.green;
  }

  if (variant === "danger") {
    return COLORS.danger;
  }

  if (variant === "waiting") {
    return COLORS.amber;
  }

  return COLORS.textSecondary;
}

function getStatusBadgeStyle(
  variant: StatusVariant
) {
  if (variant === "success") {
    return styles.statusBadgeSuccess;
  }

  if (variant === "danger") {
    return styles.statusBadgeDanger;
  }

  if (variant === "waiting") {
    return styles.statusBadgeWaiting;
  }

  return styles.statusBadgeNeutral;
}

function getDocumentPresentation(
  type?: string | null,
  tab?: DocumentsTab
) {
  if (tab === "CLUB") {
    return {
      icon:
        "library-outline" as const,
      iconColor: "#FBBF24",
      iconBackground:
        "rgba(251,191,36,0.12)",
      cardColor: "#29231A",
      borderColor:
        "rgba(251,191,36,0.15)",
    };
  }

  const normalized =
    String(type || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      );

  if (
    normalized.includes(
      "certificat"
    )
  ) {
    return {
      icon:
        "medkit-outline" as const,
      iconColor: COLORS.blue,
      iconBackground:
        "rgba(96,165,250,0.13)",
      cardColor: "#172733",
      borderColor:
        "rgba(96,165,250,0.16)",
    };
  }

  if (
    normalized.includes(
      "licence"
    )
  ) {
    return {
      icon:
        "ribbon-outline" as const,
      iconColor: "#A78BFA",
      iconBackground:
        "rgba(167,139,250,0.13)",
      cardColor: "#211D2D",
      borderColor:
        "rgba(167,139,250,0.16)",
    };
  }

  return {
    icon:
      "document-text-outline" as const,
    iconColor:
      COLORS.textSecondary,
    iconBackground:
      "rgba(255,255,255,0.06)",
    cardColor: COLORS.card,
    borderColor: COLORS.border,
  };
}

function isValidDateInput(
  value: string
): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return false;
  }

  const date =
    new Date(
      `${value}T12:00:00`
    );

  return !Number.isNaN(
    date.getTime()
  );
}

function guessMimeType(
  fileName?: string
): string {
  const value =
    String(fileName || "")
      .toLowerCase();

  if (
    value.endsWith(".pdf")
  ) {
    return "application/pdf";
  }

  if (
    value.endsWith(".doc")
  ) {
    return "application/msword";
  }

  if (
    value.endsWith(".docx")
  ) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  if (
    value.endsWith(".png")
  ) {
    return "image/png";
  }

  if (
    value.endsWith(".jpg") ||
    value.endsWith(".jpeg")
  ) {
    return "image/jpeg";
  }

  return "application/octet-stream";
}

function removeFileExtension(
  fileName?: string
): string {
  return String(fileName || "")
    .replace(
      /\.[^/.]+$/,
      ""
    )
    .trim();
}

function formatFileSize(
  size?: number
): string {
  if (
    !size ||
    size <= 0
  ) {
    return "Fichier sélectionné";
  }

  if (
    size < 1024 * 1024
  ) {
    return `${Math.round(
      size / 1024
    )} Ko`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} Mo`;
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        COLORS.background,
    },

    listContent: {
      paddingTop: 14,
      paddingHorizontal: 16,
    },

    emptyListContent: {
      flexGrow: 1,
    },

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    loadingText: {
      marginTop: 14,
      color:
        COLORS.textSecondary,
      fontSize: 12,
    },

    header: {
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 14,
    },

    headerSpacer: {
      width: 46,
      height: 46,
    },

    headerTitle: {
      color: COLORS.text,
      fontSize: 17,
      fontFamily:
        "Inter_700Bold",
    },

    headerAddButton: {
      width: 46,
      height: 46,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        COLORS.burgundy,
      borderRadius: 16,
    },

    introSection: {
      marginBottom: 18,
    },

    introEyebrow: {
      color: COLORS.blue,
      fontSize: 10,
      letterSpacing: 1.5,
      fontFamily:
        "Inter_700Bold",
    },

    introTitle: {
      marginTop: 6,
      color: COLORS.text,
      fontSize: 24,
      fontFamily:
        "Inter_700Bold",
    },

    introText: {
      marginTop: 7,
      color:
        COLORS.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },

    tabsContainer: {
      flexDirection: "row",
      padding: 5,
      backgroundColor:
        COLORS.card,
      borderRadius: 18,
    },

    tabButton: {
      flex: 1,
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      borderRadius: 14,
    },

    tabButtonActive: {
      backgroundColor:
        COLORS.burgundy,
    },

    tabButtonText: {
      color:
        COLORS.textSecondary,
      fontSize: 11,
      fontFamily:
        "Inter_600SemiBold",
    },

    tabButtonTextActive: {
      color: COLORS.text,
    },

    filterSection: {
      marginTop: 22,
    },

    filterEyebrow: {
      marginBottom: 10,
      color:
        COLORS.textMuted,
      fontSize: 9,
      fontFamily:
        "Inter_700Bold",
    },

    filters: {
      gap: 8,
    },

    filterButton: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      backgroundColor:
        COLORS.card,
      borderRadius: 13,
    },

    filterButtonSelected: {
      backgroundColor:
        COLORS.blueCard,
    },

    filterButtonText: {
      color:
        COLORS.textSecondary,
      fontSize: 10,
      fontFamily:
        "Inter_600SemiBold",
    },

    filterButtonTextSelected: {
      color: COLORS.blue,
    },

    sectionHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginTop: 26,
      marginBottom: 14,
    },

    sectionEyebrow: {
      color:
        COLORS.textMuted,
      fontSize: 9,
      letterSpacing: 1.2,
      fontFamily:
        "Inter_700Bold",
    },

    sectionTitle: {
      marginTop: 4,
      color: COLORS.text,
      fontSize: 20,
      fontFamily:
        "Inter_700Bold",
    },

    countPill: {
      minWidth: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        COLORS.card,
      borderRadius: 17,
    },

    countText: {
      color: COLORS.text,
      fontSize: 11,
      fontFamily:
        "Inter_700Bold",
    },

    documentCard: {
      flexDirection: "row",
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
      alignItems:
        "flex-start",
    },

    documentTitleBlock: {
      flex: 1,
    },

    documentTitle: {
      color: COLORS.text,
      fontSize: 15,
      fontFamily:
        "Inter_700Bold",
    },

    documentType: {
      marginTop: 4,
      color:
        COLORS.textSecondary,
      fontSize: 10,
    },

    documentMetadata: {
      marginTop: 14,
      gap: 8,
    },

    metadataItem: {
      flexDirection: "row",
      alignItems: "center",
    },

    metadataText: {
      marginLeft: 8,
      flex: 1,
    },

    metadataLabel: {
      color:
        COLORS.textMuted,
      fontSize: 8,
      fontFamily:
        "Inter_700Bold",
    },

    metadataValue: {
      marginTop: 2,
      color: COLORS.text,
      fontSize: 10,
    },

    documentFooter: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginTop: 13,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor:
        "rgba(255,255,255,0.06)",
    },

    openDocumentText: {
      color:
        COLORS.textSecondary,
      fontSize: 10,
    },

    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 5,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderRadius: 999,
    },

    statusBadgeWaiting: {
      backgroundColor:
        "rgba(251,191,36,0.09)",
      borderColor:
        "rgba(251,191,36,0.20)",
    },

    statusBadgeSuccess: {
      backgroundColor:
        "rgba(52,211,153,0.09)",
      borderColor:
        "rgba(52,211,153,0.20)",
    },

    statusBadgeDanger: {
      backgroundColor:
        "rgba(248,113,113,0.09)",
      borderColor:
        "rgba(248,113,113,0.20)",
    },

    statusBadgeNeutral: {
      backgroundColor:
        "rgba(255,255,255,0.05)",
      borderColor:
        "rgba(255,255,255,0.08)",
    },

    statusBadgeText: {
      fontSize: 8,
      fontFamily:
        "Inter_700Bold",
    },

    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 14,
      padding: 12,
      backgroundColor:
        "#281719",
      borderRadius: 15,
    },

    errorText: {
      flex: 1,
      marginHorizontal: 10,
      color: "#F5A0A5",
      fontSize: 10,
    },

    retryButton: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
    },

    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 55,
    },

    emptyIconContainer: {
      width: 72,
      height: 72,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 24,
    },

    emptyTitle: {
      marginTop: 15,
      color: COLORS.text,
      fontSize: 16,
      fontFamily:
        "Inter_700Bold",
    },

    emptyDescription: {
      marginTop: 7,
      maxWidth: 280,
      color:
        COLORS.textSecondary,
      fontSize: 11,
      lineHeight: 17,
      textAlign: "center",
    },

    emptyAction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 16,
      paddingVertical: 10,
      paddingHorizontal: 13,
      backgroundColor:
        COLORS.burgundy,
      borderRadius: 13,
    },

    emptyActionText: {
      color: COLORS.text,
      fontSize: 10,
      fontFamily:
        "Inter_700Bold",
    },

    modalBackdrop: {
      flex: 1,
      justifyContent:
        "flex-end",
      backgroundColor:
        "rgba(0,0,0,0.74)",
    },

    uploadModal: {
      maxHeight: "90%",
      padding: 18,
      backgroundColor:
        COLORS.backgroundElevated,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
    },

    modalHandle: {
      alignSelf: "center",
      width: 42,
      height: 4,
      marginBottom: 16,
      backgroundColor:
        "#555555",
      borderRadius: 999,
    },

    modalHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    modalTitle: {
      color: COLORS.text,
      fontSize: 22,
      fontFamily:
        "Inter_700Bold",
    },

    modalCloseButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        COLORS.cardSoft,
      borderRadius: 14,
    },

    inputLabel: {
      marginTop: 18,
      marginBottom: 8,
      color:
        COLORS.textMuted,
      fontSize: 9,
      fontFamily:
        "Inter_700Bold",
    },

    input: {
      minHeight: 48,
      paddingHorizontal: 13,
      color: COLORS.text,
      backgroundColor:
        COLORS.card,
      borderRadius: 14,
    },

    optionalLabel: {
      color: "#666666",
    },

    filePicker: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 70,
      padding: 13,
      backgroundColor:
        COLORS.card,
      borderRadius: 16,
    },

    filePickerContent: {
      flex: 1,
      marginLeft: 12,
    },

    filePickerTitle: {
      color: COLORS.text,
      fontSize: 11,
      fontFamily:
        "Inter_700Bold",
    },

    filePickerText: {
      marginTop: 4,
      color:
        COLORS.textMuted,
      fontSize: 9,
    },

    typeSelector: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    typeButton: {
      paddingVertical: 9,
      paddingHorizontal: 11,
      backgroundColor:
        COLORS.card,
      borderRadius: 12,
    },

    typeButtonSelected: {
      backgroundColor:
        COLORS.blueCard,
    },

    typeButtonText: {
      color:
        COLORS.textSecondary,
      fontSize: 9,
    },

    typeButtonTextSelected: {
      color: COLORS.blue,
    },

    submitButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minHeight: 52,
      marginTop: 20,
      backgroundColor:
        COLORS.burgundy,
      borderRadius: 16,
    },

    submitButtonDisabled: {
      opacity: 0.55,
    },

    submitButtonText: {
      color: COLORS.text,
      fontSize: 12,
      fontFamily:
        "Inter_700Bold",
    },
  });
