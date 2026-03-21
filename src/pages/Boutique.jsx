"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { ShoppingCart, Search, Filter } from "lucide-react";
import dobok from "../assets/dobok.jpg";
import protegeTibia from "../assets/protegeTibia.jpg";
import ceinture from "../assets/ceinture.jpg";
import plastron from "../assets/plastron.jpg";

const produits = [
  {
    id: 1,
    nom: "Dobok Adulte",
    description: "Dobok à col noir, adapté aux pratiquants ceinture noire",
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
    description: "Protège tibia adapté aux combats",
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
    description: "Ceinture brodée de qualité, 3M",
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
    description: "Ceinture brodée de qualité, 3M",
    prix: 15,
    image: ceinture,
    quantite: 6,
    categorie: "Ceinture",
    taille: "L",
    couleur: "Noir",
  },
  {
    id: 5,
    nom: "Plastron",
    description: "Plastron de combat pour adultes avec capteurs sensibles",
    prix: 50,
    image: plastron,
    quantite: 2,
    categorie: "Plastron",
    taille: "M",
    couleur: "Blanc",
  },
];

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
    setFilters({
      categorie: "",
      taille: "",
      dispo: "",
      couleur: "",
    });
    setSearch("");
  };

  const ajouterAuPanier = (produit) => {
    setPanier([...panier, produit]);
  };

  const produitsFiltres = produits.filter((prod) => {
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

  return (
    <section className="py-10 px-4 sm:px-10 max-w-7xl mx-auto">
      {/* Intro Boutique */}
      <div className="text-center mb-10">
        <motion.div
          className="inline-block bg-[radial-gradient(circle_at_top_left,_#800020,_#4d0015)] 
                     text-yellow-300 text-sm font-semibold px-4 py-1 rounded-full mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Boutique
        </motion.div>

        <motion.h1
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Découvrez notre boutique officielle
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
          Vous trouverez ici tout l’équipement nécessaire pour la pratique :
          <span className="font-semibold text-gray-800"> doboks, ceintures, protections et accessoires</span>.
          Tous les produits sont sélectionnés pour garantir confort, sécurité et qualité
          aux pratiquants, débutants comme confirmés.
        </motion.p>
      </div>

      {/* Filtres avec boutons */}
      <div className="bg-slate-950 p-4 text-white rounded-lg shadow-md mb-4">
        {/* Barre de recherche */}
        <div className="flex justify-center mb-2">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-white focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>
        {/* Boutons catégories de filtres */}
        <div className="flex flex-wrap gap-4 justify-center mb-4">

          {["categorie", "taille", "dispo", "couleur"].map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`px-4 py-2 rounded-full font-semibold capitalize transition cursor-pointer
        ${activeFilter === type
                  ? "bg-white text-slate-950"
                  : "text-white"
                }`}
            >
              {type === "dispo" ? "Disponibilité" : type}
            </button>
          ))}

        </div>

        {/* Options du filtre actif */}
        <div className="flex mx-auto w-[80%] flex-wrap gap-3 border rounded-md py-2 justify-center">

          {/* Catégorie */}
          {activeFilter === "categorie" &&
            ["Dobok", "Ceinture", "Protection", "Accessoire", "Plastron"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters({ ...filters, categorie: cat })}
                className={`px-3 py-1 rounded-full transition cursor-pointer
          ${filters.categorie === cat
                    ? "bg-white text-slate-950"
                    : "text-white"
                  }`}
              >
                {cat}
              </button>
            ))}

          {/* Taille */}
          {activeFilter === "taille" &&
            ["S", "M", "L", "XL"].map((taille) => (
              <button
                key={taille}
                onClick={() => setFilters({ ...filters, taille })}
                className={`px-3 py-1 rounded-full transition cursor-pointer
          ${filters.taille === taille
                    ? "bg-white text-slate-950"
                    : "text-white"
                  }`}
              >
                {taille}
              </button>
            ))}

          {/* Disponibilité */}
          {activeFilter === "dispo" &&
            ["En stock", "Rupture"].map((disp) => (
              <button
                key={disp}
                onClick={() => setFilters({ ...filters, dispo: disp })}
                className={`px-3 py-1 rounded-full transition cursor-pointer
          ${filters.dispo === disp
                    ? "bg-white text-slate-950"
                    : "text-white"
                  }`}
              >
                {disp}
              </button>
            ))}

          {/* Couleur */}
          {activeFilter === "couleur" &&
            ["Blanc", "Noir", "Rouge", "Bleu"].map((coul) => (
              <button
                key={coul}
                onClick={() => setFilters({ ...filters, couleur: coul })}
                className={`px-3 py-1 rounded-full transition cursor-pointer
          ${filters.couleur === coul
                    ? "bg-white text-slate-950"
                    : "text-white"
                  }`}
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

      {/* Grille produits 4 colonnes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {produitsFiltres.length > 0 ? (
          produitsFiltres.map((prod) => (
            <div
              key={prod.id}
              className="bg-white h-auto min-h-0 shadow-lg overflow-hidden flex flex-col"
            >
              <img
                src={prod.image}
                alt={prod.nom}
                className="w-40 h-36 object-cover mx-auto"
              />
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-semibold text-lg mb-2">{prod.nom}</h3>
                <p className="font-light mb-2">{prod.description}</p>
                <p className="font-bold text-xl mb-2">{prod.prix} €</p>
                <p className="font-light text-red-600 mb-4">
                  Il reste {prod.quantite} en stock
                </p>
                <button
                  onClick={() => ajouterAuPanier(prod)}
                  className="mt-auto bg-yellow-300 py-2 rounded-full font-normal cursor-pointer hover:bg-yellow-400 transition"
                >
                  Ajouter au panier
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            Aucun produit trouvé
          </p>
        )}
      </div>

      {/* Panier */}
      {panier.length > 0 && (
        <div className="mt-10 p-6 bg-gray-100 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ShoppingCart size={20} /> Panier ({panier.length})
          </h3>
          <ul className="space-y-2">
            {panier.map((item, index) => (
              <li key={index} className="flex justify-between">
                <span>{item.nom}</span>
                <span>{item.prix} €</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default Boutique;