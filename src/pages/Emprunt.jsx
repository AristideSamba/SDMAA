"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Search } from "lucide-react";
import dobok from "../assets/dobok.jpg";
import protegeTibia from "../assets/protegeTibia.jpg";
import plastron from "../assets/plastron.jpg";

const equipements = [
  {
    id: 1,
    nom: "Dobok Enfant",
    description: "Dobok disponible pour les nouveaux adhérents",
    image: dobok,
    quantite: 4,
    categorie: "Dobok",
    taille: "S",
    couleur: "Blanc",
  },
  {
    id: 2,
    nom: "Protège-tibias",
    description: "Protection pour entraînement et combat",
    image: protegeTibia,
    quantite: 2,
    categorie: "Protection",
    taille: "M",
    couleur: "Noir",
  },
  {
    id: 3,
    nom: "Plastron",
    description: "Plastron pour entraînement combat",
    image: plastron,
    quantite: 0,
    categorie: "Protection",
    taille: "L",
    couleur: "Rouge",
  },
];

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
  };

  const equipementsFiltres = equipements.filter((prod) => {
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

  return (
    <section className="py-10 px-4 sm:px-10 max-w-7xl mx-auto">

      {/* Intro */}
      <div className="text-center mb-10">
        <motion.div
          className="inline-block bg-[radial-gradient(circle_at_top_left,_#800020,_#4d0015)] 
                     text-yellow-300 text-sm font-semibold px-4 py-1 rounded-full mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Emprunt d'équipements
        </motion.div>

        <motion.h1
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Matériel disponible au prêt
        </motion.h1>

        <motion.div
          className="w-24 h-1 bg-[radial-gradient(circle_at_top_left,_#800020,_#4d0015)] mx-auto mb-6 rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        ></motion.div>

        <motion.p
          className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Le club met à disposition certains équipements pour les adhérents
          ne disposant pas encore de leur propre matériel.
          Consultez les équipements disponibles et faites une demande
          d'emprunt directement en ligne.
        </motion.p>
      </div>

      {/* Filtres */}
      <div className="bg-slate-950 p-4 text-white rounded-lg shadow-md mb-4">

        {/* Recherche */}
        <div className="flex justify-center mb-2">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Rechercher un équipement..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-white focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>

        {/* Boutons filtres */}
        <div className="flex flex-wrap gap-4 justify-center mb-4">

          {["categorie", "taille", "dispo", "couleur"].map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`px-4 py-2 rounded-full font-semibold capitalize transition cursor-pointer
              ${activeFilter === type ? "bg-white text-slate-950" : "text-white"}
              `}
            >
              {type === "dispo" ? "Disponibilité" : type}
            </button>
          ))}

        </div>

        {/* Options filtres */}
        <div className="flex mx-auto w-[80%] flex-wrap gap-3 border rounded-md py-2 justify-center">

          {activeFilter === "categorie" &&
            ["Dobok", "Protection"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters({ ...filters, categorie: cat })}
                className={`px-3 py-1 rounded-full cursor-pointer
                ${filters.categorie === cat ? "bg-white text-slate-950" : "text-white"}
                `}
              >
                {cat}
              </button>
            ))}

          {activeFilter === "taille" &&
            ["S", "M", "L"].map((taille) => (
              <button
                key={taille}
                onClick={() => setFilters({ ...filters, taille })}
                className={`px-3 py-1 rounded-full cursor-pointer
                ${filters.taille === taille ? "bg-white text-slate-950" : "text-white"}
                `}
              >
                {taille}
              </button>
            ))}

          {activeFilter === "dispo" &&
            ["Disponible", "Indisponible"].map((disp) => (
              <button
                key={disp}
                onClick={() => setFilters({ ...filters, dispo: disp })}
                className={`px-3 py-1 rounded-full cursor-pointer
                ${filters.dispo === disp ? "bg-white text-slate-950" : "text-white"}
                `}
              >
                {disp}
              </button>
            ))}

          {activeFilter === "couleur" &&
            ["Blanc", "Noir", "Rouge"].map((coul) => (
              <button
                key={coul}
                onClick={() => setFilters({ ...filters, couleur: coul })}
                className={`px-3 py-1 rounded-full cursor-pointer
                ${filters.couleur === coul ? "bg-white text-slate-950" : "text-white"}
                `}
              >
                {coul}
              </button>
            ))}

        </div>

        <div className="flex justify-end">
          <button
            onClick={resetFilters}
            className="text-white font-light underline cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>

      </div>

      {/* Grille équipements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

        {equipementsFiltres.map((prod) => (
          <div
            key={prod.id}
            className="bg-white shadow-lg overflow-hidden flex flex-col"
          >

            <img
              src={prod.image}
              alt={prod.nom}
              className="w-40 h-36 object-cover mx-auto"
            />

            <div className="p-6 flex flex-col flex-1">

              <h3 className="font-semibold text-lg mb-2">{prod.nom}</h3>

              <p className="font-light mb-3">{prod.description}</p>

              <p className={`font-semibold mb-4
                ${prod.quantite > 0 ? "text-green-600" : "text-red-600"}
              `}>
                {prod.quantite > 0
                  ? `${prod.quantite} disponible(s)`
                  : "Indisponible"}
              </p>

              <button
                disabled={prod.quantite === 0}
                className={`mt-auto py-2 rounded-full
                ${prod.quantite > 0
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"}
                `}
              >
                Demander l'emprunt
              </button>

            </div>
          </div>
        ))}

      </div>

    </section>
  );
}

export default Emprunt;