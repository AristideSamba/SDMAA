import { useEffect, useMemo, useState} from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Package,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const filterConfig = {
  categorie: ["Dobok", "Protection", "Ceinture", "Plastron", "Accessoire"],
  taille: ["S", "M", "L", "XL"],
  dispo: ["Disponible", "Indisponible"],
  couleur: ["Blanc", "Noir", "Rouge", "Bleu"],
};

const getImageUrl = (image) => {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  return `http://localhost:8080${image}`;
};

const normalizeEquipement = (item) => ({
  id: item.idEquipement || item.id,
  nom: item.nom || item.libelle || "Équipement",
  description: item.description || "",
  image: getImageUrl(item.lienImage || item.image || ""),
  quantite:
    item.quantiteDisponible ?? item.quantiteStock ?? item.quantite ?? item.stock ?? 0,
  categorie: item.categorie || "Accessoire",
  taille: item.taille || "N/A",
  couleur: item.couleur || "N/A",
  empruntable: item.empruntable ?? item.disponibleEmprunt ?? true,
});

function FilterChip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
        active
          ? "bg-gray-950 text-white shadow-sm"
          : "border border-black/10 bg-white text-gray-700 hover:bg-gray-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function EquipmentCard({ equipement, onBorrow, loadingId }) {
  const disponible = Number(equipement.quantite) > 0 && equipement.empruntable;
  const loading = loadingId === equipement.id;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-white/90 shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {equipement.image ? (
          <img
            src={equipement.image}
            alt={equipement.nom}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <Package size={42} />
          </div>
        )}

        <div className="absolute left-4 top-4">
          <span
            className={[
              "rounded-full px-3 py-1 text-xs font-semibold",
              disponible
                ? "bg-white/90 text-gray-900"
                : "bg-gray-900/90 text-white",
            ].join(" ")}
          >
            {disponible ? "Disponible" : "Indisponible"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
            {equipement.categorie}
          </span>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
            Taille {equipement.taille}
          </span>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
            {equipement.couleur}
          </span>
        </div>

        <h2 className="text-lg font-semibold text-gray-950">
          {equipement.nom}
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          {equipement.description || "Aucune description disponible."}
        </p>

        <div className="mt-auto pt-5">
          <p
            className={[
              "mb-5 text-sm font-medium",
              disponible ? "text-green-600" : "text-red-600",
            ].join(" ")}
          >
            {disponible
              ? `${equipement.quantite} disponible${
                  Number(equipement.quantite) > 1 ? "s" : ""
                }`
              : "Indisponible"}
          </p>

          <button
            type="button"
            onClick={() => onBorrow(equipement)}
            disabled={!disponible || loading}
            className={[
              "inline-flex w-full items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors duration-200",
              disponible && !loading
                ? "cursor-pointer bg-gray-950 text-white hover:bg-black"
                : "cursor-not-allowed bg-gray-200 text-gray-400",
            ].join(" ")}
          >
            {loading ? "Envoi..." : "Demander l’emprunt"}
          </button>
        </div>
      </div>
    </article>
  );
}

