import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  Plus,
  Pencil,
  Trash2,
  Users,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const jours = [
  "TOUS",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://sdmaa.onrender.com/api"
).replace(/\/$/, "");

const formatTime = (time) => {
  if (!time) return "—";
  return String(time).slice(0, 5);
};

const getCoachsCours = (item) => {
  return item?.coachs?.length > 0 ? item.coachs : [];
};

function Badge({ children, variant = "default" }) {
  const styles = {
    actif: "bg-green-50 text-green-700",
    suspendu: "bg-red-50 text-red-700",
    brouillon: "bg-yellow-50 text-yellow-700",
    annule: "bg-red-50 text-red-700",
    default: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[variant] || styles.default
        }`}
    >
      {children}
    </span>
  );
}

function AdminCours() {
  const navigate = useNavigate();
  const pageTopRef = useRef(null);

  const [coursToDelete, setCoursToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [cours, setCours] = useState([]);
  const [search, setSearch] = useState("");
  const [jourFilter, setJourFilter] = useState("TOUS");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.clear();
      navigate("/login");
      return null;
    }

    return res;
  };

  const fetchCours = async () => {
    try {
      setError("");

      const res = await apiFetch(`${API_URL}/cours`);

      if (!res) return;

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Impossible de charger les cours.");
      }

      setCours(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCours();
  }, []);

  useEffect(() => {
    if (success || error) {
      pageTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [success, error]);

  const filteredCours = useMemo(() => {
    const q = search.trim().toLowerCase();

    return cours.filter((item) => {
      const coachsText = getCoachsCours(item).join(" ");

      const text = `${item.titre || ""} ${item.description || ""} ${item.lieu || ""
        } ${item.niveau || ""} ${item.trancheAge || ""} ${coachsText}`.toLowerCase();

      return (
        (!q || text.includes(q)) &&
        (jourFilter === "TOUS" || item.jour === jourFilter)
      );
    });
  }, [cours, search, jourFilter]);

  const suspendCours = async () => {
    if (!coursToDelete) return;

    setUpdatingId(coursToDelete.idCours);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch(
        `${API_URL}/cours/${coursToDelete.idCours}/suspendre`,
        { method: "PUT" }
      );

      if (!res) return;

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message || "Erreur lors de la suspension du cours."
        );
      }

      setCours((prev) =>
        prev.map((item) =>
          item.idCours === coursToDelete.idCours
            ? { ...item, statutCours: "suspendu" }
            : item
        )
      );

      setSuccess("Cours suspendu avec succès.");
      setShowDeleteModal(false);
      setCoursToDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Chargement des cours...</p>;
  }

  return (
    <section ref={pageTopRef} className="space-y-8">
      <div className="rounded-[28px] border border-black/5 bg-white px-6 py-8 text-gray-950 shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:px-10 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
              Administration
            </p>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Cours
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
              Gérez les cours du club, leurs horaires, niveaux, lieux et coachs
              affectés.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard/admin/cours/nouveau")}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black"
          >
            <Plus size={16} />
            Créer un cours
          </button>
        </div>
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
              placeholder="Rechercher un cours..."
              className="w-full rounded-2xl border border-black/10 bg-white px-11 py-3 outline-none focus:ring-2 focus:ring-gray-950/10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {jours.map((jour) => (
              <button
                key={jour}
                type="button"
                onClick={() => setJourFilter(jour)}
                className={[
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  jourFilter === jour
                    ? "bg-gray-950 text-white"
                    : "border border-black/10 bg-white text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                {jour}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8">
        {filteredCours.length > 0 ? (
          <div className="grid gap-3">
            {filteredCours.map((item) => {
              const coachsAffectes = getCoachsCours(item);
              const isSuspended =
                String(item.statutCours || "").toLowerCase() === "suspendu";

              return (
                <article
                  key={item.idCours}
                  className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    {/* Partie gauche */}
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-900">
                        <Users size={20} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-base font-semibold text-gray-950">
                            {item.titre || "Cours sans titre"}
                          </h2>

                          <Badge variant={String(item.statutCours || "").toLowerCase()}>
                            {item.statutCours || "Statut inconnu"}
                          </Badge>
                        </div>

                        <p className="mt-1 line-clamp-1 text-sm text-gray-500">
                          {item.description || "Aucune description."}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={14} />
                            {item.jour || "Jour non renseigné"}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <Clock3 size={14} />
                            {formatTime(item.heureDebut)} -{" "}
                            {formatTime(item.heureFin)}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <MapPin size={14} />
                            {item.lieu || "Lieu non renseigné"}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <Users size={14} />
                            {coachsAffectes.length > 0
                              ? coachsAffectes.join(", ")
                              : "Aucun coach"}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.trancheAge && (
                            <Badge>{item.trancheAge}</Badge>
                          )}

                          {item.niveau && (
                            <Badge>{item.niveau}</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Partie droite */}
                    <div className="flex shrink-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/dashboard/admin/cours/${item.idCours}`)
                        }
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black"
                      >
                        <Pencil size={15} />
                        Modifier
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === item.idCours || isSuspended}
                        onClick={() => {
                          setCoursToDelete(item);
                          setShowDeleteModal(true);
                        }}
                        className={[
                          "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition",
                          isSuspended
                            ? "cursor-not-allowed bg-gray-200 text-gray-500"
                            : "cursor-pointer border border-red-100 bg-red-50 text-red-700 hover:bg-red-100",
                        ].join(" ")}
                      >
                        <Trash2 size={15} />

                        {isSuspended ? "Suspendu" : "Suspendre"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 px-6 py-12 text-center text-gray-500">
            Aucun cours trouvé.
          </div>
        )}
      </section>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-950">
              Suspendre le cours
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Voulez-vous vraiment suspendre{" "}
              <span className="font-medium text-gray-900">
                {coursToDelete?.titre}
              </span>{" "}
              ?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setCoursToDelete(null);
                }}
                className="rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={suspendCours}
                disabled={updatingId === coursToDelete?.idCours}
                className="rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingId === coursToDelete?.idCours
                  ? "Suspension..."
                  : "Suspendre"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminCours;