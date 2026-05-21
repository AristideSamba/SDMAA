import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Trophy,
  ExternalLink,
  ChevronDown,
  Clock3,
  CircleDot,
  Medal,
  Search,
  Sparkles,
} from "lucide-react";

const filters = [
  { key: "ALL", label: "Toutes" },
  { key: "WEEK", label: "Cette semaine" },
  { key: "MONTH", label: "Ce mois" },
];

const isCompetition = (item) => {
  const values = [
    item?.typeActivite,
    item?.categorie,
    item?.categorieActivite,
    item?.activiteTitre,
  ]
    .filter(Boolean)
    .map((v) => String(v).toUpperCase());

  return values.some(
    (v) => v.includes("COMPETITION") || v.includes("COMPÉTITION")
  );
};

const normalizeCompetition = (item) => ({
  id: item.idActivite || item.idInscription || item.id,
  titre: item.activiteTitre || item.titre || item.nom || "Compétition",
  date: item.activiteDate || item.dateActivite || item.dateDebut,
  lieu: item.lieuActivite || item.lieu || item.adresse || "Lieu non renseigné",
  lien:
    item.lienExterne ||
    item.lienActivite ||
    item.lien ||
    item.url ||
    "",
  statut: item.statutInscription || item.statut || "En attente",
  categorie: item.categorie || item.categorieActivite || "Non précisée",
  discipline: item.discipline || "Non précisée",
  convocation: item.convocation || null,
  commentaire: item.commentaire || item.description || null,
  typeActivite: item.typeActivite,
  image: item.imageActivite || "",
});

const isThisWeek = (dateStr) => {
  if (!dateStr) return false;
  const today = new Date();
  const date = new Date(dateStr);
  const diff = (date - today) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 7;
};

