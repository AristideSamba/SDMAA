import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Package,
  RotateCcw,
  Search,
  Trash2,
  User,
  XCircle,
} from "lucide-react";

const statuts = ["TOUS", "en_attente", "en_cours", "retourne", "refuse"];

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://sdmaa.onrender.com/api"
).replace(/\/$/, "");

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

function Badge({ children, variant = "default" }) {
  const styles = {
    en_attente: "bg-yellow-50 text-yellow-700",
    en_cours: "bg-blue-50 text-blue-700",
    retourne: "bg-green-50 text-green-700",
    refuse: "bg-red-50 text-red-700",
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

function AdminEmpruntsEquipements() {
  const pageTopRef = useRef(null);

  const [emprunts, setEmprunts] = useState([]);
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("TOUS");

  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiFetch = async (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  };

  const fetchEmprunts = async () => {
    try {
      setError("");

      const res = await apiFetch(`${API_URL}/emprunts-equipements`);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Impossible de charger les emprunts.");
      }

      setEmprunts(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmprunts();
  }, []);

  useEffect(() => {
    if (error || success) {
      pageTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [error, success]);

  const filteredEmprunts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return emprunts.filter((item) => {
      const statut = String(item.statutEmprunt || "").toLowerCase();

      const text = `
        ${item.utilisateurNom || ""}
        ${item.utilisateurPrenom || ""}
        ${item.equipementNom || ""}
        ${item.equipementType || ""}
        ${item.statutEmprunt || ""}
      `.toLowerCase();

      return (
        (!q || text.includes(q)) &&
        (statutFilter === "TOUS" || statut === statutFilter)
      );
    });
  }, [emprunts, search, statutFilter]);

  const runAction = async (id, action, successMessage) => {
    setActionId(`${id}-${action}`);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch(
        `${API_URL}/emprunts-equipements/${id}/${action}`,
        {
          method: "PUT",
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Action impossible.");
      }

      await fetchEmprunts();
      setSuccess(successMessage);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  };

  const deleteEmprunt = async (id) => {
    setActionId(`${id}-delete`);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch(
        `${API_URL}/emprunts-equipements/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Impossible de supprimer l’emprunt.");
      }

      setEmprunts((prev) => prev.filter((item) => item.id !== id));
      setSuccess("Emprunt supprimé avec succès.");
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Chargement des emprunts...</p>;
  }

  return (
    <section ref={pageTopRef} className="space-y-8">
      <div className="rounded-[28px] border border-black/5 bg-white px-6 py-8 shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
          Administration
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Emprunts d’équipements
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
          Gérez les demandes d’emprunt, validez les retraits, refusez les
          demandes et marquez les équipements comme retournés.
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
              placeholder="Rechercher un emprunt..."
              className="w-full rounded-2xl border border-black/10 bg-white px-11 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statuts.map((statut) => (
              <button
                key={statut}
                type="button"
                onClick={() => setStatutFilter(statut)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  statutFilter === statut
                    ? "bg-gray-950 text-white"
                    : "border border-black/10 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {statut === "TOUS" ? "Tous" : statut.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
        {filteredEmprunts.length > 0 ? (
          <div className="grid gap-3">
            {filteredEmprunts.map((item) => {
              const statut = String(item.statutEmprunt || "").toLowerCase();

              const isPending = statut === "en_attente";
              const isActive = statut === "en_cours";
              const isDone = statut === "retourne";
              const isRefused = statut === "refuse";

              return (
                <article
                  key={item.id}
                  className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                        <Package size={24} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-base font-semibold text-gray-950">
                            {item.equipementNom || "Équipement"}
                          </h2>

                          <Badge variant={statut}>
                            {item.statutEmprunt?.replace("_", " ") ||
                              "Statut inconnu"}
                          </Badge>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <User size={14} />
                            {`${item.utilisateurPrenom || ""} ${
                              item.utilisateurNom || ""
                            }`.trim() || "Utilisateur"}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <Package size={14} />
                            {item.equipementType || "Type non renseigné"}
                          </span>

                          <span>Quantité : {item.quantite}</span>

                          <span className="inline-flex items-center gap-1">
                            <Clock3 size={14} />
                            Emprunt : {formatDate(item.dateEmprunt)}
                          </span>

                          <span>
                            Retour prévu : {formatDate(item.dateRetourPrevue)}
                          </span>

                          {item.dateRetourEffective && (
                            <span>
                              Retourné le :{" "}
                              {formatDate(item.dateRetourEffective)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                      {isPending && (
                        <>
                          <button
                            type="button"
                            disabled={actionId === `${item.id}-valider`}
                            onClick={() =>
                              runAction(
                                item.id,
                                "valider",
                                "Emprunt validé avec succès."
                              )
                            }
                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <CheckCircle2 size={15} />
                            Valider
                          </button>

                          <button
                            type="button"
                            disabled={actionId === `${item.id}-refuser`}
                            onClick={() =>
                              runAction(
                                item.id,
                                "refuser",
                                "Emprunt refusé avec succès."
                              )
                            }
                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <XCircle size={15} />
                            Refuser
                          </button>
                        </>
                      )}

                      {isActive && (
                        <button
                          type="button"
                          disabled={actionId === `${item.id}-retour`}
                          onClick={() =>
                            runAction(
                              item.id,
                              "retour",
                              "Équipement marqué comme retourné."
                            )
                          }
                          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <RotateCcw size={15} />
                          Marquer retour
                        </button>
                      )}

                      {(isDone || isRefused) && (
                        <button
                          type="button"
                          disabled={actionId === `${item.id}-delete`}
                          onClick={() => deleteEmprunt(item.id)}
                          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 px-6 py-12 text-center text-gray-500">
            Aucun emprunt trouvé.
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminEmpruntsEquipements;