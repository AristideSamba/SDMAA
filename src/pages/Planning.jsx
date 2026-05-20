import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

import HeroPages from "../composants/layouts/heroPages";
import CardPlanning from "../composants/planning/cardPlanning";
import Encart from "../composants/planning/encart";

import Alia from "../assets/alia.jpeg";

// ✅ DRY : constantes en dehors du composant
const CATEGORIES = ["Tous", "Baby", "Enfants", "Ado / Adultes"];

const COURS = [
  {
    categorie: "Ado / Adultes",
    titre: "Taekwondo Adultes",
    niveau: "Intermédiaire",
    instructeurs: ["Maître Kim", "Coach Ali"],
    planning: [
      { jour: "Lundi", heure: "19h - 20h30" },
      { jour: "Mercredi", heure: "19h - 20h30" },
      { jour: "Vendredi", heure: "18h30 - 20h" }
    ],
    themes: ["Techniques de combat", "Sparring", "Condition physique"],
    typeSeance: ["Technique", "Combat", "Préparation physique"]
  },
  {
    categorie: "Enfants",
    titre: "Taekwondo Enfants",
    niveau: "Débutant",
    instructeurs: ["Coach Sarah"],
    planning: [
      { jour: "Mercredi", heure: "14h - 15h" },
      { jour: "Samedi", heure: "10h - 11h" }
    ],
    themes: ["Coordination", "Jeux techniques"],
    typeSeance: ["Technique", "Apprentissage ludique"]
  },
  {
    categorie: "Ado / Adultes",
    titre: "Taekwondo Ados",
    niveau: "Intermédiaire",
    instructeurs: ["Coach Ali"],
    planning: [
      { jour: "Mardi", heure: "18h - 19h" },
      { jour: "Jeudi", heure: "18h - 19h30" }
    ],
    themes: ["Combat", "Condition physique"],
    typeSeance: ["Technique", "Sparring"]
  }
];

function Planning() {

  const [filtre, setFiltre] = useState("Tous");

  // ✅ useMemo = optimisation + DRY
  const coursFiltres = useMemo(() => {
    return filtre === "Tous"
      ? COURS
      : COURS.filter((c) => c.categorie === filtre);
  }, [filtre]);

  return (
    <div>

      <HeroPages
        titre="NOTRE PLANNING"
        intro="Nos cours sont organisés par niveau et par âge afin de garantir un apprentissage progressif et adapté à chacun."
        image={Alia}
      />

      {/* ✅ FILTRES ACCESSIBLES */}
      <div
        className="flex justify-center gap-3 mt-6 flex-wrap"
        role="group"
        aria-label="Filtrer les cours"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltre(cat)}
            aria-pressed={filtre === cat}
            className={`cursor-pointer px-4 py-2 rounded-full border text-sm transition
            ${
              filtre === cat
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ✅ LISTE DES COURS */}
      <div className="w-full px-6 mt-8 mb-8">

        <AnimatePresence mode="wait">

          {coursFiltres.length > 0 ? (
            coursFiltres.map((cours, index) => (
              <motion.div
                key={cours.titre}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.08
                }}
                className="mb-6"
              >
                <CardPlanning {...cours} />
              </motion.div>
            ))
          ) : (
            // ✅ CAS VIDE
            <motion.p
              className="text-center text-gray-500 mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Aucun cours disponible pour cette catégorie.
            </motion.p>
          )}

        </AnimatePresence>

      </div>

      <Encart />


    </div>
  );
}

export default Planning;