const isThisMonth = (dateStr) => {
  if (!dateStr) return false;
  const today = new Date();
  const date = new Date(dateStr);
  return (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return "Date non renseignée";

  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

function FilterButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "bg-gray-950 text-white shadow-sm"
          : "border border-black/10 bg-white text-gray-700 hover:bg-gray-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StatusBadge({ statut }) {
  const styles = {
    Confirmé: "border-green-100 bg-green-50 text-green-700",
    Confirmee: "border-green-100 bg-green-50 text-green-700",
    Validée: "border-green-100 bg-green-50 text-green-700",
    validee: "border-green-100 bg-green-50 text-green-700",
    "En attente": "border-yellow-100 bg-yellow-50 text-yellow-700",
    en_attente: "border-yellow-100 bg-yellow-50 text-yellow-700",
    Annulé: "border-red-100 bg-red-50 text-red-700",
    annulee: "border-red-100 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
        styles[statut] || "border-gray-200 bg-gray-100 text-gray-700"
      }`}
    >
      {statut}
    </span>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-semibold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80";
function CompetitionCard({ comp, isMine = false }) {
  const [open, setOpen] = useState(false);
  const imageSrc = comp.image || FALLBACK_IMAGE;

  return (
    <article className="flex h-full flex-col gap-3">

      {/* Bulle image */}
      <div className="relative h-48 w-full overflow-hidden rounded-3xl">
        <img
          src={imageSrc}
          alt={comp.titre}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Badge isMine en bas à gauche */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {isMine ? "Engagement" : "À découvrir"}
          </span>
        </div>
      </div>

      {/* Bulle header */}
      <div className="relative overflow-hidden rounded-3xl bg-white p-5 text-gray-950 shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.10)]">
        <div className="pointer-events-none absolute right-[-2rem] top-[-2rem] h-24 w-24 rounded-full bg-yellow-400/20 blur-2xl" />

        <div className="relative flex items-start justify-between gap-4">
          <h3 className="break-words text-xl font-semibold tracking-tight">
            {comp.titre}
          </h3>
          <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-yellow-300">
            <Trophy size={22} />
          </div>
        </div>
      </div>

      {/* Bulle contenu */}
      <div className="flex flex-1 flex-col rounded-3xl border border-black/5 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.10)]">
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span className="break-words">{comp.lieu}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays size={16} />
            <span>{formatDate(comp.date)}</span>
          </div>
        </div>

        <div className="mt-5">
          {isMine ? (
            <StatusBadge statut={comp.statut} />
          ) : (
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              Ouverte à l'inscription
            </span>
          )}
        </div>

        <div className="mt-auto pt-6">
          {isMine ? (
            <>
              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-950"
                aria-expanded={open}
              >
                <span>Voir le détail</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  open ? "mt-4 max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="space-y-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CircleDot size={15} />
                    <span>
                      <span className="font-medium text-gray-900">Discipline :</span>{" "}
                      {comp.discipline}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleDot size={15} />
                    <span>
                      <span className="font-medium text-gray-900">Catégorie :</span>{" "}
                      {comp.categorie}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 size={15} />
                    <span>
                      <span className="font-medium text-gray-900">Convocation :</span>{" "}
                      {comp.convocation || "Non précisée"}
                    </span>
                  </div>
                  {comp.commentaire && (
                    <p className="leading-6 text-gray-500">{comp.commentaire}</p>
                  )}
                </div>
              </div>
            </>
          ) : comp.lien ? (
            
            <a  href={comp.lien}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-3xl border border-black/15 bg-transparent px-5 py-3 text-sm font-medium text-gray-950 transition-all duration-200 hover:border-black/30 hover:bg-black/5 sm:w-auto"
            >
              <span>S'inscrire</span>
              <ExternalLink size={15} />
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-400"
            >
              Lien indisponible
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function SectionBlock({ title, description, children }) {
  return (
    <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-950">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 px-6 py-12 text-center">
      <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-gray-700 shadow-sm">
        <Trophy size={24} />
      </div>
      <p className="font-medium text-gray-950">{text}</p>
    </div>
  );
}

const DashboardCompetitions = () => {
  const [filter, setFilter] = useState("ALL");
  const [mesComps, setMesComps] = useState([]);
  const [aVenir, setAVenir] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    const apiFetch = async (url) => {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Erreur API");
      }

      return res.json();
    };

    const fetchCompetitions = async () => {
      try {
        const [inscriptionsData, activitesData] = await Promise.all([
          apiFetch("http://localhost:8080/api/inscriptions-activites/me"),
          apiFetch("http://localhost:8080/api/activites"),
        ]);

        const inscriptionsCompetitions = (inscriptionsData || [])
          .filter(isCompetition)
          .map(normalizeCompetition);

        const idsInscrits = new Set(inscriptionsCompetitions.map((c) => c.id));

        const competitionsDisponibles = (activitesData || [])
          .filter(isCompetition)
          .map(normalizeCompetition)
          .filter((c) => !idsInscrits.has(c.id));

        setMesComps(inscriptionsCompetitions);
        setAVenir(competitionsDisponibles);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  const applyFilters = (items) => {
    return items
      .filter((c) => {
        if (filter === "WEEK") return isThisWeek(c.date);
        if (filter === "MONTH") return isThisMonth(c.date);
        return true;
      })
      .filter((c) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;

        return (
          c.titre.toLowerCase().includes(q) ||
          c.lieu.toLowerCase().includes(q)
        );
      });
  };

  const filteredMesComps = useMemo(
    () => applyFilters(mesComps),
    [mesComps, filter, search]
  );

  const filteredAVenir = useMemo(
    () => applyFilters(aVenir),
    [aVenir, filter, search]
  );

  const prochaineCompetition = [...mesComps]
    .filter((c) => c.date && new Date(c.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  if (loading) {
    return <p className="text-gray-500">Chargement des compétitions...</p>;
  }

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[28px] border border-black/5 bg-gray-950 px-6 py-8 text-white shadow-[0_16px_50px_rgba(0,0,0,0.12)] sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-5rem] top-[-5rem] h-48 w-48 rounded-full bg-yellow-400/20 blur-3xl" />
          <div className="absolute bottom-[-4rem] right-[-4rem] h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
        </div>

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
              Performance
            </p>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Compétitions
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
              Suivez vos engagements, préparez vos échéances sportives et
              découvrez les compétitions ouvertes à venir.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <StatCard
                icon={Medal}
                label="Engagements"
                value={mesComps.length}
              />
              <StatCard icon={Sparkles} label="À venir" value={aVenir.length} />
              <StatCard
                icon={CalendarDays}
                label="Cette semaine"
                value={mesComps.filter((c) => isThisWeek(c.date)).length}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-sm font-medium text-gray-400">
              Prochaine compétition
            </p>

            {prochaineCompetition ? (
              <>
                <h2 className="mt-3 text-xl font-semibold text-white">
                  {prochaineCompetition.titre}
                </h2>
                <div className="mt-4 space-y-2 text-sm text-gray-300">
                  <p className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    {formatDate(prochaineCompetition.date)}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={16} />
                    {prochaineCompetition.lieu}
                  </p>
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm leading-6 text-gray-300">
                Aucune compétition confirmée pour le moment.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-black/5 bg-white/80 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          {filters.map((item) => (
            <FilterButton
              key={item.key}
              active={filter === item.key}
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </FilterButton>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une compétition..."
            className="w-full rounded-2xl border border-black/10 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-gray-950/10"
          />
        </div>
      </div>

      <SectionBlock
        title="Mes engagements"
        description="Retrouvez ici les compétitions auxquelles vous êtes déjà inscrit."
      >
        {filteredMesComps.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredMesComps.map((comp) => (
              <CompetitionCard key={comp.id} comp={comp} isMine />
            ))}
          </div>
        ) : (
          <EmptyState text="Aucune compétition trouvée pour ce filtre." />
        )}
      </SectionBlock>

      <SectionBlock
        title="Découvrir"
        description="Explorez les compétitions ouvertes à venir et accédez aux inscriptions externes."
      >
        {filteredAVenir.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredAVenir.map((comp) => (
              <CompetitionCard key={comp.id} comp={comp} />
            ))}
          </div>
        ) : (
          <EmptyState text="Aucune compétition à venir pour ce filtre." />
        )}
      </SectionBlock>
    </section>
  );
};

export default DashboardCompetitions;