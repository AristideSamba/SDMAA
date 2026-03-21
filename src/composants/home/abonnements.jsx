"use client";
import { useState } from "react";
import CardAbn from "./cardAbn";
import { Users } from "lucide-react";

function Abonnements() {
  const [isAnnuel, setIsAnnuel] = useState(true);

  const prix = {
    baby: 250,
    enfants: 350,
    adultes: 400,
  };

  const displayedPrix = isAnnuel
    ? prix
    : {
        baby: (prix.baby / 12).toFixed(0),
        enfants: (prix.enfants / 12).toFixed(0),
        adultes: (prix.adultes / 12).toFixed(0),
      };

  const periode = isAnnuel ? "/an" : "/mois";

  return (
    <section
      id="abonnements"
      className="py-10 px-4 sm:px-6 overflow-x-hidden scroll-mt-16 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300"
    >
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-10">

        <h3 className="text-3xl sm:text-4xl md:text-5xl mb-4 font-bold italic text-gray-700">
          NOS ABONNEMENTS
        </h3>

        <p className="text-base sm:text-lg font-medium text-gray-600">
          Nos abonnements sont pensés pour toutes les catégories d'âges.
          Atteignez vos objectifs en vous surpassant dans un cadre idéal.
        </p>

        {/* Toggle */}
        <div className="flex justify-center mt-6">

          <div
            onClick={() => setIsAnnuel(!isAnnuel)}
            className="
              relative
              w-48 sm:w-56
              h-11
              rounded-full
              bg-gray-300
              flex items-center justify-between
              px-1
              cursor-pointer
              select-none
              overflow-hidden
            "
          >

            <span
              className={`
                absolute top-1 left-1
                w-[48%]
                h-9
                rounded-full
                bg-white
                transition-transform duration-300
                ${isAnnuel ? "translate-x-full" : "translate-x-0"}
              `}
            />

            <span className="relative z-10 w-1/2 text-center text-sm sm:text-base text-gray-800">
              Mensuel
            </span>

            <span className="relative z-10 w-1/2 text-center text-sm sm:text-base text-gray-800">
              Annuel
            </span>

          </div>
        </div>

      </div>

      {/* Cards */}
      <div className="flex flex-col md:flex-row flex-wrap justify-center items-stretch gap-8 md:gap-10">

        <CardAbn
          titre="BABY TAEKWONDO"
          montant={displayedPrix.baby}
          periode={periode}
          features={[
            "3 cours par semaine",
            "Développement motricité",
            "Encadrement spécialisé",
            "Passage de ceintures",
          ]}
        />

        <CardAbn
          titre="ENFANTS / ADOS"
          montant={displayedPrix.enfants}
          periode={periode}
          features={[
            "4 cours par semaine",
            "Self-défense",
            "Préparation compétitions",
            "Passage de ceintures",
          ]}
        />

        <CardAbn
          titre="ADULTES"
          montant={displayedPrix.adultes}
          periode={periode}
          features={[
            "4 cours par semaine",
            "Self-défense",
            "Préparation physique & compétitions",
            "Passage de ceintures",
          ]}
        />

      </div>

      {/* Offre familiale */}
      <div className="mt-12 max-w-2xl mx-auto p-6 bg-background-sdmaa border border-blue-200 rounded-2xl text-center shadow-md">

        <div className="flex justify-center items-center gap-3 text-blue-700 font-semibold text-lg">
          <Users size={22} />
          Réduction familiale dès 3 enfants inscrits
        </div>

        <p className="text-blue-600 mt-2 text-sm sm:text-base">
          Une remise spéciale est appliquée automatiquement à partir de trois
          inscriptions dans une même famille.
        </p>

      </div>

    </section>
  );
}

export default Abonnements;