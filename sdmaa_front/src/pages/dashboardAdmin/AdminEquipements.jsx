import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Edit,
  ImageIcon,
  Package,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

/**
 * URL du backend.
 *
 * En local :
 * VITE_API_URL=http://localhost:8080/api
 *
 * En ligne :
 * VITE_API_URL=https://sdmaa.onrender.com/api
 */
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080/api"
).replace(/\/$/, "");

const initialForm = {
  nom: "",
  type: "",
  taille: "",
  quantiteDisponible: "",
  prixAchat: "",
  achetable: false,
  empruntable: false,
  description: "",
  categorie: "",
};

const types = [
  "TOUS",
  "tenue",
  "protection",
  "accessoire",
  "ceinture",
  "autre",
];

function Badge({
  children,
  variant = "default",
}) {
  const styles = {
    achetable: "bg-green-50 text-green-700",
    empruntable: "bg-blue-50 text-blue-700",
    rupture: "bg-red-50 text-red-700",
    stock: "bg-gray-100 text-gray-700",
    default: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[variant] || styles.default
      }`}
    >
      {children}
    </span>
  );
}

function AdminEquipements() {
  const pageTopRef = useRef(null);

  const [equipements, setEquipements] =
    useState([]);

  const [form, setForm] =
    useState(initialForm);

  const [editForm, setEditForm] =
    useState(initialForm);

  const [editingItem, setEditingItem] =
    useState(null);

  const [imageFile, setImageFile] =
    useState(null);

  const [
    editImageFile,
    setEditImageFile,
  ] = useState(null);

  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("TOUS");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [updating, setUpdating] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [
    deletingImageId,
    setDeletingImageId,
  ] = useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /**
   * Requête générique vers l’API.
   *
   * Le Content-Type n’est pas ajouté lorsque
   * le corps est un FormData. Le navigateur
   * génère lui-même la frontière multipart.
   */
  const apiFetch = async (
    url,
    options = {}
  ) => {
    const isFormData =
      options.body instanceof FormData;

    const token =
      localStorage.getItem("token");

    return fetch(url, {
      ...options,

      headers: {
        ...(!isFormData
          ? {
              "Content-Type":
                "application/json",
            }
          : {}),

        ...(options.headers || {}),

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    });
  };

  /**
   * Récupérer tous les équipements.
   */
  const fetchEquipements = async () => {
    try {
      setError("");

      const response = await apiFetch(
        `${API_URL}/equipements`
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Impossible de charger les équipements."
        );
      }

      setEquipements(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipements();
  }, []);

  useEffect(() => {
    if (error || success) {
      pageTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [error, success]);

  const filteredEquipements =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      return equipements.filter(
        (item) => {
          const text = `
            ${item.nom || ""}
            ${item.type || ""}
            ${item.taille || ""}
            ${item.description || ""}
            ${item.categorie || ""}
          `.toLowerCase();

          const matchesSearch =
            !query ||
            text.includes(query);

          const matchesType =
            typeFilter === "TOUS" ||
            item.type === typeFilter;

          return (
            matchesSearch &&
            matchesType
          );
        }
      );
    }, [
      equipements,
      search,
      typeFilter,
    ]);

  /**
   * Modifier un formulaire.
   */
  const handleChange = (
    event,
    setter
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setter((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /**
   * Construire le JSON envoyé au backend.
   *
   * lienImage n’est plus envoyé :
   * il sera généré par Cloudinary.
   */
  const buildPayload = (source) => ({
    nom: source.nom.trim(),

    type: source.type,

    taille:
      source.taille.trim() || null,

    quantiteDisponible: Number(
      source.quantiteDisponible
    ),

    prixAchat:
      source.prixAchat !== ""
        ? Number(source.prixAchat)
        : null,

    achetable: Boolean(
      source.achetable
    ),

    empruntable: Boolean(
      source.empruntable
    ),

    description:
      source.description.trim(),

    categorie:
      source.categorie.trim(),
  });

  /**
   * Envoyer une image à Cloudinary
   * via le backend Spring Boot.
   */
  const uploadEquipementImage =
    async (
      equipementId,
      fichier
    ) => {
      const formData = new FormData();

      formData.append(
        "image",
        fichier
      );

      const response = await apiFetch(
        `${API_URL}/equipements/${equipementId}/image`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Impossible d’envoyer l’image."
        );
      }

      return data;
    };

  /**
   * Créer un équipement puis,
   * si une image est sélectionnée,
   * l’envoyer vers Cloudinary.
   */
  const createEquipement = async (
    event
  ) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch(
        `${API_URL}/equipements`,
        {
          method: "POST",

          body: JSON.stringify(
            buildPayload(form)
          ),
        }
      );

      const equipementCree =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          equipementCree?.message ||
            equipementCree?.error ||
            "Impossible de créer l’équipement."
        );
      }

      if (!equipementCree?.id) {
        throw new Error(
          "L’identifiant de l’équipement créé est absent."
        );
      }

      let equipementFinal =
        equipementCree;

      if (imageFile) {
        equipementFinal =
          await uploadEquipementImage(
            equipementCree.id,
            imageFile
          );
      }

      setEquipements(
        (previous) => [
          ...previous,
          equipementFinal,
        ]
      );

      setForm(initialForm);
      setImageFile(null);

      setSuccess(
        "Équipement créé avec succès."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue pendant la création."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Ouvrir la fenêtre de modification.
   */
  const openEdit = (item) => {
    setEditingItem(item);
    setEditImageFile(null);

    setEditForm({
      nom: item.nom || "",
      type: item.type || "",
      taille: item.taille || "",

      quantiteDisponible:
        item.quantiteDisponible ?? "",

      prixAchat:
        item.prixAchat ?? "",

      achetable: Boolean(
        item.achetable
      ),

      empruntable: Boolean(
        item.empruntable
      ),

      description:
        item.description || "",

      categorie:
        item.categorie || "",
    });
  };

  /**
   * Fermer la fenêtre de modification.
   */
  const closeEdit = () => {
    if (updating) {
      return;
    }

    setEditingItem(null);
    setEditImageFile(null);
    setEditForm(initialForm);
  };

  /**
   * Modifier les données de l’équipement,
   * puis remplacer éventuellement son image.
   */
  const updateEquipement = async (
    event
  ) => {
    event.preventDefault();

    if (
      !editingItem ||
      updating
    ) {
      return;
    }

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch(
        `${API_URL}/equipements/${editingItem.id}`,
        {
          method: "PUT",

          body: JSON.stringify(
            buildPayload(editForm)
          ),
        }
      );

      let equipementModifie =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          equipementModifie?.message ||
            equipementModifie?.error ||
            "Impossible de modifier l’équipement."
        );
      }

      if (editImageFile) {
        equipementModifie =
          await uploadEquipementImage(
            editingItem.id,
            editImageFile
          );
      }

      setEquipements(
        (previous) =>
          previous.map((item) =>
            item.id ===
            editingItem.id
              ? equipementModifie
              : item
          )
      );

      setEditingItem(null);
      setEditImageFile(null);
      setEditForm(initialForm);

      setSuccess(
        "Équipement modifié avec succès."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue pendant la modification."
      );
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Supprimer uniquement l’image.
   */
  const deleteEquipementImage =
    async (id) => {
      const confirmation =
        window.confirm(
          "Supprimer l’image de cet équipement ?"
        );

      if (!confirmation) {
        return;
      }

      setDeletingImageId(id);
      setError("");
      setSuccess("");

      try {
        const response =
          await apiFetch(
            `${API_URL}/equipements/${id}/image`,
            {
              method: "DELETE",
            }
          );

        const data = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Impossible de supprimer l’image."
          );
        }

        setEquipements(
          (previous) =>
            previous.map((item) =>
              item.id === id
                ? data
                : item
            )
        );

        setEditingItem((previous) =>
          previous?.id === id
            ? {
                ...previous,
                lienImage: null,
              }
            : previous
        );

        setSuccess(
          "Image supprimée avec succès."
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue pendant la suppression de l’image."
        );
      } finally {
        setDeletingImageId(null);
      }
    };

  /**
   * Supprimer entièrement un équipement.
   */
  const deleteEquipement = async (
    id
  ) => {
    const confirmation =
      window.confirm(
        "Supprimer définitivement cet équipement ?"
      );

    if (!confirmation) {
      return;
    }

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      const response =
        await apiFetch(
          `${API_URL}/equipements/${id}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          data?.message ||
            data?.error ||
            "Impossible de supprimer l’équipement."
        );
      }

      setEquipements(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== id
          )
      );

      setSuccess(
        "Équipement supprimé avec succès."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue pendant la suppression."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <p className="text-gray-500">
        Chargement des équipements...
      </p>
    );
  }

  return (
    <section
      ref={pageTopRef}
      className="space-y-8"
    >
      <header className="rounded-[28px] border border-black/5 bg-white px-6 py-8 shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
          Administration
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Équipements
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
          Gérez les équipements du club :
          protections, tenues, accessoires,
          ceintures, stocks, achats et
          emprunts.
        </p>
      </header>

      {error && (
        <div className="flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-3xl border border-green-100 bg-green-50 p-5 text-sm text-green-700">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0"
          />

          <p>{success}</p>
        </div>
      )}

      <form
        onSubmit={createEquipement}
        className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-950">
            <Package size={20} />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-950">
              Ajouter un équipement
            </h2>

            <p className="text-sm text-gray-500">
              Renseignez les informations et
              sélectionnez une image.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <input
            name="nom"
            value={form.nom}
            onChange={(event) =>
              handleChange(
                event,
                setForm
              )
            }
            placeholder="Nom"
            required
            className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
          />

          <select
            name="type"
            value={form.type}
            onChange={(event) =>
              handleChange(
                event,
                setForm
              )
            }
            required
            className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
          >
            <option value="">
              Type
            </option>

            <option value="tenue">
              Tenue
            </option>

            <option value="protection">
              Protection
            </option>

            <option value="accessoire">
              Accessoire
            </option>

            <option value="ceinture">
              Ceinture
            </option>

            <option value="autre">
              Autre
            </option>
          </select>

          <input
            name="categorie"
            value={form.categorie}
            onChange={(event) =>
              handleChange(
                event,
                setForm
              )
            }
            placeholder="Catégorie"
            required
            className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
          />

          <input
            name="taille"
            value={form.taille}
            onChange={(event) =>
              handleChange(
                event,
                setForm
              )
            }
            placeholder="Taille"
            className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
          />

          <input
            name="quantiteDisponible"
            type="number"
            min="0"
            value={
              form.quantiteDisponible
            }
            onChange={(event) =>
              handleChange(
                event,
                setForm
              )
            }
            placeholder="Quantité disponible"
            required
            className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
          />

          <input
            name="prixAchat"
            type="number"
            min="0"
            step="0.01"
            value={form.prixAchat}
            onChange={(event) =>
              handleChange(
                event,
                setForm
              )
            }
            placeholder="Prix d’achat"
            className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
          />

          <textarea
            name="description"
            value={form.description}
            onChange={(event) =>
              handleChange(
                event,
                setForm
              )
            }
            placeholder="Description"
            required
            rows={3}
            className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10 xl:col-span-3"
          />

          <label className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-black/15 bg-gray-50 p-5 xl:col-span-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Upload size={17} />
              Image de l’équipement
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                setImageFile(
                  event.target
                    .files?.[0] ||
                    null
                )
              }
              className="text-sm text-gray-500 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-gray-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
            />

            <span className="text-xs text-gray-400">
              Formats JPG, PNG ou WEBP —
              maximum 5 Mo.
            </span>

            {imageFile && (
              <span className="text-xs font-medium text-green-700">
                Fichier sélectionné :{" "}
                {imageFile.name}
              </span>
            )}
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              name="achetable"
              checked={form.achetable}
              onChange={(event) =>
                handleChange(
                  event,
                  setForm
                )
              }
            />

            Achetable
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              name="empruntable"
              checked={
                form.empruntable
              }
              onChange={(event) =>
                handleChange(
                  event,
                  setForm
                )
              }
            />

            Empruntable
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={16} />

            {submitting
              ? "Création..."
              : "Ajouter l’équipement"}
          </button>
        </div>
      </form>

      <div className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Rechercher un équipement..."
              className="w-full rounded-2xl border border-black/10 bg-white px-11 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setTypeFilter(type)
                }
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  typeFilter === type
                    ? "bg-gray-950 text-white"
                    : "border border-black/10 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
        {filteredEquipements.length >
        0 ? (
          <div className="grid gap-3">
            {filteredEquipements.map(
              (item) => {
                const isOutOfStock =
                  Number(
                    item.quantiteDisponible
                  ) === 0;

                return (
                  <article
                    key={item.id}
                    className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        {item.lienImage ? (
                          <img
                            src={
                              item.lienImage
                            }
                            alt={item.nom}
                            className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                            <ImageIcon
                              size={22}
                            />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-base font-semibold text-gray-950">
                              {item.nom}
                            </h2>

                            <Badge>
                              {item.type}
                            </Badge>

                            {isOutOfStock ? (
                              <Badge variant="rupture">
                                Rupture
                              </Badge>
                            ) : (
                              <Badge variant="stock">
                                {
                                  item.quantiteDisponible
                                }{" "}
                                dispo.
                              </Badge>
                            )}

                            {item.achetable && (
                              <Badge variant="achetable">
                                Achetable
                              </Badge>
                            )}

                            {item.empruntable && (
                              <Badge variant="empruntable">
                                Empruntable
                              </Badge>
                            )}
                          </div>

                          <p className="mt-1 line-clamp-1 text-sm text-gray-500">
                            {
                              item.description
                            }
                          </p>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                            <span>
                              Catégorie :{" "}
                              {
                                item.categorie
                              }
                            </span>

                            <span>
                              Taille :{" "}
                              {item.taille ||
                                "—"}
                            </span>

                            <span>
                              Prix :{" "}
                              {item.prixAchat !=
                              null
                                ? `${item.prixAchat} €`
                                : "Non renseigné"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            openEdit(item)
                          }
                          className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black"
                        >
                          <Edit size={15} />
                          Modifier
                        </button>

                        <button
                          type="button"
                          disabled={
                            deletingId ===
                            item.id
                          }
                          onClick={() =>
                            deleteEquipement(
                              item.id
                            )
                          }
                          className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2
                            size={15}
                          />

                          {deletingId ===
                          item.id
                            ? "Suppression..."
                            : "Supprimer"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 px-6 py-12 text-center text-gray-500">
            Aucun équipement trouvé.
          </div>
        )}
      </section>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={updateEquipement}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-950">
                  Modifier l’équipement
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Mettez à jour les
                  informations ou remplacez
                  l’image.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                disabled={updating}
                className="rounded-2xl p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input
                name="nom"
                value={editForm.nom}
                onChange={(event) =>
                  handleChange(
                    event,
                    setEditForm
                  )
                }
                placeholder="Nom"
                required
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
              />

              <select
                name="type"
                value={editForm.type}
                onChange={(event) =>
                  handleChange(
                    event,
                    setEditForm
                  )
                }
                required
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
              >
                <option value="">
                  Type
                </option>

                <option value="tenue">
                  Tenue
                </option>

                <option value="protection">
                  Protection
                </option>

                <option value="accessoire">
                  Accessoire
                </option>

                <option value="ceinture">
                  Ceinture
                </option>

                <option value="autre">
                  Autre
                </option>
              </select>

              <input
                name="categorie"
                value={
                  editForm.categorie
                }
                onChange={(event) =>
                  handleChange(
                    event,
                    setEditForm
                  )
                }
                placeholder="Catégorie"
                required
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
              />

              <input
                name="taille"
                value={editForm.taille}
                onChange={(event) =>
                  handleChange(
                    event,
                    setEditForm
                  )
                }
                placeholder="Taille"
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
              />

              <input
                name="quantiteDisponible"
                type="number"
                min="0"
                value={
                  editForm.quantiteDisponible
                }
                onChange={(event) =>
                  handleChange(
                    event,
                    setEditForm
                  )
                }
                placeholder="Quantité disponible"
                required
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
              />

              <input
                name="prixAchat"
                type="number"
                min="0"
                step="0.01"
                value={
                  editForm.prixAchat
                }
                onChange={(event) =>
                  handleChange(
                    event,
                    setEditForm
                  )
                }
                placeholder="Prix d’achat"
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
              />

              <textarea
                name="description"
                value={
                  editForm.description
                }
                onChange={(event) =>
                  handleChange(
                    event,
                    setEditForm
                  )
                }
                placeholder="Description"
                required
                rows={4}
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10 md:col-span-2"
              />

              <div className="rounded-2xl border border-dashed border-black/15 bg-gray-50 p-5 md:col-span-2">
                <p className="text-sm font-semibold text-gray-700">
                  Image de l’équipement
                </p>

                {editingItem.lienImage ? (
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <img
                      src={
                        editingItem.lienImage
                      }
                      alt={
                        editingItem.nom
                      }
                      className="h-24 w-24 rounded-2xl object-cover"
                    />

                    <button
                      type="button"
                      disabled={
                        deletingImageId ===
                        editingItem.id
                      }
                      onClick={() =>
                        deleteEquipementImage(
                          editingItem.id
                        )
                      }
                      className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      <Trash2 size={15} />

                      {deletingImageId ===
                      editingItem.id
                        ? "Suppression..."
                        : "Supprimer l’image"}
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                    <ImageIcon
                      size={25}
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    setEditImageFile(
                      event.target
                        .files?.[0] ||
                        null
                    )
                  }
                  className="mt-4 text-sm text-gray-500 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-gray-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Choisissez un fichier
                  uniquement pour remplacer
                  l’image actuelle.
                </p>

                {editImageFile && (
                  <p className="mt-2 text-xs font-medium text-green-700">
                    Nouvelle image :{" "}
                    {
                      editImageFile.name
                    }
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  name="achetable"
                  checked={
                    editForm.achetable
                  }
                  onChange={(event) =>
                    handleChange(
                      event,
                      setEditForm
                    )
                  }
                />

                Achetable
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  name="empruntable"
                  checked={
                    editForm.empruntable
                  }
                  onChange={(event) =>
                    handleChange(
                      event,
                      setEditForm
                    )
                  }
                />

                Empruntable
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEdit}
                disabled={updating}
                className="rounded-2xl border border-black/10 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={updating}
                className="rounded-2xl bg-gray-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updating
                  ? "Modification..."
                  : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default AdminEquipements;