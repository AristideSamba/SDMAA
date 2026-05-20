import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  FileText,
  ShoppingCart,
  ArrowRight,
  PlayCircle,
  AlertTriangle,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardCardPlanning from "./dashboardPlanningCard";
import imgYoutube1 from "../../assets/poomse.jpg";
import imgYoutube2 from "../../assets/poomse2.jpg";

function getBeltStyle(belt) {
  const styles = {
    Blanche: {
      dot: "bg-white",
      border: "border-white/30",
      glow: "shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
    },
    Jaune: {
      dot: "bg-yellow-400",
      border: "border-yellow-400/30",
      glow: "shadow-[0_0_0_1px_rgba(250,204,21,0.14)]",
    },
    Verte: {
      dot: "bg-green-400",
      border: "border-green-400/30",
      glow: "shadow-[0_0_0_1px_rgba(74,222,128,0.14)]",
    },
    Bleue: {
      dot: "bg-blue-400",
      border: "border-blue-400/30",
      glow: "shadow-[0_0_0_1px_rgba(96,165,250,0.14)]",
    },
    Rouge: {
      dot: "bg-red-400",
      border: "border-red-400/30",
      glow: "shadow-[0_0_0_1px_rgba(248,113,113,0.14)]",
    },
    Noire: {
      dot: "bg-gray-900 ring-1 ring-white/20",
      border: "border-white/15",
      glow: "shadow-[0_0_0_1px_rgba(255,255,255,0.06)]",
    },
  };

  return (
    styles[belt] || {
      dot: "bg-gray-300",
      border: "border-white/15",
      glow: "shadow-[0_0_0_1px_rgba(255,255,255,0.06)]",
    }
  );
}

function QuickActionCard({ icon: Icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full min-w-0 max-w-full cursor-pointer items-start gap-4 rounded-3xl border border-black/5 bg-white/90 p-4 text-left shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] sm:p-5"
    >
      <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-900 sm:h-12 sm:w-12">
        <Icon size={20} aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="break-words text-sm font-semibold text-gray-950 sm:text-base">
          {title}
        </h3>
        <p className="mt-1 break-words text-sm leading-6 text-gray-500">
          {description}
        </p>
      </div>
    </button>
  );
}

