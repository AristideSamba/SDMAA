import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  Plus,
  Pencil,
  Users,
  Link as LinkIcon,
  AlertCircle,
} from "lucide-react";

const FALLBACK_IMAGE =
  "https://plus.unsplash.com/premium_photo-1663076205303-d6cd83269893?q=80&w=1041&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (time) => {
  if (!time) return "—";
  return String(time).slice(0, 5);
};

function Badge({ children, variant = "default" }) {
  const styles = {
    competition: "bg-yellow-50 text-yellow-700",
    interne: "bg-blue-50 text-blue-700",
    externe: "bg-purple-50 text-purple-700",
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

function AdminActivites() {
  const navigate = useNavigate();
  const pageTopRef = useRef(null);

  const [activites, setActivites] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const fetchActivites = async () => {
    try {
      setError("");

      const res = await apiFetch("http://localhost:8080/api/activites");

      if (!res) return;

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Impossible de charger les activités.");
      }

      setActivites(data || []);
    } catch (err) {
      setError(err.message);
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

  const filteredActivites = useMemo(() => {
    const q = search.trim().toLowerCase();

    return activites.filter((item) => {
      const text = `
        ${item.titre || ""}
        ${item.description || ""}
        ${item.lieu || ""}
        ${item.discipline || ""}
        ${item.categorie || ""}
        ${item.typeActivite || ""}
      `.toLowerCase();

      return !q || text.includes(q);
    });
  }, [activites, search]);

  if (loading) {
    return <p className="text-gray-500">Chargement des activités...</p>;
  }

  return (
    <section ref={pageTopRef} className="space-y-8">
      <div className="rounded-[28px] border border-black/5 bg-white px-6 py-8 shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:px-10 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
              Administration
            </p>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Activités
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
              Gérez les activités, compétitions, événements et stages du club.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/dashboard/admin/activites/inscriptions")}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-gray-950 transition hover:bg-gray-50"
            >
              Voir les inscriptions
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard/admin/activites/nouveau")}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black"
            >
              <Plus size={16} />
              Créer une activité
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une activité..."
            className="w-full rounded-2xl border border-black/10 bg-white px-11 py-3 outline-none focus:ring-2 focus:ring-gray-950/10"
          />
        </div>
      </div>

      <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8">
        {filteredActivites.length > 0 ? (
          <div className="grid gap-3">
            {filteredActivites.map((item) => (
              <article
  key={item.id}
  className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
>
  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
    <div className="flex min-w-0 items-start gap-4">
      <img
        src={item.imageActivite || FALLBACK_IMAGE}
        alt={item.titre || "Activité"}
        className="h-16 w-16 shrink-0 rounded-2xl object-cover"
        onError={(e) => {
          e.currentTarget.src = FALLBACK_IMAGE;
        }}
      />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate text-base font-semibold text-gray-950">
            {item.titre || "Activité sans titre"}
          </h2>

          <Badge variant={item.isInternal ? "interne" : "externe"}>
            {item.isInternal ? "Club" : "Externe"}
          </Badge>

          {item.typeActivite && (
            <Badge variant="competition">{item.typeActivite}</Badge>
          )}

          {item.prix && Number(item.prix) > 0 ? (
            <Badge>{item.prix} €</Badge>
          ) : (
            <Badge>Gratuit</Badge>
          )}
        </div>

        <p className="mt-1 line-clamp-1 text-sm text-gray-500">
          {item.description || "Aucune description disponible."}
        </p>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={14} />
            {formatDate(item.dateActivite)}
          </span>

          <span className="inline-flex items-center gap-1">
            <Clock3 size={14} />
            {item.heureDebut || item.heureFin
              ? `${formatTime(item.heureDebut)} - ${formatTime(item.heureFin)}`
              : item.dureeActivite || "Durée non renseignée"}
          </span>

          <span className="inline-flex items-center gap-1">
            <MapPin size={14} />
            {item.lieu || "Lieu non renseigné"}
          </span>

          <span className="inline-flex items-center gap-1">
            <Users size={14} />
            {item.capaciteMax
              ? `${item.capaciteMax} places`
              : "Capacité illimitée"}
          </span>

          {item.lienExterne && (
            <a
              href={item.lienExterne}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              <LinkIcon size={14} />
              Lien externe
            </a>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {item.discipline && <Badge>{item.discipline}</Badge>}
          {item.categorie && <Badge>{item.categorie}</Badge>}
        </div>
      </div>
    </div>

    <div className="flex shrink-0 items-center gap-3">
      <button
        type="button"
        onClick={() => navigate(`/dashboard/admin/activites/${item.id}`)}
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black"
      >
        <Pencil size={15} />
        Modifier
      </button>
    </div>
  </div>
</article>
            ))}
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