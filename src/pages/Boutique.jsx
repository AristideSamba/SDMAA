"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ShoppingCart, Search, SlidersHorizontal } from "lucide-react";

import dobok from "../assets/dobok.jpg";
import protegeTibia from "../assets/protegeTibia.jpg";
import ceinture from "../assets/ceinture.jpg";
import plastron from "../assets/plastron.jpg";

const produits = [
  {
    id: 1,
    nom: "Dobok Adulte",
    description: "Dobok à col noir, adapté aux pratiquants ceinture noire.",
    prix: 50,
    image: dobok,
    quantite: 3,
    categorie: "Dobok",
    taille: "M",
    couleur: "Blanc",
  },
  {
    id: 2,
    nom: "Protège-tibias",
    description: "Protection adaptée aux entraînements et combats.",
    prix: 20,
    image: protegeTibia,
    quantite: 0,
    categorie: "Protection",
    taille: "L",
    couleur: "Noir",
  },
  {
    id: 3,
    nom: "Ceinture Noire",
    description: "Ceinture brodée de qualité, 3M.",
    prix: 15,
    image: ceinture,
    quantite: 6,
    categorie: "Ceinture",
    taille: "L",
    couleur: "Noir",
  },
  {
    id: 4,
    nom: "Ceinture Blanche",
    description: "Ceinture brodée de qualité, 3M.",
    prix: 15,
    image: ceinture,
    quantite: 6,
    categorie: "Ceinture",
    taille: "L",
    couleur: "Blanc",
  },
  {
    id: 5,
    nom: "Plastron",
    description: "Plastron de combat pour adultes avec capteurs sensibles.",
    prix: 50,
    image: plastron,
    quantite: 2,
    categorie: "Plastron",
    taille: "M",
    couleur: "Blanc",
  },
];

const filterConfig = {
  categorie: ["Dobok", "Ceinture", "Protection", "Accessoire", "Plastron"],
  taille: ["S", "M", "L", "XL"],
  dispo: ["En stock", "Rupture"],
  couleur: ["Blanc", "Noir", "Rouge", "Bleu"],
};

function FilterChip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
        active
          ? "bg-gray-950 text-white shadow-sm"
          : "bg-white text-gray-700 hover:bg-gray-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ProductCard({ produit, onAdd }) {
  const enStock = produit.quantite > 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-white/90 shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        <img
          src={produit.image}
          alt={produit.nom}
          className="h-full w-full object-cover"
        />

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

        <h2 className="text-lg font-semibold text-gray-950">
          {produit.nom}
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          {produit.description}
        </p>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold tracking-tight text-gray-950">
              {produit.prix} €
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {enStock
                ? `${produit.quantite} disponible${produit.quantite > 1 ? "s" : ""}`
                : "Indisponible"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onAdd(produit)}
            disabled={!enStock}
            className={[
              "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors duration-200",
              enStock
                ? "cursor-pointer bg-gray-950 text-white hover:bg-black"
                : "cursor-not-allowed bg-gray-200 text-gray-400",
            ].join(" ")}
          >
            Ajouter
          </button>
        </div>
      </div>
    </article>
  );
}

function Boutique() {
  const [activeFilter, setActiveFilter] = useState("categorie");
  const [panier, setPanier] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    categorie: "",
    taille: "",
    dispo: "",
    couleur: "",
  });

  const resetFilters = () => {
    setFilters({ categorie: "", taille: "", dispo: "", couleur: "" });
    setSearch("");
    setActiveFilter("categorie");
  };

  const ajouterAuPanier = (produit) => {
    if (produit.quantite > 0) {
      setPanier((prev) => [...prev, produit]);
    }
  };

  const retirerDuPanier = (indexToRemove) => {
    setPanier((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const validerCommande = () => {
    console.log("Commande envoyée au responsable :", panier);
    alert("Commande validée. Paiement à effectuer sur place auprès du responsable.");
    setPanier([]);
  };

  const produitsFiltres = useMemo(() => {
    return produits.filter((prod) => {
      return (
        prod.nom.toLowerCase().includes(search.toLowerCase()) &&
        (filters.categorie ? prod.categorie === filters.categorie : true) &&
        (filters.taille ? prod.taille === filters.taille : true) &&
        (filters.couleur ? prod.couleur === filters.couleur : true) &&
        (filters.dispo
          ? filters.dispo === "En stock"
            ? prod.quantite > 0
            : prod.quantite === 0
          : true)
      );
    });
  }, [search, filters]);

  const totalPanier = panier.reduce((sum, item) => sum + item.prix, 0);

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(to_bottom,#f8fafc,white_28%,#f8fafc)] px-4 py-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-7rem] top-16 h-56 w-56 rounded-full bg-red-100/40 blur-3xl" />
        <div className="absolute right-[-5rem] top-32 h-64 w-64 rounded-full bg-orange-100/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <motion.p
            className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-red-600/80"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Boutique officielle
          </motion.p>

          <motion.h1
            className="text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            Équipez-vous avec l’essentiel pour votre pratique
          </motion.h1>

          <motion.p
            className="mt-5 text-base leading-7 text-gray-600 sm:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            Retrouvez une sélection d’équipements utiles à l’entraînement :
            doboks, ceintures, protections et accessoires choisis pour leur
            confort, leur fiabilité et leur qualité.
          </motion.p>
        </div>

        <div className="mb-10 rounded-3xl border border-black/5 bg-white/80 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:p-6">
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
                {produitsFiltres.length} produit{produitsFiltres.length > 1 ? "s" : ""} trouvé{produitsFiltres.length > 1 ? "s" : ""}
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

          <aside className="h-fit rounded-3xl border border-black/5 bg-white/85 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] backdrop-blur-xl lg:sticky lg:top-24">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-900">
                <ShoppingCart size={20} aria-hidden="true" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-950">
                  Panier
                </h2>
                <p className="text-sm text-gray-500">
                  {panier.length} article{panier.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {panier.length > 0 ? (
              <>
                <ul className="mt-6 space-y-3">
                  {panier.map((item, index) => (
                    <li
                      key={`${item.id}-${index}`}
                      className="flex items-start justify-between gap-3 rounded-2xl bg-gray-50 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.nom}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.prix} €
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => retirerDuPanier(index)}
                        className="cursor-pointer text-sm text-gray-500 transition hover:text-gray-900"
                      >
                        Retirer
                      </button>
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
                    className="mt-5 inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
                  >
                    Valider la commande
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
      </div>
    </section>
  );
}

export default Boutique;