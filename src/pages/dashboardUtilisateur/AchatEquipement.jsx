import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Search,
  SlidersHorizontal,
  AlertCircle,
  CheckCircle2,
  Package,
} from "lucide-react";

const filterConfig = {
  categorie: ["Dobok", "Ceinture", "Protection", "Accessoire", "Plastron"],
  taille: ["S", "M", "L", "XL"],
  dispo: ["En stock", "Rupture"],
  couleur: ["Blanc", "Noir", "Rouge", "Bleu"],
};

const normalizeEquipement = (item) => ({
  id: item.idEquipement || item.id,
  nom: item.nom || item.libelle || "Équipement",
  description: item.description || "",
  prix: item.prix ?? item.prixAchat ?? 0,
  image: item.lienImage || item.image || "",
  quantite: item.quantiteDisponible ?? item.quantite ?? item.stock ?? 0,
  categorie: item.categorie || "Accessoire",
  taille: item.taille || "N/A",
  couleur: item.couleur || "N/A",
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

function ProductCard({ produit, onAdd }) {
  const enStock = Number(produit.quantite) > 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-white/90 shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {produit.image ? (
          <img
            src={produit.image}
            alt={produit.nom}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
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
              enStock
                ? "bg-white/90 text-gray-900"
                : "bg-gray-900/90 text-white",
            ].join(" ")}
          >
            {enStock ? "En stock" : "Rupture"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
            {produit.categorie}
          </span>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
            Taille {produit.taille}
          </span>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
            {produit.couleur}
          </span>
        </div>

        <h2 className="text-lg font-semibold text-gray-950">{produit.nom}</h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          {produit.description || "Aucune description disponible."}
        </p>

        <div className="mt-auto pt-5">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-2xl font-semibold tracking-tight text-gray-950">
                {produit.prix} €
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {enStock
                  ? `${produit.quantite} disponible${
                      Number(produit.quantite) > 1 ? "s" : ""
                    }`
                  : "Indisponible"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onAdd(produit)}
            disabled={!enStock}
            className={[
              "inline-flex w-full items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors duration-200",
              enStock
                ? "cursor-pointer bg-gray-950 text-white hover:bg-black"
                : "cursor-not-allowed bg-gray-200 text-gray-400",
            ].join(" ")}
          >
            Ajouter au panier
          </button>
        </div>
      </div>
    </article>
  );
}

function AchatEquipement() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("categorie");
  const [panier, setPanier] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    categorie: "",
    taille: "",
    dispo: "",
    couleur: "",
  });

  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCommande, setLoadingCommande] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetFilters = () => {
    setFilters({ categorie: "", taille: "", dispo: "", couleur: "" });
    setSearch("");
    setActiveFilter("categorie");
  };

  const ajouterAuPanier = (produit) => {
    if (Number(produit.quantite) <= 0) return;

    setPanier((prev) => {
      const existing = prev.find((item) => item.id === produit.id);

      if (existing) {
        if (existing.quantitePanier >= produit.quantite) return prev;

        return prev.map((item) =>
          item.id === produit.id
            ? { ...item, quantitePanier: item.quantitePanier + 1 }
            : item
        );
      }

      return [...prev, { ...produit, quantitePanier: 1 }];
    });

    setSuccess("");
    setError("");
  };

  const retirerDuPanier = (id) => {
    setPanier((prev) => prev.filter((item) => item.id !== id));
  };

  const decrementerQuantite = (id) => {
    setPanier((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantitePanier: item.quantitePanier - 1 }
            : item
        )
        .filter((item) => item.quantitePanier > 0)
    );
  };

  const incrementerQuantite = (id) => {
    setPanier((prev) =>
      prev.map((item) =>
        item.id === id && item.quantitePanier < item.quantite
          ? { ...item, quantitePanier: item.quantitePanier + 1 }
          : item
      )
    );
  };

  const validerCommande = async () => {
    if (panier.length === 0) return;

    setLoadingCommande(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      for (const item of panier) {
        const res = await fetch(
  `http://localhost:8080/api/achats-equipements/me?idEquipement=${item.id}&quantite=${item.quantitePanier}`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
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
          throw new Error(data?.message || "Erreur lors de la commande.");
        }
      }

      setPanier([]);
      setSuccess(
        "Commande validée. Paiement à effectuer sur place auprès du responsable."
      );

      await fetchProduits();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCommande(false);
    }
  };

  const fetchProduits = async () => {
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
      setProduits((data || []).map(normalizeEquipement));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  const produitsFiltres = useMemo(() => {
    return produits.filter((prod) => {
      return (
        prod.nom.toLowerCase().includes(search.toLowerCase()) &&
        (filters.categorie ? prod.categorie === filters.categorie : true) &&
        (filters.taille ? prod.taille === filters.taille : true) &&
        (filters.couleur ? prod.couleur === filters.couleur : true) &&
        (filters.dispo
          ? filters.dispo === "En stock"
            ? Number(prod.quantite) > 0
            : Number(prod.quantite) === 0
          : true)
      );
    });
  }, [produits, search, filters]);

  const totalPanier = panier.reduce(
    (sum, item) => sum + Number(item.prix) * item.quantitePanier,
    0
  );

  if (loading) {
    return <p className="text-gray-500">Chargement de la boutique...</p>;
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
            Achat équipements
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
            Commandez vos équipements depuis votre espace adhérent. Le paiement
            s’effectue sur place auprès du responsable.
          </p>
        </div>
        <button
  type="button"
  onClick={() => navigate("/dashboard/boutique/mes-achats")}
  className="absolute right-5 top-5 z-20 inline-flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/10 sm:right-8 sm:top-8"
>
  Mes achats
</button>
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
                placeholder="Rechercher un produit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-11 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-500">
              <SlidersHorizontal size={16} />
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
              {produitsFiltres.length} produit
              {produitsFiltres.length > 1 ? "s" : ""} trouvé
              {produitsFiltres.length > 1 ? "s" : ""}
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

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          {produitsFiltres.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {produitsFiltres.map((prod) => (
                <ProductCard
                  key={prod.id}
                  produit={prod}
                  onAdd={ajouterAuPanier}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-black/10 bg-white/70 px-6 py-14 text-center text-gray-500">
              Aucun produit ne correspond à votre recherche.
            </div>
          )}
        </div>

        <aside className="h-fit rounded-3xl border border-black/5 bg-white/85 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-900">
              <ShoppingCart size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-950">Panier</h2>
              <p className="text-sm text-gray-500">
                {panier.length} article{panier.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {panier.length > 0 ? (
            <>
              <ul className="mt-6 space-y-3">
                {panier.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-2xl bg-gray-50 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.nom}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.prix} € x {item.quantitePanier}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => retirerDuPanier(item.id)}
                        className="cursor-pointer text-sm text-gray-500 transition hover:text-gray-900"
                      >
                        Retirer
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => decrementerQuantite(item.id)}
                        className="h-8 w-8 rounded-xl border border-black/10 bg-white text-gray-700"
                      >
                        -
                      </button>

                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantitePanier}
                      </span>

                      <button
                        type="button"
                        onClick={() => incrementerQuantite(item.id)}
                        className="h-8 w-8 rounded-xl border border-black/10 bg-white text-gray-700"
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-black/5 pt-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Total</span>
                  <span className="text-lg font-semibold text-gray-950">
                    {totalPanier} €
                  </span>
                </div>

                <button
                  type="button"
                  onClick={validerCommande}
                  disabled={loadingCommande}
                  className="mt-5 inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingCommande ? "Validation..." : "Valider la commande"}
                </button>

                <p className="mt-3 text-center text-xs leading-5 text-gray-500">
                  Paiement sur place auprès du responsable.
                </p>
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
              Votre panier est vide pour le moment.
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

export default AchatEquipement;