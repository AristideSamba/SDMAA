import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  AlertTriangle,
  CalendarDays,
  MapPin,
  ArrowLeft,
} from "lucide-react";

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const isPastDate = (date) => {
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  return targetDate < today;
};

function Notifications() {
  const navigate = useNavigate();

  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/annonces-cours/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("idUtilisateur");
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Impossible de charger les notifications.");
        }

        const data = await res.json();
        setAnnonces(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [navigate]);

  const annoncesVisibles = useMemo(() => {
    return annonces.filter((annonce) => !isPastDate(annonce.dateConcernee));
  }, [annonces]);

  if (loading) {
    return <p className="text-gray-500">Chargement des notifications...</p>;
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
            onClick={() => navigate("/dashboard")}
            className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-300 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Retour au tableau de bord
          </button>

          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
            Notifications
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      )}

      {annoncesVisibles.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/10 bg-white/80 px-6 py-12 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gray-100 text-gray-700">
            <Bell size={24} />
          </div>

          <p className="font-semibold text-gray-950">Aucune notification</p>

          <p className="mt-2 text-sm text-gray-500">
            Vous n’avez aucune annonce liée à vos cours pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {annoncesVisibles.map((annonce) => (
            <article
              key={annonce.idAnnonce}
              className="rounded-3xl border border-black/5 bg-white/90 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-start gap-4">
                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-700">
                  <AlertTriangle size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700">
                      {annonce.typeAnnonce}
                    </span>

                    <span className="text-sm text-gray-400">
                      {annonce.jourConcerne} {formatDate(annonce.dateConcernee)}
                    </span>
                  </div>

                  <h2 className="mt-3 text-lg font-semibold text-gray-950">
                    {annonce.coursTitre || "Cours concerné"}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {annonce.message}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
                    {annonce.coursJourHabituel && (
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays size={15} />
                        {annonce.coursJourHabituel}
                      </span>
                    )}

                    {annonce.coursLieu && (
                      <span className="inline-flex items-center gap-2">
                        <MapPin size={15} />
                        {annonce.coursLieu}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Notifications;