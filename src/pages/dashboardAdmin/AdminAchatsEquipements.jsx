import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  ImageIcon,
  Package,
  Search,
  User,
} from "lucide-react";

const statuts = ["TOUS", "en_attente", "paye", "refuse"];

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

function Badge({ children, variant = "default" }) {
  const styles = {
    en_attente: "bg-yellow-50 text-yellow-700",
    paye: "bg-green-50 text-green-700",
    refuse: "bg-red-50 text-red-700",
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

function AdminAchatsEquipements() {
  const pageTopRef = useRef(null);

  const [achats, setAchats] = useState([]);
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("TOUS");

  const [loading, setLoading] = useState(true);
  const [validatingId, setValidatingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiFetch = async (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  };

  const fetchAchats = async () => {
    try {
      setError("");

      const res = await apiFetch("http://localhost:8080/api/achats-equipements");
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Impossible de charger les achats.");
      }

      setAchats(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchats();
  }, []);

  useEffect(() => {
    if (error || success) {
      pageTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [error, success]);

  const filteredAchats = useMemo(() => {
    const q = search.trim().toLowerCase();

    return achats.filter((item) => {
      const statut = String(item.statutPaiement || "").toLowerCase();

      const text = `
        ${item.utilisateurNom || ""}
        ${item.utilisateurPrenom || ""}
        ${item.equipementNom || ""}
        ${item.equipementType || ""}
        ${item.modePaiement || ""}
        ${item.statutPaiement || ""}
      `.toLowerCase();

      return (
        (!q || text.includes(q)) &&
        (statutFilter === "TOUS" || statut === statutFilter)
      );
    });
  }, [achats, search, statutFilter]);

  const validerAchat = async (id) => {
    setValidatingId(id);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch(
        `http://localhost:8080/api/achats-equipements/${id}/valider`,
        {
          method: "PUT",
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Impossible de valider l’achat.");
      }

      await fetchAchats();
      setSuccess("Achat validé avec succès.");
    } catch (err) {
      setError(err.message);
    } finally {
      setValidatingId(null);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Chargement des achats...</p>;
  }

  return (
    <section ref={pageTopRef} className="space-y-8">
      <div className="rounded-[28px] border border-black/5 bg-white px-6 py-8 shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
          Administration
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Achats d’équipements
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
          Consultez les achats effectués par les adhérents et validez les
          paiements réalisés sur place.
        </p>
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
              placeholder="Rechercher un achat..."
              className="w-full rounded-2xl border border-black/10 bg-white px-11 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statuts.map((statut) => (
              <button
                key={statut}
                type="button"
                onClick={() => setStatutFilter(statut)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  statutFilter === statut
                    ? "bg-gray-950 text-white"
                    : "border border-black/10 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {statut === "TOUS" ? "Tous" : statut.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
        {filteredAchats.length > 0 ? (
          <div className="grid gap-3">
            {filteredAchats.map((item) => {
              const isPaid = item.statutPaiement === "paye";

              return (
                <article
                  key={item.id}
                  className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      {item.lienImage ? (
                        <img
                          src={item.lienImage}
                          alt={item.equipementNom}
                          className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                          <ImageIcon size={22} />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-base font-semibold text-gray-950">
                            {item.equipementNom || "Équipement"}
                          </h2>

                          <Badge variant={item.statutPaiement}>
                            {item.statutPaiement?.replace("_", " ") ||
                              "Statut inconnu"}
                          </Badge>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <User size={14} />
                            {`${item.utilisateurPrenom || ""} ${
                              item.utilisateurNom || ""
                            }`.trim() || "Utilisateur"}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <Package size={14} />
                            {item.equipementType || "Type non renseigné"}
                          </span>

                          <span>Quantité : {item.quantite}</span>

                          <span>
                            Montant :{" "}
                            <strong className="font-semibold text-gray-950">
                              {item.montantTotal} €
                            </strong>
                          </span>

                          <span>Paiement : {item.modePaiement || "—"}</span>

                          <span>Date : {formatDate(item.dateAchat)}</span>

                          <span>
                            Stock restant :{" "}
                            {item.quantiteDisponible ?? "Non renseigné"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <button
                        type="button"
                        disabled={validatingId === item.id || isPaid}
                        onClick={() => validerAchat(item.id)}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <CreditCard size={15} />
                        {isPaid ? "Déjà payé" : "Valider paiement"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 px-6 py-12 text-center text-gray-500">
            Aucun achat trouvé.
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminAchatsEquipements;