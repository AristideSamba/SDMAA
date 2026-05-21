import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  Check,
  Clock3,
  Mail,
  MapPin,
  Search,
  Trophy,
  User,
  X,
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
    attente: "bg-yellow-50 text-yellow-700",
    acceptee: "bg-green-50 text-green-700",
    refusee: "bg-red-50 text-red-700",
    annulee: "bg-gray-100 text-gray-600",
    interne: "bg-blue-50 text-blue-700",
    externe: "bg-purple-50 text-purple-700",
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

function normalizeStatut(statut) {
  return String(statut || "EN_ATTENTE").toUpperCase();
}

function getStatutLabel(statut) {
  const value = String(statut || "en_attente").toLowerCase();

  if (value === "validee") return "Validée";
  if (value === "refusee") return "Refusée";

  return "En attente";
}

function getStatutVariant(statut) {
  const value = String(statut || "en_attente").toLowerCase();

  if (value === "validee") return "acceptee";
  if (value === "refusee") return "refusee";

  return "attente";
}

function AdminInscriptionsActivites() {
  const navigate = useNavigate();
  const pageTopRef = useRef(null);

  const [inscriptions, setInscriptions] = useState([]);
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("TOUS");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  const apiFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
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

  const fetchInscriptions = async () => {
    try {
      setError("");

      const res = await apiFetch(
        "http://localhost:8080/api/inscriptions-activites"
      );

      if (!res) return;

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message || "Impossible de charger les inscriptions."
        );
      }

      setInscriptions(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validerInscription = async (inscriptionId) => {
    try {
      setError("");
      setActionLoadingId(inscriptionId);

      const res = await apiFetch(
        `http://localhost:8080/api/inscriptions-activites/${inscriptionId}/valider`,
        { method: "PUT" }
      );

      if (!res) return;

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message || "Impossible de valider l'inscription."
        );
      }

      setInscriptions((current) =>
        current.map((item) =>
          item.id === inscriptionId
            ? {
              ...item,
              statutInscription: "validee",
              statutPaiement:
                item.statutPaiement === "en_attente"
                  ? "paye"
                  : item.statutPaiement,
              dateValidationAdmin: new Date().toISOString().slice(0, 10),
              ...(data || {}),
            }
            : item
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const refuserInscription = async (inscriptionId) => {
    try {
      setError("");
      setActionLoadingId(inscriptionId);

      const res = await apiFetch(
        `http://localhost:8080/api/inscriptions-activites/${inscriptionId}/refuser`,
        { method: "PUT" }
      );

      if (!res) return;

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message || "Impossible de refuser l'inscription."
        );
      }

      setInscriptions((current) =>
        current.map((item) =>
          item.id === inscriptionId
            ? {
              ...item,
              statutInscription: "refusee",
              dateValidationAdmin: new Date().toISOString().slice(0, 10),
              ...(data || {}),
            }
            : item
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    fetchInscriptions();
  }, []);

  useEffect(() => {
    if (error) {
      pageTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [error]);

  const filteredInscriptions = useMemo(() => {
  const q = search.trim().toLowerCase();

  return inscriptions.filter((item) => {
    const statut = String(item.statutInscription || "en_attente").toLowerCase();

    const matchStatut =
      statutFilter === "TOUS" || statut === statutFilter.toLowerCase();

    const text = `
      ${item.activiteTitre || ""}
      ${item.activiteLieu || ""}
      ${item.lieu || ""}
      ${item.typeActivite || ""}
      ${item.categorie || ""}
      ${item.discipline || ""}
      ${item.utilisateurNom || ""}
      ${item.utilisateurPrenom || ""}
      ${item.commentaire || ""}
      ${item.statutInscription || ""}
      ${item.statutPaiement || ""}
    `.toLowerCase();

    return matchStatut && (!q || text.includes(q));
  });
}, [inscriptions, search, statutFilter]);

  const total = inscriptions.length;
  const totalAttente = inscriptions.filter(
    (item) => getStatutVariant(item.statutInscription) === "attente"
  ).length;
  const totalAcceptees = inscriptions.filter(
    (item) => getStatutVariant(item.statutInscription) === "acceptee"
  ).length;
  const totalRefusees = inscriptions.filter(
    (item) => getStatutVariant(item.statutInscription) === "refusee"
  ).length;

  if (loading) {
    return <p className="text-gray-500">Chargement des inscriptions...</p>;
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
              Inscriptions aux activités
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
              Consultez, acceptez ou refusez les demandes d’inscription aux
              activités du club.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard/admin/activites")}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-gray-950 transition hover:bg-gray-50"
          >
            Retour aux activités
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
          <p className="text-sm text-gray-500">Total</p>
          <p className="mt-2 text-3xl font-semibold">{total}</p>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
          <p className="text-sm text-gray-500">En attente</p>
          <p className="mt-2 text-3xl font-semibold">{totalAttente}</p>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
          <p className="text-sm text-gray-500">Acceptées</p>
          <p className="mt-2 text-3xl font-semibold">{totalAcceptees}</p>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
          <p className="text-sm text-gray-500">Refusées</p>
          <p className="mt-2 text-3xl font-semibold">{totalRefusees}</p>
        </div>
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par activité, adhérent, email..."
              className="w-full rounded-2xl border border-black/10 bg-white px-11 py-3 outline-none focus:ring-2 focus:ring-gray-950/10"
            />
          </div>

          <select
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="validee">Validées</option>
            <option value="refusee">Refusées</option>
          </select>
        </div>
      </div>

      <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8">
        {filteredInscriptions.length > 0 ? (
          <div className="grid gap-3">
            {filteredInscriptions.map((item) => {
  const activite = {
    id: item.activiteId,
    titre: item.activiteTitre,
    dateActivite: item.activiteDate,
    lieu: item.activiteLieu || item.lieu,
    typeActivite: item.typeActivite,
    lienExterne: item.lienExterne,
    categorie: item.categorie,
    discipline: item.discipline,
    imageActivite: item.image,
    dureeActivite: item.dureeActivite,
  };

  const nom = item.utilisateurNom || "";
  const prenom = item.utilisateurPrenom || "";
  const email = item.utilisateurEmail || "Email non renseigné";

  const isActionLoading = actionLoadingId === item.id;
  const statutVariant = getStatutVariant(item.statutInscription);

  return (
                <article
  key={item.id}
  className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
>
  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
    <div className="flex min-w-0 items-start gap-4">
      <img
        src={activite.imageActivite || FALLBACK_IMAGE}
        alt={activite.titre || "Activité"}
        className="h-16 w-16 shrink-0 rounded-2xl object-cover"
        onError={(e) => {
          e.currentTarget.src = FALLBACK_IMAGE;
        }}
      />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate text-base font-semibold text-gray-950">
            {activite.titre || "Activité sans titre"}
          </h2>

          <Badge variant={statutVariant}>
            {getStatutLabel(item.statutInscription)}
          </Badge>

          {activite.typeActivite && <Badge>{activite.typeActivite}</Badge>}

          {item.statutPaiement && (
            <Badge>Paiement : {item.statutPaiement.replace("_", " ")}</Badge>
          )}
        </div>

        <p className="mt-1 line-clamp-1 text-sm text-gray-500">
          {item.commentaire || "Aucun commentaire."}
        </p>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <User size={14} />
            {prenom || nom
              ? `${prenom} ${nom}`.trim()
              : "Adhérent non renseigné"}
          </span>

          <span className="inline-flex items-center gap-1">
            <CalendarDays size={14} />
            Demande : {formatDate(item.dateDemande)}
          </span>

          <span className="inline-flex items-center gap-1">
            <CalendarDays size={14} />
            Activité : {formatDate(activite.dateActivite)}
          </span>

          <span className="inline-flex items-center gap-1">
            <Clock3 size={14} />
            {activite.dureeActivite || "Durée non renseignée"}
          </span>

          <span className="inline-flex items-center gap-1">
            <MapPin size={14} />
            {activite.lieu || "Lieu non renseigné"}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {activite.discipline && <Badge>{activite.discipline}</Badge>}
          {activite.categorie && <Badge>{activite.categorie}</Badge>}
        </div>
      </div>
    </div>

    <div className="flex shrink-0 flex-wrap items-center gap-3 xl:justify-end">
      <button
        type="button"
        disabled={isActionLoading || statutVariant !== "attente"}
        onClick={() => validerInscription(item.id)}
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Check size={15} />
        Valider
      </button>

      <button
        type="button"
        disabled={isActionLoading || statutVariant !== "attente"}
        onClick={() => refuserInscription(item.id)}
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <X size={15} />
        Refuser
      </button>
    </div>
  </div>
</article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 px-6 py-12 text-center text-gray-500">
            Aucune inscription trouvée.
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminInscriptionsActivites;