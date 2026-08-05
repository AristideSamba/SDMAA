import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  CalendarDays,
  Clock3,
  Link as LinkIcon,
  MapPin,
  Pencil,
  Plus,
  Search,
  Users,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080/api"
).replace(/\/$/, "");

const FALLBACK_IMAGE =
  "https://plus.unsplash.com/premium_photo-1663076205303-d6cd83269893?q=80&w=1041&auto=format&fit=crop&ixlib=rb-4.1.0";

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
};

const formatTime = (time) => {
  if (!time) {
    return "—";
  }

  return String(time).slice(0, 5);
};

function Badge({
  children,
  variant = "default",
}) {
  const styles = {
    competition:
      "bg-yellow-50 text-yellow-700",
    interne:
      "bg-blue-50 text-blue-700",
    externe:
      "bg-purple-50 text-purple-700",
    default:
      "bg-gray-100 text-gray-700",
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

function AdminActivites() {
  const navigate = useNavigate();
  const pageTopRef = useRef(null);

  const [activites, setActivites] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const apiFetch = async (
    url,
    options = {}
  ) => {
    const token =
      localStorage.getItem("token");

    const response = await fetch(url, {
      ...options,

      headers: {
        ...(options.headers || {}),

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    });

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("idUtilisateur");

      navigate("/login");

      return null;
    }

    return response;
  };

  const fetchActivites = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(
        `${API_URL}/activites`
      );

      if (!response) {
        return;
      }

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Impossible de charger les activités."
        );
      }

      setActivites(
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
    fetchActivites();
  }, []);

  useEffect(() => {
    if (error) {
      pageTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [error]);

  const filteredActivites =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      return activites.filter(
        (item) => {
          const searchableText = `
            ${item.titre || ""}
            ${item.description || ""}
            ${item.lieu || ""}
            ${item.discipline || ""}
            ${item.categorie || ""}
            ${item.typeActivite || ""}
          `.toLowerCase();

          return (
            !query ||
            searchableText.includes(query)
          );
        }
      );
    }, [activites, search]);

  if (loading) {
    return (
      <p className="text-gray-500">
        Chargement des activités...
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
              Activités
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
              Gérez les activités,
              compétitions, événements et
              stages du club.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/dashboard/admin/activites/inscriptions"
                )
              }
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-gray-950 transition hover:bg-gray-50"
            >
              Voir les inscriptions
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/dashboard/admin/activites/nouveau"
                )
              }
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black"
            >
              <Plus size={16} />

              Créer une activité
            </button>
          </div>
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

      <div className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
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
            placeholder="Rechercher une activité..."
            className="w-full rounded-2xl border border-black/10 bg-white px-11 py-3 outline-none focus:ring-2 focus:ring-gray-950/10"
          />
        </div>
      </div>

      <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8">
        {filteredActivites.length >
        0 ? (
          <div className="grid gap-3">
            {filteredActivites.map(
              (item) => {
                const hasPrice =
                  item.prix != null &&
                  Number(item.prix) > 0;

                const imageSource =
                  item.imageActivite ||
                  FALLBACK_IMAGE;

                return (
                  <article
                    key={item.id}
                    className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <img
                          src={imageSource}
                          alt={
                            item.titre
                              ? `Illustration de l’activité ${item.titre}`
                              : "Illustration de l’activité"
                          }
                          className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                          onError={(
                            event
                          ) => {
                            event.currentTarget.onerror =
                              null;

                            event.currentTarget.src =
                              FALLBACK_IMAGE;
                          }}
                        />

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-base font-semibold text-gray-950">
                              {item.titre ||
                                "Activité sans titre"}
                            </h2>

                            <Badge
                              variant={
                                item.isInternal
                                  ? "interne"
                                  : "externe"
                              }
                            >
                              {item.isInternal
                                ? "Club"
                                : "Externe"}
                            </Badge>

                            {item.typeActivite && (
                              <Badge variant="competition">
                                {
                                  item.typeActivite
                                }
                              </Badge>
                            )}

                            <Badge>
                              {hasPrice
                                ? `${item.prix} €`
                                : "Gratuit"}
                            </Badge>
                          </div>

                          <p className="mt-1 line-clamp-1 text-sm text-gray-500">
                            {item.description ||
                              "Aucune description disponible."}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays
                                size={14}
                              />

                              {formatDate(
                                item.dateActivite
                              )}
                            </span>

                            <span className="inline-flex items-center gap-1">
                              <Clock3
                                size={14}
                              />

                              {item.heureDebut ||
                              item.heureFin
                                ? `${formatTime(
                                    item.heureDebut
                                  )} - ${formatTime(
                                    item.heureFin
                                  )}`
                                : item.dureeActivite ||
                                  "Durée non renseignée"}
                            </span>

                            <span className="inline-flex items-center gap-1">
                              <MapPin
                                size={14}
                              />

                              {item.lieu ||
                                "Lieu non renseigné"}
                            </span>

                            <span className="inline-flex items-center gap-1">
                              <Users
                                size={14}
                              />

                              {item.capaciteMax
                                ? `${item.capaciteMax} places`
                                : "Capacité illimitée"}
                            </span>

                            {item.lienExterne && (
                              <a
                                href={
                                  item.lienExterne
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                              >
                                <LinkIcon
                                  size={14}
                                />

                                Lien externe
                              </a>
                            )}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.discipline && (
                              <Badge>
                                {
                                  item.discipline
                                }
                              </Badge>
                            )}

                            {item.categorie && (
                              <Badge>
                                {
                                  item.categorie
                                }
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/dashboard/admin/activites/${item.id}`
                            )
                          }
                          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black"
                        >
                          <Pencil
                            size={15}
                          />

                          Modifier
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
            Aucune activité trouvée.
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminActivites;