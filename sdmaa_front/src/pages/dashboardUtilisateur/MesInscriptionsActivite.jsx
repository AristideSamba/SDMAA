import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Clock3,
  CheckCircle2,
  AlertCircle,
  CircleDot,
} from "lucide-react";

const formatDate = (date) => {
  if (!date) return "Date non renseignée";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const isCompetition = (item) =>
  String(item?.typeActivite || "")
    .toUpperCase()
    .includes("COMPETITION");

const isPast = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

const normalizeInscription = (item) => ({
  id: item.idInscription || item.id,
  idActivite: item.idActivite,
  titre: item.titreActivite || item.titre || "Activité",
  description: item.description || item.descriptionActivite || "",
  typeActivite: item.typeActivite,
  date: item.dateActivite || item.date || item.dateDebut,
  lieu: item.lieuActivite || item.lieu || "Lieu non renseigné",
  duree: item.dureeActivite || item.duree || "Durée non renseignée",
  prix: item.prix ?? item.tarif ?? 0,
  statut: item.statutInscription || item.statut || "en_attente",
  commentaire: item.commentaire || "",
});

function Badge({ children, variant = "default" }) {
  const styles = {
    default: "bg-gray-100 text-gray-700",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    orange: "bg-orange-50 text-orange-700",
    red: "bg-red-50 text-red-700",
    purple: "bg-purple-50 text-purple-700",
    muted: "bg-gray-200 text-gray-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

function getStatusMeta(status) {
  switch (status) {
    case "VALIDEE":
    case "validee":
      return { label: "Confirmée", variant: "green" };

    case "EN_ATTENTE_PAIEMENT":
      return { label: "Paiement en attente", variant: "orange" };

    case "DEMANDE_ENVOYEE":
    case "EN_ATTENTE":
    case "en_attente":
      return { label: "Demande envoyée", variant: "purple" };

    case "REFUSEE":
    case "refusee":
      return { label: "Refusée", variant: "red" };

    default:
      return { label: status || "En attente", variant: "default" };
  }
}

function InscriptionCard({ inscription }) {
  const statusMeta = getStatusMeta(inscription.statut);
  const past = isPast(inscription.date);

  return (
    <article className="rounded-3xl border border-black/5 bg-white/90 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
      
      {/* HEADER BADGES */}
      <div className="flex flex-wrap gap-2">
        <Badge variant={statusMeta.variant}>
          {statusMeta.label}
        </Badge>

        <Badge variant={past ? "muted" : "yellow"}>
          {past ? "Terminée" : "À venir"}
        </Badge>
      </div>

      {/* TITRE */}
      <h2 className="mt-4 text-xl font-semibold tracking-tight text-gray-950">
        {inscription.titre}
      </h2>

      {/* DESCRIPTION */}
      {inscription.description && (
        <p className="mt-2 text-sm leading-6 text-gray-600">
          {inscription.description}
        </p>
      )}

      {/* INFOS */}
      <div className="mt-5 space-y-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} />
          <span>{formatDate(inscription.date)}</span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin size={16} />
          <span>{inscription.lieu}</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock3 size={16} />
          <span>{inscription.duree}</span>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-5 rounded-2xl bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Tarif</p>

          <p className="text-lg font-semibold text-gray-950">
            {Number(inscription.prix) === 0
              ? "Gratuit"
              : `${inscription.prix} €`}
          </p>
        </div>

        {inscription.commentaire && (
          <p className="mt-3 text-sm leading-6 text-gray-500">
            {inscription.commentaire}
          </p>
        )}
      </div>
    </article>
  );
}

function MesInscriptionsActivite() {
  const navigate = useNavigate();

  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInscriptions = async () => {
      try {
        const res = await fetch(
          "http://localhost:8080/api/inscriptions-activites/me",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("idUtilisateur");
          navigate("/connexion");
          return;
        }

        if (!res.ok) {
          throw new Error("Impossible de charger vos inscriptions.");
        }

        const data = await res.json();

        const filtered = (data || [])
          .filter((item) => !isCompetition(item))
          .map(normalizeInscription);

        setInscriptions(filtered);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInscriptions();
  }, [navigate]);

  const inscriptionsAVenir = useMemo(
    () => inscriptions.filter((item) => !isPast(item.date)),
    [inscriptions]
  );

  const inscriptionsPassees = useMemo(
    () => inscriptions.filter((item) => isPast(item.date)),
    [inscriptions]
  );

  if (loading) {
    return <p className="text-gray-500">Chargement de vos inscriptions...</p>;
  }

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[28px] border border-black/5 bg-gray-950 px-6 py-8 text-white shadow-[0_16px_50px_rgba(0,0,0,0.12)] sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-4rem] top-[-4rem] h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />
          <div className="absolute bottom-[-3rem] right-[-3rem] h-48 w-48 rounded-full bg-orange-400/10 blur-3xl" />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => navigate("/dashboard/activites")}
            className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-300 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Retour aux activités
          </button>

          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
            Activités
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Mes inscriptions
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
            Retrouvez les activités auxquelles vous êtes inscrit et suivez leur
            statut.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {inscriptions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/10 bg-white/80 px-6 py-12 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-green-50 text-green-700">
            <CheckCircle2 size={24} />
          </div>
          <p className="font-semibold text-gray-950">Aucune inscription</p>
          <p className="mt-2 text-sm text-gray-500">
            Vous n’êtes inscrit à aucune activité pour le moment.
          </p>
        </div>
      ) : (
        <>
          <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
                À venir
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                Mes prochaines activités
              </h2>
            </div>

            {inscriptionsAVenir.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {inscriptionsAVenir.map((inscription) => (
                  <InscriptionCard
                    key={inscription.id}
                    inscription={inscription}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 px-6 py-10 text-center text-gray-500">
                Aucune activité à venir.
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
                Historique
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                Activités passées
              </h2>
            </div>

            {inscriptionsPassees.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {inscriptionsPassees.map((inscription) => (
                  <InscriptionCard
                    key={inscription.id}
                    inscription={inscription}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 px-6 py-10 text-center text-gray-500">
                Aucun historique pour le moment.
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}

export default MesInscriptionsActivite;