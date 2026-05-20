"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import dobok from "../assets/dobok.jpg";
import protegeTibia from "../assets/protegeTibia.jpg";
import plastron from "../assets/plastron.jpg";

const equipements = [
  {
    id: 1,
    nom: "Dobok Enfant",
    description: "Dobok disponible pour les nouveaux adhérents.",
    image: dobok,
    quantite: 4,
    categorie: "Dobok",
    taille: "S",
    couleur: "Blanc",
  },
  {
    id: 2,
    nom: "Protège-tibias",
    description: "Protection pour entraînement et combat.",
    image: protegeTibia,
    quantite: 2,
    categorie: "Protection",
    taille: "M",
    couleur: "Noir",
  },
  {
    id: 3,
    nom: "Plastron",
    description: "Plastron pour entraînement combat.",
    image: plastron,
    quantite: 0,
    categorie: "Protection",
    taille: "L",
    couleur: "Rouge",
  },
];

const filterConfig = {
  categorie: ["Dobok", "Protection"],
  taille: ["S", "M", "L"],
  dispo: ["Disponible", "Indisponible"],
  couleur: ["Blanc", "Noir", "Rouge"],
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

function EquipmentCard({ equipement }) {
  const disponible = equipement.quantite > 0;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-white/90 shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
      <div className="relative h-44 overflow-hidden bg-gray-50">
        <img
          src={equipement.image}
          alt={equipement.nom}
          className="mx-auto h-full w-[1/2] object-cover"
        />

        <div className="absolute left-3 top-3">
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

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap gap-2">
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

        <h2 className="text-base font-semibold text-gray-950">
          {equipement.nom}
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          {equipement.description}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p
              className={[
                "text-sm font-medium",
                disponible ? "text-green-600" : "text-red-600",
              ].join(" ")}
            >
              {disponible
                ? `${equipement.quantite} disponible${
                    equipement.quantite > 1 ? "s" : ""
                  }`
                : "Indisponible"}
            </p>
          </div>

          <button
            type="button"
            disabled={!disponible}
            className={[
              "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors duration-200",
              disponible
                ? "cursor-pointer bg-gray-950 text-white hover:bg-black"
                : "cursor-not-allowed bg-gray-200 text-gray-400",
            ].join(" ")}
          >
            Demander l'emprunt
          </button>
        </div>
      </div>
    </article>
  );
}

function Emprunt() {
  const [activeFilter, setActiveFilter] = useState("categorie");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    categorie: "",
    taille: "",
    dispo: "",
    couleur: "",
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

  const equipementsFiltres = useMemo(() => {
    return equipements.filter((prod) => {
      return (
        prod.nom.toLowerCase().includes(search.toLowerCase()) &&
        (filters.categorie ? prod.categorie === filters.categorie : true) &&
        (filters.taille ? prod.taille === filters.taille : true) &&
        (filters.couleur ? prod.couleur === filters.couleur : true) &&
        (filters.dispo
          ? filters.dispo === "Disponible"
            ? prod.quantite > 0
            : prod.quantite === 0
          : true)
      );
    });
  }, [search, filters]);

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
            Emprunt d’équipements
          </motion.p>

          <motion.h1
            className="text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            Du matériel disponible pour accompagner votre pratique
          </motion.h1>

          <motion.p
            className="mt-5 text-base leading-7 text-gray-600 sm:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            Le club met à disposition certains équipements pour les adhérents
            ne disposant pas encore de leur propre matériel. Consultez les
            équipements disponibles et effectuez votre demande d’emprunt
            simplement.
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
              <EquipmentCard key={prod.id} equipement={prod} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-black/10 bg-white/70 px-6 py-14 text-center text-gray-500">
            Aucun équipement ne correspond à votre recherche.
          </div>
        )}
      </div>
    </section>
  );
}

export default Emprunt;