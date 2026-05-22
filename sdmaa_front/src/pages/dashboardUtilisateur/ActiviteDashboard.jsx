import { useEffect, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Clock3,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatDate = (date) => {
  if (!date) return "Date non renseignée";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const isPast = (date) => {
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activityDate = new Date(date);
  activityDate.setHours(0, 0, 0, 0);

  return activityDate < today;
};

const isCompetition = (activite) => {
  return String(activite?.typeActivite || "")
    .toUpperCase()
    .includes("COMPETITION");
};

const normalizeActivite = (item) => ({
  id: item.idActivite || item.id,
  titre: item.titre || "Activité",
  description: item.description || "",
  date: item.dateActivite || item.date || item.dateDebut,
  lieu: item.lieu || "Lieu non renseigné",
  typeActivite: item.typeActivite,
  prix: item.prix ?? item.tarif ?? 0,
  duree: item.dureeActivite || "Durée non renseignée",
  lien:
    item.lienExterne ||
    item.urlInscription ||
    item.lienActivite ||
    item.lien ||
    item.url ||
    "",
  image: item.imageActivite || "",
});

function Badge({ children, variant = "default" }) {
  const styles = {
    default: "bg-white/20 text-white",
    blue: "bg-blue-500/20 text-blue-100",
    green: "bg-green-500/20 text-green-100",
    yellow: "bg-yellow-500/20 text-yellow-100",
    muted: "bg-white/10 text-white/80",
    purple: "bg-purple-500/20 text-purple-100",
    orange: "bg-orange-500/20 text-orange-100",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm ${
        styles[variant] || styles.default
      }`}
    >
      {children}
    </span>
  );
}

function getStatusMeta(status) {
  switch (status) {
    case "DEMANDE_ENVOYEE":
    case "en_attente":
    case "EN_ATTENTE":
      return { label: "Demande envoyée", variant: "purple" };

    case "EN_ATTENTE_PAIEMENT":
      return { label: "Paiement en attente", variant: "orange" };

    case "VALIDEE":
    case "validee":
      return { label: "Inscription confirmée", variant: "green" };

    default:
      return null;
  }
}

const FALLBACK_IMAGE =
  "https://plus.unsplash.com/premium_photo-1663076205303-d6cd83269893?q=80&w=1041&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

function DashboardActivityCard({ activite, registration }) {
  const navigate = useNavigate();

  const past = isPast(activite.date);
  const statusMeta = registration ? getStatusMeta(registration.statut) : null;
  const isExternal = Boolean(activite.lien);
  const imageSrc = activite.image || FALLBACK_IMAGE;

  const handleInternalRegistration = () => {
    navigate(`/dashboard/activites/${activite.id}/inscription`, {
      state: { activite },
    });
  };

  return (
    <article
      className="flex h-full flex-col gap-3"
      aria-labelledby={`activite-title-${activite.id}`}
    >
      <div className="relative h-48 w-full overflow-hidden rounded-3xl">
        <img
          src={imageSrc}
          alt={`Illustration de l'activité ${activite.titre}`}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />

        <div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
          aria-hidden="true"
        />

        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
          <Badge variant={isExternal ? "blue" : "green"}>
            {isExternal ? "Externe" : "Club"}
          </Badge>

          <Badge variant={past ? "muted" : "yellow"}>
            {past ? "Terminé" : "À venir"}
          </Badge>

          {statusMeta && (
            <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
          )}
        </div>

        <div className="absolute right-3 top-3">
          <span className="rounded-2xl bg-black/50 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
            {Number(activite.prix) === 0 ? "Gratuit" : `${activite.prix} €`}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col rounded-3xl border border-black/5 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.10)]">
        <h3
          id={`activite-title-${activite.id}`}
          className="text-xl font-semibold tracking-tight text-gray-950"
        >
          {activite.titre}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
          {activite.description || "Aucune description disponible."}
        </p>

        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CalendarDays
              size={15}
              aria-hidden="true"
              className="shrink-0 text-gray-400"
            />
            <span>{formatDate(activite.date)}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin
              size={15}
              aria-hidden="true"
              className="shrink-0 text-gray-400"
            />
            <span>{activite.lieu}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock3
              size={15}
              aria-hidden="true"
              className="shrink-0 text-gray-400"
            />
            <span>{activite.duree}</span>
          </div>
        </div>

        <div className="mt-auto flex justify-center pt-5">
          {isExternal ? (
            <a
              href={activite.lien}
              target="_blank"
              rel="noreferrer"
              aria-label={`S'inscrire à l'activité externe ${activite.titre}`}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black focus:outline-none focus:ring-4 focus:ring-[#800020]/20"
            >
              <span>S'inscrire</span>
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          ) : registration ? (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-2xl bg-gray-100 px-5 py-3 text-sm font-medium text-gray-500"
            >
              Déjà inscrit
            </button>
          ) : past ? (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-2xl bg-gray-100 px-5 py-3 text-sm font-medium text-gray-500"
            >
              Terminé
            </button>
          ) : (
            <button
              type="button"
              onClick={handleInternalRegistration}
              aria-label={`S'inscrire à l'activité ${activite.titre}`}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-black/15 bg-transparent px-6 py-3 text-sm font-medium text-gray-950 transition-all duration-200 hover:border-black/30 hover:bg-black/5 focus:outline-none focus:ring-4 focus:ring-[#800020]/20"
            >
              S'inscrire
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function ActiviteDashboard() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getRegistrationForActivity = (activityId) =>
    registrations.find(
      (registration) =>
        registration.idActivite === activityId ||
        registration.activiteId === activityId
    );

  useEffect(() => {
    const token = localStorage.getItem("token");

    const apiFetch = async (url) => {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("idUtilisateur");
        navigate("/login");
        return null;
      }

      if (!res.ok) {
        throw new Error("Erreur API");
      }

      return res.json();
    };

    const fetchData = async () => {
      try {
        const [activitesData, inscriptionsData] = await Promise.all([
          apiFetch("http://localhost:8080/api/activites"),
          apiFetch("http://localhost:8080/api/inscriptions-activites/me"),
        ]);

        if (!activitesData || !inscriptionsData) return;

        const activitesFiltrees = (activitesData || [])
          .filter((activite) => !isCompetition(activite))
          .map(normalizeActivite);

        setItems(activitesFiltrees);
        setRegistrations(inscriptionsData || []);
      } catch (err) {
        setError("Impossible de charger les activités.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <p className="text-gray-500" role="status" aria-live="polite">
        Chargement des activités...
      </p>
    );
  }

  return (
    <section className="space-y-8" aria-labelledby="activites-heading">
      <div className="relative overflow-hidden rounded-[28px] border border-black/5 bg-gray-950 px-8 py-8 text-white shadow-[0_16px_50px_rgba(0,0,0,0.12)] sm:px-10 sm:py-10">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute left-[-4rem] top-[-4rem] h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />
          <div className="absolute bottom-[-3rem] right-[-3rem] h-48 w-48 rounded-full bg-orange-400/10 blur-3xl" />
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard/activites/mes-inscriptions")}
          className="absolute right-5 top-5 z-20 inline-flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/20 sm:right-8 sm:top-8"
        >
          Mes inscriptions
        </button>

        <div className="relative pr-0 sm:pr-44">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-300">
            Entraînement
          </p>

          <h1
            id="activites-heading"
            className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Activités
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
            Retrouvez les activités du club, les stages et les événements à venir.
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-700"
        >
          <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <section
        className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8"
        aria-labelledby="prochaines-activites-heading"
      >
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
            Calendrier
          </p>

          <h2
            id="prochaines-activites-heading"
            className="mt-2 text-2xl font-semibold tracking-tight text-gray-950"
          >
            Prochaines activités
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">
            Les activités internes sont gérées directement par le club. Les
            activités externes renvoient vers le site d’inscription correspondant.
          </p>
        </div>

        {items.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((activite) => (
              <DashboardActivityCard
                key={activite.id}
                activite={activite}
                registration={getRegistrationForActivity(activite.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 px-6 py-12 text-center text-gray-500">
            Aucune activité disponible pour le moment.
          </div>
        )}
      </section>
    </section>
  );
}

export default ActiviteDashboard;