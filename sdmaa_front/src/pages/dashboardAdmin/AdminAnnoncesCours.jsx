import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Megaphone,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080/api"
).replace(/\/$/, "");

const typesAnnonce = ["TOUS", "ANNULATION", "REPORT", "INFORMATION"];

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function Badge({ children, variant = "default" }) {
  const styles = {
    annulation: "bg-red-50 text-red-700",
    report: "bg-yellow-50 text-yellow-700",
    information: "bg-blue-50 text-blue-700",
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

function getAnnonceVariant(type) {
  return String(type || "").toLowerCase();
}

function AdminAnnoncesCours() {
  const navigate = useNavigate();
  const pageTopRef = useRef(null);

  const [annonces, setAnnonces] = useState([]);
  const [cours, setCours] = useState([]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("TOUS");

  const [form, setForm] = useState({
    idCours: "",
    typeAnnonce: "INFORMATION",
    message: "",
    dateConcernee: "",
    jourConcerne: "",
  });

  const [editForm, setEditForm] = useState({
    idAnnonce: null,
    typeAnnonce: "INFORMATION",
    message: "",
    dateConcernee: "",
    jourConcerne: "",
  });

  const [showEditModal, setShowEditModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiFetch = async (url, options = {}, timeout = 15000) => {
    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("idUtilisateur");

        navigate("/login");
        return null;
      }

      return res;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new Error(
          "Le serveur met trop de temps à répondre. Veuillez réessayer."
        );
      }

      throw err;
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  const fetchAnnonces = async () => {
    const res = await apiFetch(`${API_URL}/annonces-cours`);

    if (!res) return [];

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(
        data?.message ||
          `Impossible de charger les annonces (${res.status}).`
      );
    }

    return Array.isArray(data) ? data : [];
  };

  const fetchCours = async () => {
    const res = await apiFetch(`${API_URL}/cours`);

    if (!res) return [];

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(
        data?.message || `Impossible de charger les cours (${res.status}).`
      );
    }

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.content)) {
      return data.content;
    }

    return [];
  };

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("Chargement depuis API_URL :", API_URL);

      const [annoncesResult, coursResult] = await Promise.allSettled([
        fetchAnnonces(),
        fetchCours(),
      ]);

      if (annoncesResult.status === "fulfilled") {
        setAnnonces(annoncesResult.value);
      } else {
        console.error("Erreur annonces :", annoncesResult.reason);
        setAnnonces([]);
      }

      if (coursResult.status === "fulfilled") {
        setCours(coursResult.value);
      } else {
        console.error("Erreur cours :", coursResult.reason);
        setCours([]);
      }

      const messages = [];

      if (annoncesResult.status === "rejected") {
        messages.push(
          annoncesResult.reason instanceof Error
            ? annoncesResult.reason.message
            : "Impossible de charger les annonces."
        );
      }

      if (coursResult.status === "rejected") {
        messages.push(
          coursResult.reason instanceof Error
            ? coursResult.reason.message
            : "Impossible de charger les cours."
        );
      }

      if (messages.length > 0) {
        setError(messages.join(" "));
      }
    } catch (err) {
      console.error("Erreur chargement général :", err);

      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue pendant le chargement."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (error || success) {
      pageTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [error, success]);

  const filteredAnnonces = useMemo(() => {
    const q = search.trim().toLowerCase();

    return annonces.filter((item) => {
      const type = String(item.typeAnnonce || "").toUpperCase();

      const text = `
        ${item.message || ""}
        ${item.typeAnnonce || ""}
        ${item.coursTitre || ""}
        ${item.coursJourHabituel || ""}
        ${item.coursLieu || ""}
        ${item.jourConcerne || ""}
      `.toLowerCase();

      return (
        (!q || text.includes(q)) &&
        (typeFilter === "TOUS" || type === typeFilter)
      );
    });
  }, [annonces, search, typeFilter]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

 const createAnnonce = async (e) => {
  e.preventDefault();

  setSubmitting(true);
  setError("");
  setSuccess("");

  try {
    if (!form.idCours) {
      throw new Error("Veuillez sélectionner un cours.");
    }

    if (!form.message.trim()) {
      throw new Error("Veuillez saisir un message.");
    }

    const body = {
      typeAnnonce: form.typeAnnonce,
      message: form.message.trim(),
      dateConcernee: form.dateConcernee || null,
      jourConcerne: form.jourConcerne.trim() || null,
    };

    const res = await apiFetch(
      `${API_URL}/annonces-cours/cours/${encodeURIComponent(
        form.idCours
      )}`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    if (!res) {
      return;
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(
        data?.message ||
          "Impossible de créer l’annonce."
      );
    }

    const updatedAnnonces =
      await fetchAnnonces();

    setAnnonces(updatedAnnonces);

    setForm({
      idCours: "",
      typeAnnonce: "INFORMATION",
      message: "",
      dateConcernee: "",
      jourConcerne: "",
    });

    setSuccess(
      "Annonce créée avec succès."
    );
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Une erreur est survenue."
    );
  } finally {
    setSubmitting(false);
  }
};

  const openEditModal = (item) => {
    setEditForm({
      idAnnonce: item.idAnnonce,
      typeAnnonce: item.typeAnnonce || "INFORMATION",
      message: item.message || "",
      dateConcernee: item.dateConcernee || "",
      jourConcerne: item.jourConcerne || "",
    });

    setShowEditModal(true);
  };

  const updateAnnonce = async (e) => {
    e.preventDefault();

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      if (!editForm.message.trim()) {
        throw new Error("Veuillez saisir un message.");
      }

      const body = {
        typeAnnonce: editForm.typeAnnonce,
        message: editForm.message,
        dateConcernee: editForm.dateConcernee || null,
        jourConcerne: editForm.jourConcerne || null,
      };

      const res = await apiFetch(
        `${API_URL}/annonces-cours/${editForm.idAnnonce}`,
        {
          method: "PUT",
          body: JSON.stringify(body),
        }
      );

      const data = await res?.json().catch(() => null);

      if (!res?.ok) {
        throw new Error(data?.message || "Impossible de modifier l’annonce.");
      }

      const updatedAnnonces = await fetchAnnonces();
      setAnnonces(updatedAnnonces);

      setShowEditModal(false);
      setSuccess("Annonce modifiée avec succès.");
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

  const deleteAnnonce = async (idAnnonce) => {
    setDeletingId(idAnnonce);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch(
        `${API_URL}/annonces-cours/${idAnnonce}`,
        {
          method: "DELETE",
        }
      );

      if (!res) return;

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Impossible de supprimer l’annonce.");
      }

      setAnnonces((current) =>
        current.filter((item) => item.idAnnonce !== idAnnonce)
      );

      setSuccess("Annonce supprimée avec succès.");
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
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-[#800020]" />

          <p className="mt-4 text-sm text-gray-500">
            Chargement des annonces...
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Le serveur peut mettre quelques secondes à démarrer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section ref={pageTopRef} className="space-y-8">
      <div className="rounded-[28px] border border-black/5 bg-white px-6 py-8 shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:px-10 sm:py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
          Administration
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Annonces de cours
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
          Publiez des annonces liées aux cours : annulation, report ou
          information importante.
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
        onSubmit={createAnnonce}
        className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8"
      >
        <h2 className="text-xl font-semibold tracking-tight text-gray-950">
          Créer une annonce
        </h2>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <select
            name="idCours"
            value={form.idCours}
            onChange={handleChange}
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
          >
            <option value="">Sélectionner un cours</option>
            {cours.map((item) => (
              <option key={item.idCours} value={item.idCours}>
                {item.titre} — {item.jour}
              </option>
            ))}
          </select>

          <select
            name="typeAnnonce"
            value={form.typeAnnonce}
            onChange={handleChange}
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
          >
            <option value="INFORMATION">Information</option>
            <option value="ANNULATION">Annulation</option>
            <option value="REPORT">Report</option>
          </select>

          <input
            type="date"
            name="dateConcernee"
            value={form.dateConcernee}
            onChange={handleChange}
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
          />

          <input
            name="jourConcerne"
            value={form.jourConcerne}
            onChange={handleChange}
            placeholder="Jour concerné, ex : Lundi"
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
          />

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={4}
            placeholder="Message de l’annonce..."
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10 lg:col-span-2"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={16} />
            {submitting ? "Création..." : "Créer l’annonce"}
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
              placeholder="Rechercher une annonce..."
              className="w-full rounded-2xl border border-black/10 bg-white px-11 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {typesAnnonce.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={[
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  typeFilter === type
                    ? "bg-gray-950 text-white"
                    : "border border-black/10 bg-white text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8">
        {filteredAnnonces.length > 0 ? (
          <div className="grid gap-3">
            {filteredAnnonces.map((item) => (
              <article
                key={item.idAnnonce}
                className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)]"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-900">
                      <Megaphone size={20} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-base font-semibold text-gray-950">
                          {item.coursTitre || "Cours non renseigné"}
                        </h2>

                        <Badge variant={getAnnonceVariant(item.typeAnnonce)}>
                          {item.typeAnnonce || "Annonce"}
                        </Badge>
                      </div>

                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-500">
                        {item.message || "Aucun message."}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={14} />
                          {formatDate(item.dateConcernee)}
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <Clock3 size={14} />
                          {item.jourConcerne ||
                            item.coursJourHabituel ||
                            "Jour non renseigné"}
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <MapPin size={14} />
                          {item.coursLieu || "Lieu non renseigné"}
                        </span>

                        <span>Créée le {formatDateTime(item.dateCreation)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black"
                    >
                      <Pencil size={15} />
                      Modifier
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === item.idAnnonce}
                      onClick={() => deleteAnnonce(item.idAnnonce)}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 size={15} />
                      {deletingId === item.idAnnonce
                        ? "Suppression..."
                        : "Supprimer"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 px-6 py-12 text-center text-gray-500">
            Aucune annonce trouvée.
          </div>
        )}
      </section>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={updateAnnonce}
            className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-950">
                  Modifier l’annonce
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Modifiez le message, le type ou la date concernée.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="rounded-2xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-950"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <select
                name="typeAnnonce"
                value={editForm.typeAnnonce}
                onChange={handleEditChange}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
              >
                <option value="INFORMATION">Information</option>
                <option value="ANNULATION">Annulation</option>
                <option value="REPORT">Report</option>
              </select>

              <input
                type="date"
                name="dateConcernee"
                value={editForm.dateConcernee || ""}
                onChange={handleEditChange}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
              />

              <input
                name="jourConcerne"
                value={editForm.jourConcerne}
                onChange={handleEditChange}
                placeholder="Jour concerné"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10 lg:col-span-2"
              />

              <textarea
                name="message"
                value={editForm.message}
                onChange={handleEditChange}
                rows={5}
                placeholder="Message de l’annonce..."
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10 lg:col-span-2"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="cursor-pointer rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={updating}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Pencil size={15} />
                {updating ? "Modification..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default AdminAnnoncesCours;