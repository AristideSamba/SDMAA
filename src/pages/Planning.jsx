import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import HeroPages from "../composants/layouts/heroPages";
import CardPlanning from "../composants/planning/cardPlanning";
import Encart from "../composants/planning/encart";
import LegendeNiveaux from "../composants/planning/legendeNiveaux";

import Alia from "../assets/alia.jpeg";

function Planning() {

  const [filtre, setFiltre] = useState("Tous");

  const cours = [
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
      themes: [
        "Techniques de combat",
        "Sparring",
        "Condition physique"
      ],
      typeSeance: [
        "Technique",
        "Combat",
        "Préparation physique"
      ]
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
      themes: [
        "Coordination",
        "Jeux techniques"
      ],
      typeSeance: [
        "Technique",
        "Apprentissage ludique"
      ]
    },

    {
      categorie: "Ados / Adultes",
      titre: "Taekwondo Ados",
      niveau: "Intermédiaire",
      instructeurs: ["Coach Ali"],
      planning: [
        { jour: "Mardi", heure: "18h - 19h" },
        { jour: "Jeudi", heure: "18h - 19h30" }
      ],
      themes: [
        "Combat",
        "Condition physique"
      ],
      typeSeance: [
        "Technique",
        "Sparring"
      ]
    },

    {
      categorie: "Baby",
      titre: "Taekwondo Baby",
      niveau: "Intermédiaire",
      instructeurs: ["Coach Ali"],
      planning: [
        { jour: "Mardi", heure: "18h - 19h" },
        { jour: "Jeudi", heure: "18h - 19h30" }
      ],
      themes: [
        "Combat",
        "Condition physique"
      ],
      typeSeance: [
        "Technique",
        "Sparring"
      ]
    },

    {
      categorie: "Ado / Adultes",
      titre: "Compétiteurs",
      niveau: "Intermédiaire",
      instructeurs: ["Coach Ali"],
      planning: [
        { jour: "Mardi", heure: "18h - 19h" },
        { jour: "Jeudi", heure: "18h - 19h30" }
      ],
      themes: [
        "Combat",
        "Condition physique"
      ],
      typeSeance: [
        "Technique",
        "Sparring"
      ]
    }
  ];

  const coursFiltres =
    filtre === "Tous"
      ? cours
      : cours.filter((c) => c.categorie === filtre);

  return (
    <div>

      <HeroPages
        titre="NOTRE PLANNING"
        intro="Nos cours sont organisés par niveau et par âge afin de garantir un apprentissage progressif et adapté à chacun. Consultez le planning ci-dessous pour trouver le créneau qui vous convient."
        image={Alia}
      />

      {/* FILTRES */}
      <div className="flex justify-center gap-3 mt-6 flex-wrap">

        {["Tous", "Baby", "Enfants", "Ado / Adultes"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltre(cat)}
            className={`cursor-pointer px-4 py-2 rounded-4xl border text-sm transition
            ${
              filtre === cat
                ? "bg-digital-red text-white border-digital-red"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}

      </div>

      {/* CARDS */}
      <div className="flex flex-wrap justify-center gap-6 mt-8 mb-8">

        <AnimatePresence mode="wait">

          {coursFiltres.map((cours, index) => (
            <motion.div
              key={cours.titre + index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.35,
                delay: index * 0.09
              }}
            >

              <CardPlanning
                titre={cours.titre}
                niveau={cours.niveau}
                instructeurs={cours.instructeurs}
                planning={cours.planning}
                themes={cours.themes}
                typeSeance={cours.typeSeance}
              />

            </motion.div>
          ))}

        </AnimatePresence>

      </div>

      <Encart />

      <div className="mt-10">
        <LegendeNiveaux />
      </div>

    </div>
  );
}

export default Planning;