function EmpruntEquipement() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("categorie");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    categorie: "",
    taille: "",
    dispo: "",
    couleur: "",
  });

  const [equipements, setEquipements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedEquipement, setSelectedEquipement] = useState(null);
  const [borrowForm, setBorrowForm] = useState({
    quantite: 1,
    dateRetourPrevue: "",
  });

  const resetFilters = () => {
    setFilters({
      categorie: "",
      taille: "",
      dispo: "",
      couleur: "",
    });
    setSearch("");
    setActiveFilter("categorie");
  };

  const fetchEquipements = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/equipements", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("idUtilisateur");
        window.location.href = "/connexion";
        return;
      }

      if (!res.ok) {
        throw new Error("Impossible de charger les équipements.");
      }

      const data = await res.json();

      setEquipements(
        (data || [])
          .map(normalizeEquipement)
          .filter((item) => item.empruntable)
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipements();
  }, []);

  const ouvrirDemande = (equipement) => {
    setSelectedEquipement(equipement);
    setBorrowForm({
      quantite: 1,
      dateRetourPrevue: "",
    });
    setError("");
    setSuccess("");
  };

  const fermerDemande = () => {
    setSelectedEquipement(null);
    setBorrowForm({
      quantite: 1,
      dateRetourPrevue: "",
    });
  };

  const demanderEmprunt = async () => {
    console.log("CLICK ENVOYER", selectedEquipement, borrowForm);
    if (!selectedEquipement) return;

    const quantite = Number(borrowForm.quantite);

    if (!quantite || quantite <= 0) {
      setError("La quantité doit être supérieure à 0.");
      return;
    }

    if (quantite > Number(selectedEquipement.quantite)) {
      setError("La quantité demandée dépasse le stock disponible.");
      return;
    }

    if (!borrowForm.dateRetourPrevue) {
      setError("La date de retour prévue est obligatoire.");
      return;
    }

    setLoadingId(selectedEquipement.id);
    setError("");
    setSuccess("");

    try {
      const params = new URLSearchParams({
        idEquipement: String(selectedEquipement.id),
        quantite: String(quantite),
        dateRetourPrevue: borrowForm.dateRetourPrevue,
      });

      const res = await fetch(
        `http://localhost:8080/api/emprunts-equipements/me?${params.toString()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json().catch(() => null);

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("idUtilisateur");
        window.location.href = "/connexion";
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Erreur lors de la demande d’emprunt.");
      }

      setSuccess("Votre demande d’emprunt a été envoyée au responsable.");
      fermerDemande();
      await fetchEquipements();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const equipementsFiltres = useMemo(() => {
    return equipements.filter((prod) => {
      return (
        prod.nom.toLowerCase().includes(search.toLowerCase()) &&
        (filters.categorie ? prod.categorie === filters.categorie : true) &&
        (filters.taille ? prod.taille === filters.taille : true) &&
        (filters.couleur ? prod.couleur === filters.couleur : true) &&
        (filters.dispo
          ? filters.dispo === "Disponible"
            ? Number(prod.quantite) > 0
            : Number(prod.quantite) === 0
          : true)
      );
    });
  }, [equipements, search, filters]);

  if (loading) {
    return <p className="text-gray-500">Chargement des équipements...</p>;
  }

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[28px] border border-black/5 bg-gray-950 px-6 py-8 text-white shadow-[0_16px_50px_rgba(0,0,0,0.12)] sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-4rem] top-[-4rem] h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />
          <div className="absolute bottom-[-3rem] right-[-3rem] h-48 w-48 rounded-full bg-orange-400/10 blur-3xl" />
        </div>

        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
            Équipements
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Emprunt équipements
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
            Demandez un emprunt de matériel disponible au club. Votre demande
            sera ensuite validée par un responsable.
          </p>
        </div>
        <div className="absolute right-8 top-8">
  <button
    type="button"
    onClick={() => navigate("/dashboard/emprunt/mes-emprunts")}
    className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
  >
    Mes emprunts
  </button>
</div>
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

      <div className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="search"
                placeholder="Rechercher un équipement..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-11 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-500">
              <SlidersHorizontal size={16} aria-hidden="true" />
              <span>Affinez votre recherche</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.keys(filterConfig).map((type) => (
              <FilterChip
                key={type}
                active={activeFilter === type}
                onClick={() => setActiveFilter(type)}
              >
                {type === "dispo"
                  ? "Disponibilité"
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </FilterChip>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {filterConfig[activeFilter].map((value) => {
              const isActive = filters[activeFilter] === value;

              return (
                <FilterChip
                  key={value}
                  active={isActive}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      [activeFilter]: isActive ? "" : value,
                    }))
                  }
                >
                  {value}
                </FilterChip>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <p className="text-sm text-gray-500">
              {equipementsFiltres.length} équipement
              {equipementsFiltres.length > 1 ? "s" : ""} trouvé
              {equipementsFiltres.length > 1 ? "s" : ""}
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="cursor-pointer text-sm font-medium text-gray-600 underline underline-offset-4 transition hover:text-gray-950"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>

      {equipementsFiltres.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {equipementsFiltres.map((prod) => (
            <EquipmentCard
              key={prod.id}
              equipement={prod}
              onBorrow={ouvrirDemande}
              loadingId={loadingId}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-black/10 bg-white/70 px-6 py-14 text-center text-gray-500">
          Aucun équipement ne correspond à votre recherche.
        </div>
      )}

      {selectedEquipement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold text-gray-950">
              Demande d’emprunt
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {selectedEquipement.nom}
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Quantité
                </label>

                <input
                  type="number"
                  min="1"
                  max={selectedEquipement.quantite}
                  value={borrowForm.quantite}
                  onChange={(e) =>
                    setBorrowForm((prev) => ({
                      ...prev,
                      quantite: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-950/10"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Stock disponible : {selectedEquipement.quantite}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Date retour prévue
                </label>

                <input
                  type="date"
                  value={borrowForm.dateRetourPrevue}
                  onChange={(e) =>
                    setBorrowForm((prev) => ({
                      ...prev,
                      dateRetourPrevue: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-950/10"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={fermerDemande}
                className="cursor-pointer rounded-2xl border border-black/10 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={demanderEmprunt}
                disabled={loadingId === selectedEquipement.id}
                className="cursor-pointer rounded-2xl bg-gray-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingId === selectedEquipement.id ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default EmpruntEquipement;