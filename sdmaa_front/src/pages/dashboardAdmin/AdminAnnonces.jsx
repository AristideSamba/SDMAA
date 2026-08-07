import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Archive,
  CalendarDays,
  FileText,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  User,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080/api"
).replace(/\/$/, "");

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeStatut = (statut) =>
  String(statut || "BROUILLON").toUpperCase();

function Badge({ children, variant = "default" }) {
  const styles = {
    publiee: "bg-green-50 text-green-700 border border-green-100",
    brouillon: "bg-yellow-50 text-yellow-700 border border-yellow-100",
    archivee: "bg-gray-100 text-gray-600 border border-gray-200",
    default: "bg-gray-100 text-gray-700 border border-gray-200",
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

function getStatutVariant(statut) {
  const value = normalizeStatut(statut);

  if (value === "PUBLIEE") return "publiee";
  if (value === "ARCHIVEE") return "archivee";

  return "brouillon";
}

function getStatutLabel(statut) {
  const value = normalizeStatut(statut);

  if (value === "PUBLIEE") return "Publiée";
  if (value === "ARCHIVEE") return "Archivée";

  return "Brouillon";
}

export default function AdminAnnonces() {
  const navigate = useNavigate();
  const pageTopRef = useRef(null);

  const [annonces, setAnnonces] = useState([]);
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("TOUS");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("idUtilisateur");

      navigate("/login");
      return null;
    }

    return response;
  };

  const fetchAnnonces = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(
        `${API_URL}/annonces`
      );

      if (!response) return;

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Impossible de charger les annonces."
        );
      }

      setAnnonces(Array.isArray(data) ? data : []);
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

  const publierAnnonce = async (id) => {
    try {
      setError("");
      setActionLoadingId(id);

      const response = await apiFetch(
        `${API_URL}/annonces/${id}/publier`,
        { method: "PUT" }
      );

      if (!response) return;

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Impossible de publier l’annonce."
        );
      }

      setAnnonces((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                ...data,
                statut: "PUBLIEE",
              }
            : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de publier l’annonce."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const archiverAnnonce = async (id) => {
    try {
      setError("");
      setActionLoadingId(id);

      const response = await apiFetch(
        `${API_URL}/annonces/${id}/archiver`,
        { method: "PUT" }
      );

      if (!response) return;

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Impossible d’archiver l’annonce."
        );
      }

      setAnnonces((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                ...data,
                statut: "ARCHIVEE",
              }
            : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d’archiver l’annonce."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const supprimerAnnonce = async (id) => {
    if (!window.confirm("Supprimer définitivement cette annonce ?")) {
      return;
    }

    try {
      setError("");
      setActionLoadingId(id);

      const response = await apiFetch(
        `${API_URL}/annonces/${id}`,
        { method: "DELETE" }
      );

      if (!response) return;

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.message ||
            data?.error ||
            "Impossible de supprimer l’annonce."
        );
      }

      setAnnonces((current) =>
        current.filter((item) => item.id !== id)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer l’annonce."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    fetchAnnonces();
  }, []);

  useEffect(() => {
    if (error) {
      pageTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [error]);

  const filteredAnnonces = useMemo(() => {
    const query = search.trim().toLowerCase();

    return annonces.filter((item) => {
      const statut = normalizeStatut(item.statut);

      const matchStatut =
        statutFilter === "TOUS" ||
        statut === statutFilter;

      const searchableText = `
        ${item.titre || ""}
        ${item.contenu || ""}
        ${item.auteurNom || ""}
        ${item.auteurPrenom || ""}
        ${item.statut || ""}
      `.toLowerCase();

      return (
        matchStatut &&
        (!query || searchableText.includes(query))
      );
    });
  }, [annonces, search, statutFilter]);

  const total = annonces.length;

  const totalPubliees = annonces.filter(
    (item) =>
      normalizeStatut(item.statut) === "PUBLIEE"
  ).length;

  const totalBrouillons = annonces.filter(
    (item) =>
      normalizeStatut(item.statut) === "BROUILLON"
  ).length;

  const totalArchivees = annonces.filter(
    (item) =>
      normalizeStatut(item.statut) === "ARCHIVEE"
  ).length;

  if (loading) {
    return (
      <p className="text-gray-500">
        Chargement des annonces...
      </p>
    );
  }

  return (
    <section
      ref={pageTopRef}
      className="space-y-8"
    >
      <header className="rounded-[28px] border border-black/5 bg-white px-6 py-8 shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:px-10 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
              Administration
            </p>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Annonces
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
              Créez et gérez les annonces concernant la vie du club.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/dashboard/admin/annonces/nouveau"
              )
            }
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black"
          >
            <Plus size={16} />
            Nouvelle annonce
          </button>
        </div>
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total" value={total} icon={FileText} />
        <StatCard label="Publiées" value={totalPubliees} icon={Send} />
        <StatCard label="Brouillons" value={totalBrouillons} icon={Pencil} />
        <StatCard label="Archivées" value={totalArchivees} icon={Archive} />
      </div>

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
                setSearch(event.target.value)
              }
              placeholder="Rechercher une annonce..."
              className="w-full rounded-2xl border border-black/10 bg-white px-11 py-3 outline-none focus:ring-2 focus:ring-gray-950/10"
            />
          </div>

          <select
            value={statutFilter}
            onChange={(event) =>
              setStatutFilter(event.target.value)
            }
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="PUBLIEE">Publiées</option>
            <option value="BROUILLON">Brouillons</option>
            <option value="ARCHIVEE">Archivées</option>
          </select>
        </div>
      </div>

      <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8">
        {filteredAnnonces.length > 0 ? (
          <div className="grid gap-3">
            {filteredAnnonces.map((item) => {
              const statutVariant =
                getStatutVariant(item.statut);

              const isLoading =
                actionLoadingId === item.id;

              const auteur =
                [
                  item.auteurPrenom,
                  item.auteurNom,
                ]
                  .filter(Boolean)
                  .join(" ") ||
                item.auteurNom ||
                "Administrateur";

              return (
                <article
                  key={item.id}
                  className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-lg font-semibold text-gray-950">
                          {item.titre || "Annonce sans titre"}
                        </h2>

                        <Badge variant={statutVariant}>
                          {getStatutLabel(item.statut)}
                        </Badge>
                      </div>

                      <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-gray-500">
                        {item.contenu ||
                          "Aucun contenu disponible."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <User size={14} />
                          {auteur}
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={14} />
                          {item.datePublication
                            ? `Publication : ${formatDate(
                                item.datePublication
                              )}`
                            : `Création : ${formatDate(
                                item.dateCreation
                              )}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {normalizeStatut(item.statut) !== "PUBLIEE" && (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() =>
                            publierAnnonce(item.id)
                          }
                          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-green-100 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Send size={15} />
                          Publier
                        </button>
                      )}

                      {normalizeStatut(item.statut) === "PUBLIEE" && (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() =>
                            archiverAnnonce(item.id)
                          }
                          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Archive size={15} />
                          Archiver
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/dashboard/admin/annonces/${item.id}`
                          )
                        }
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black"
                      >
                        <Pencil size={15} />
                        Modifier
                      </button>

                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          supprimerAnnonce(item.id)
                        }
                        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Supprimer ${item.titre || "l’annonce"}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 px-6 py-12 text-center text-gray-500">
            Aucune annonce trouvée.
          </div>
        )}
      </section>
    </section>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
          <Icon size={17} />
        </div>
      </div>

      <p className="mt-2 text-3xl font-semibold text-gray-950">
        {value}
      </p>
    </div>
  );
}
