import { useEffect, useState } from "react";
import {
  CalendarDays,
  Package,
  Clock3,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatDate = (date) => {
  if (!date) return "Non renseignée";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

function Badge({ children, variant = "default" }) {
  const styles = {
    yellow: "bg-yellow-50 text-yellow-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    gray: "bg-gray-100 text-gray-700",
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
    case "en_attente":
      return {
        label: "En attente",
        variant: "yellow",
      };

    case "en_cours":
      return {
        label: "Validé",
        variant: "green",
      };

    case "refuse":
      return {
        label: "Refusé",
        variant: "red",
      };

    case "retourne":
      return {
        label: "Retourné",
        variant: "gray",
      };

    default:
      return {
        label: status,
        variant: "gray",
      };
  }
}

function MesEmprunts() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "http://localhost:8080/api/emprunts-equipements/me",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.status === 401 || res.status === 403) {
          localStorage.clear();
          window.location.href = "/login";
          return;
        }

        const data = await res.json();

        setItems(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <p className="text-gray-500">
        Chargement des emprunts...
      </p>
    );
  }

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[28px] border border-black/5 bg-gray-950 px-8 py-8 text-white shadow-[0_16px_50px_rgba(0,0,0,0.12)] sm:px-10 sm:py-10">
        <div className="absolute right-8 top-8">
          <button
            type="button"
            onClick={() => navigate("/dashboard/emprunt")}
            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
          >
            <ArrowLeft size={16} />
            Retour
          </button>
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
          Équipements
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Mes emprunts
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
          Retrouvez ici vos demandes et vos équipements empruntés.
        </p>
      </div>

      <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8">
        {items.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const statusMeta = getStatusMeta(item.statutEmprunt);

              return (
                <article
                  key={item.idEmprunt}
                  className="flex flex-col rounded-3xl border border-black/5 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-950">
                        {item.equipementNom}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Quantité : {item.quantite}
                      </p>
                    </div>

                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-900">
                      <Package size={20} />
                    </div>
                  </div>

                  <div className="mt-5">
                    <Badge variant={statusMeta.variant}>
                      {statusMeta.label}
                    </Badge>
                  </div>

                  <div className="mt-5 space-y-3 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      <span>
                        Emprunt :
                        {" "}
                        {formatDate(item.dateEmprunt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock3 size={16} />
                      <span>
                        Retour prévu :
                        {" "}
                        {formatDate(item.dateRetourPrevue)}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 px-6 py-12 text-center text-gray-500">
            Vous n’avez aucun emprunt pour le moment.
          </div>
        )}
      </section>
    </section>
  );
}

export default MesEmprunts;