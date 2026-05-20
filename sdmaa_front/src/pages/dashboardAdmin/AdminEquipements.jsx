import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Edit,
  ImageIcon,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

const initialForm = {
  nom: "",
  type: "",
  taille: "",
  quantiteDisponible: "",
  prixAchat: "",
  achetable: false,
  empruntable: false,
  lienImage: "",
  description: "",
  categorie: "",
};

const types = ["TOUS", "tenue", "protection", "accessoire", "ceinture", "autre"];

function Badge({ children, variant = "default" }) {
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

  const [equipements, setEquipements] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);
  const [editingItem, setEditingItem] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("TOUS");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiFetch = async (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  };

  const fetchEquipements = async () => {
    try {
      setError("");

      const res = await apiFetch("http://localhost:8080/api/equipements");
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Impossible de charger les équipements.");
      }

      setEquipements(data || []);
    } catch (err) {
      setError(err.message);
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

  const filteredEquipements = useMemo(() => {
    const q = search.trim().toLowerCase();

    return equipements.filter((item) => {
      const text = `
        ${item.nom || ""}
        ${item.type || ""}
        ${item.taille || ""}
        ${item.description || ""}
        ${item.categorie || ""}
      `.toLowerCase();

      return (
        (!q || text.includes(q)) &&
        (typeFilter === "TOUS" || item.type === typeFilter)
      );
    });
  }, [equipements, search, typeFilter]);

  const handleChange = (e, setter) => {
    const { name, value, type, checked } = e.target;

    setter((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const buildPayload = (source) => ({
    nom: source.nom,
    type: source.type,
    taille: source.taille || null,
    quantiteDisponible: Number(source.quantiteDisponible),
    prixAchat: source.prixAchat ? Number(source.prixAchat) : null,
    achetable: Boolean(source.achetable),
    empruntable: Boolean(source.empruntable),
    lienImage: source.lienImage,
    description: source.description,
    categorie: source.categorie,
  });

  const createEquipement = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch("http://localhost:8080/api/equipements", {
        method: "POST",
        body: JSON.stringify(buildPayload(form)),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Impossible de créer l’équipement.");
      }

      setEquipements((prev) => [...prev, data]);
      setForm(initialForm);
      setSuccess("Équipement créé avec succès.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      nom: item.nom || "",
      type: item.type || "",
      taille: item.taille || "",
      quantiteDisponible: item.quantiteDisponible ?? "",
      prixAchat: item.prixAchat ?? "",
      achetable: Boolean(item.achetable),
      empruntable: Boolean(item.empruntable),
      lienImage: item.lienImage || "",
      description: item.description || "",
      categorie: item.categorie || "",
    });
  };

  const updateEquipement = async (e) => {
    e.preventDefault();

    if (!editingItem) return;

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch(
        `http://localhost:8080/api/equipements/${editingItem.id}`,
        {
          method: "PUT",
          body: JSON.stringify(buildPayload(editForm)),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Impossible de modifier l’équipement.");
      }

      setEquipements((prev) =>
        prev.map((item) => (item.id === editingItem.id ? { ...item, ...data } : item))
      );

      setEditingItem(null);
      setSuccess("Équipement modifié avec succès.");
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const deleteEquipement = async (id) => {
    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch(`http://localhost:8080/api/equipements/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Impossible de supprimer l’équipement.");
      }

      setEquipements((prev) => prev.filter((item) => item.id !== id));
      setSuccess("Équipement supprimé avec succès.");
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Chargement des équipements...</p>;
  }

  return (
    <section ref={pageTopRef} className="space-y-8">
      <div className="rounded-[28px] border border-black/5 bg-white px-6 py-8 shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
          Administration
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Équipements
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
          Gérez les équipements du club : protections, tenues, accessoires,
          ceintures, stocks, achats et emprunts.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-3xl border border-green-100 bg-green-50 p-5 text-sm text-green-700">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
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
              Renseignez les informations de l’équipement.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <input
            name="nom"
            value={form.nom}
            onChange={(e) => handleChange(e, setForm)}
            placeholder="Nom"
            required
            className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
          />

          <select
            name="type"
            value={form.type}
            onChange={(e) => handleChange(e, setForm)}
            required
            className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
          >
            <option value="">Type</option>
            <option value="tenue">Tenue</option>
            <option value="protection">Protection</option>
            <option value="accessoire">Accessoire</option>
            <option value="ceinture">Ceinture</option>
            <option value="autre">Autre</option>
          </select>

          <input
            name="categorie"
            value={form.categorie}
            onChange={(e) => handleChange(e, setForm)}
            placeholder="Catégorie"
            required
            className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
          />

          <input
            name="taille"
            value={form.taille}
            onChange={(e) => handleChange(e, setForm)}
            placeholder="Taille"
            className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
          />

          <input
            name="quantiteDisponible"
            type="number"
            min="0"
            value={form.quantiteDisponible}
            onChange={(e) => handleChange(e, setForm)}
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
            onChange={(e) => handleChange(e, setForm)}
            placeholder="Prix d’achat"
            className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
          />

          <input
            name="lienImage"
            value={form.lienImage}
            onChange={(e) => handleChange(e, setForm)}
            placeholder="Lien image"
            required
            className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10 xl:col-span-3"
          />

          <textarea
            name="description"
            value={form.description}
            onChange={(e) => handleChange(e, setForm)}
            placeholder="Description"
            required
            rows={3}
            className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10 xl:col-span-3"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              name="achetable"
              checked={form.achetable}
              onChange={(e) => handleChange(e, setForm)}
            />
            Achetable
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              name="empruntable"
              checked={form.empruntable}
              onChange={(e) => handleChange(e, setForm)}
            />
            Empruntable
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:opacity-60"
          >
            <Plus size={16} />
            {submitting ? "Création..." : "Ajouter l’équipement"}
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un équipement..."
              className="w-full rounded-2xl border border-black/10 bg-white px-11 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
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
        {filteredEquipements.length > 0 ? (
          <div className="grid gap-3">
            {filteredEquipements.map((item) => {
              const isOutOfStock = Number(item.quantiteDisponible) === 0;

              return (
                <article
                  key={item.id}
                  className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      {item.lienImage ? (
                        <img
                          src={item.lienImage}
                          alt={item.nom}
                          className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                          <ImageIcon size={22} />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-base font-semibold text-gray-950">
                            {item.nom}
                          </h2>

                          <Badge>{item.type}</Badge>

                          {isOutOfStock ? (
                            <Badge variant="rupture">Rupture</Badge>
                          ) : (
                            <Badge variant="stock">
                              {item.quantiteDisponible} dispo.
                            </Badge>
                          )}

                          {item.achetable && <Badge variant="achetable">Achetable</Badge>}
                          {item.empruntable && (
                            <Badge variant="empruntable">Empruntable</Badge>
                          )}
                        </div>

                        <p className="mt-1 line-clamp-1 text-sm text-gray-500">
                          {item.description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                          <span>Catégorie : {item.categorie}</span>
                          <span>Taille : {item.taille || "—"}</span>
                          <span>
                            Prix :{" "}
                            {item.prixAchat ? `${item.prixAchat} €` : "Non renseigné"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black"
                      >
                        <Edit size={15} />
                        Modifier
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === item.id}
                        onClick={() => deleteEquipement(item.id)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                      >
                        <Trash2 size={15} />
                        {deletingId === item.id ? "Suppression..." : "Supprimer"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
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
                  Mettez à jour les informations de l’équipement.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="rounded-2xl p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {["nom", "type", "categorie", "taille", "quantiteDisponible", "prixAchat", "lienImage"].map(
                (field) => (
                  <input
                    key={field}
                    name={field}
                    type={
                      field === "quantiteDisponible" || field === "prixAchat"
                        ? "number"
                        : "text"
                    }
                    step={field === "prixAchat" ? "0.01" : undefined}
                    value={editForm[field]}
                    onChange={(e) => handleChange(e, setEditForm)}
                    placeholder={field}
                    className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
                  />
                )
              )}

              <textarea
                name="description"
                value={editForm.description}
                onChange={(e) => handleChange(e, setEditForm)}
                placeholder="Description"
                rows={4}
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10 md:col-span-2"
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  name="achetable"
                  checked={editForm.achetable}
                  onChange={(e) => handleChange(e, setEditForm)}
                />
                Achetable
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  name="empruntable"
                  checked={editForm.empruntable}
                  onChange={(e) => handleChange(e, setEditForm)}
                />
                Empruntable
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="rounded-2xl border border-black/10 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={updating}
                className="rounded-2xl bg-gray-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
              >
                {updating ? "Modification..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default AdminEquipements;