function MediaCard({ image, title, description, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group relative block h-64 min-w-0 max-w-full overflow-hidden rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.15)] transition duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 via-40% to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-end p-5">
        <div className="mb-2 inline-flex items-center gap-2 text-red-500">
          <PlayCircle size={18} />
          <span className="text-sm font-semibold">YouTube</span>
        </div>

        <h3 className="text-lg font-semibold text-white sm:text-xl">
          {title}
        </h3>

        <p className="mt-1 line-clamp-2 text-sm text-gray-200">
          {description}
        </p>

        <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-white/90 group-hover:text-white">
          Voir la vidéo
          <ArrowRight size={16} />
        </div>
      </div>
    </a>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const planningRef = useRef(null);

  const [user, setUser] = useState(null);
  const [coursUtilisateur, setCoursUtilisateur] = useState([]);
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);

  const beltStyle = getBeltStyle(user?.ceintureNom);
  const prochainCours = coursUtilisateur[0]?.planning[0];

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

    const fetchDashboard = async () => {
      try {
        const [me, cours, annoncesData] = await Promise.all([
          apiFetch("http://localhost:8080/api/me"),
          apiFetch("http://localhost:8080/api/cours/me"),
          apiFetch("http://localhost:8080/api/annonces-cours/me"),
        ]);

        setUser(me);
        setAnnonces(annoncesData || []);

        setCoursUtilisateur(
          (cours || []).map((c) => ({
            titre: c.titre,
            ceinture: me?.ceintureNom || "Non renseignée",
            planning: [
              {
                jour: c.jour,
                heure: `${c.heureDebut?.slice(0, 5)} - ${c.heureFin?.slice(
                  0,
                  5
                )}`,
              },
            ],
            themes: [c.niveau || "Tous niveaux"],
            instructeurs: c.coachs?.length ? c.coachs : ["Coach à confirmer"],
            typeSeance: [c.trancheAge || "Général"],
            lieu: c.lieu,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const scrollToPlanning = () => {
    planningRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading) {
    return <p className="text-gray-500">Chargement du tableau de bord...</p>;
  }

  return (
    <section className="max-w-full space-y-6 overflow-x-hidden sm:space-y-8">
      {/* BANNIÈRE */}
      <div className="relative max-w-full overflow-visible rounded-[28px] border border-black/5 bg-gray-950 px-5 py-6 text-white shadow-[0_16px_50px_rgba(0,0,0,0.12)] sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
          <div className="absolute left-[-4rem] top-[-4rem] h-32 w-32 rounded-full bg-red-500/20 blur-3xl sm:h-40 sm:w-40" />
          <div className="absolute bottom-[-3rem] right-[-3rem] h-40 w-40 rounded-full bg-orange-400/10 blur-3xl sm:h-48 sm:w-48" />
        </div>
        

        <div className="relative flex min-w-0 flex-col gap-6 pr-14 lg:flex-row lg:items-end lg:justify-between">
            {/* NOTIFICATIONS */}
        <button
  type="button"
  onClick={() => navigate("/dashboard/notifications")}
  className="absolute inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white backdrop-blur-sm transition hover:bg-white/10 right-5 top-5"
  aria-label="Voir les notifications"
>
  <Bell size={20} />

  {annonces.length > 0 && (
    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
  )}
</button>
          <div className="min-w-0 max-w-3xl flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400 sm:text-sm">
              Tableau de bord
            </p>

            <h1 className="mt-3 break-words text-2xl font-semibold tracking-tight sm:mt-4 sm:text-4xl lg:text-5xl">
              Bienvenue, {user ? user.nomComplet : "..."}
            </h1>

            <p className="mt-3 max-w-2xl break-words text-sm leading-6 text-gray-300 sm:mt-4 sm:text-lg sm:leading-7">
              Retrouvez ici vos cours, vos ressources et les informations utiles
              liées à votre pratique au club.
            </p>

            <div className="mt-5 flex min-w-0 flex-wrap gap-2 sm:mt-6 sm:gap-3">
              <span
                className={[
                  "inline-flex max-w-full items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs font-medium text-white sm:px-4 sm:text-sm",
                  beltStyle.border,
                  beltStyle.glow,
                ].join(" ")}
              >
                <span
                  className={[
                    "h-2.5 w-2.5 shrink-0 rounded-full",
                    beltStyle.dot,
                  ].join(" ")}
                  aria-hidden="true"
                />
                <span className="text-gray-300">Ceinture :</span>
                <span className="text-white">
                  {user?.ceintureNom || "Non renseignée"}
                </span>
              </span>

              <span className="max-w-full break-all rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-gray-200 sm:px-4 sm:text-sm">
                {user?.email}
              </span>
            </div>
          </div>

         
          <div className="w-full min-w-0 max-w-full rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-5 lg:w-auto lg:max-w-[320px] lg:min-w-[280px]">
            <p className="text-sm font-medium text-gray-400">
              Prochain rendez-vous
            </p>

            <div className="mt-3 flex min-w-0 items-center gap-3">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white sm:h-11 sm:w-11">
                <CalendarDays size={20} aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-white sm:text-base">
                  {prochainCours?.jour || "Aucun cours"}
                </p>
                <p className="break-words text-sm text-gray-300">
                  {prochainCours?.heure || "Aucun horaire"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    

      {/* ACTIONS RAPIDES */}
      <div className="min-w-0">
        <div className="mb-4 sm:mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 sm:text-sm">
            Navigation rapide
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-gray-950 sm:text-2xl">
            Actions rapides
          </h2>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          <QuickActionCard
            icon={CalendarDays}
            title="Voir mon planning"
            description="Consultez vos cours et vos horaires à venir."
            onClick={scrollToPlanning}
          />

          <QuickActionCard
            icon={FileText}
            title="Mes documents"
            description="Retrouvez vos documents et informations utiles."
            onClick={() => navigate("/dashboard/document")}
          />

          <QuickActionCard
            icon={ShoppingCart}
            title="Boutique du club"
            description="Accédez aux équipements disponibles à l’achat."
            onClick={() => navigate("/dashboard/boutique")}
          />
        </div>
      </div>

      {/* RESSOURCES / YOUTUBE */}
      <div className="min-w-0">
        <div className="mb-4 sm:mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 sm:text-sm">
            Ressources
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-gray-950 sm:text-2xl">
            Contenus du club
          </h2>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <MediaCard
            image={imgYoutube1}
            title="Revoir les techniques et les poomsae"
            description="Accédez aux contenus vidéo du club pour revoir les bases, progresser et mieux préparer vos entraînements."
            href="https://www.youtube.com/"
          />

          <MediaCard
            image={imgYoutube2}
            title="Suivre la vie du club et les événements"
            description="Découvrez les stages, démonstrations, temps forts et vidéos publiées par le club sur YouTube."
            href="https://www.youtube.com/"
          />
        </div>
      </div>

      {/* PLANNING */}
      <div
        ref={planningRef}
        className="scroll-mt-6 max-w-full overflow-hidden rounded-3xl border border-black/5 bg-white/80 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-6 lg:p-8"
      >
        <div className="mb-5 sm:mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 sm:text-sm">
            Organisation
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-gray-950 sm:text-2xl">
            Votre planning
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
            Consultez les cours auxquels vous êtes actuellement inscrit.
          </p>
        </div>

        {coursUtilisateur.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 px-5 py-10 text-center text-sm text-gray-500 sm:px-6 sm:py-12 sm:text-base">
            Vous n'avez pas de cours inscrits pour le moment.
          </div>
        ) : (
          <div className="grid min-w-0 gap-4 sm:gap-6">
            {coursUtilisateur.map((cours, index) => (
              <motion.div
                key={cours.titre + index}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="min-w-0 max-w-full"
              >
                <DashboardCardPlanning cours={cours} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Dashboard;