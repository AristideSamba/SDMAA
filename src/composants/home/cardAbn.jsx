"use client";
import { Check, Shirt } from "lucide-react";

function CardAbn({ titre, montant, features = [], periode }) {
  return (
    <div
      className="
        flex flex-col
        justify-between
        rounded-2xl
        border border-gray-300
        bg-background-sdmaa
        shadow-lg
        transition-all duration-300
        hover:shadow-2xl
        hover:border-gray-400

        w-full
        max-w-[340px]
      "
    >
      {/* Titre */}
      <div className="bg-gray-700 p-4 rounded-t-2xl">
        <h3 className="text-xl sm:text-2xl text-center text-white font-semibold">
          {titre}
        </h3>
      </div>

      <div className="p-6 sm:p-8 flex flex-col justify-between h-full">
        <div>
          {/* Prix */}
          <div className="text-3xl sm:text-4xl font-bold text-red-500 mb-6 text-center">
            {montant}€
            <span className="text-sm font-normal text-gray-500"> {periode}</span>
          </div>

          {/* Avantages */}
          <ul className="space-y-3 text-sm text-gray-600 mb-6">
            {features.map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <Check size={18} className="text-red-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          {/* Avantage club */}
          <ul className="space-y-3 text-sm text-gray-600 border-t border-gray-200 pt-5">
            <li className="flex items-center gap-3">
              <Shirt size={18} className="text-red-500 flex-shrink-0" />
              Dobok offert à l'inscription
            </li>
          </ul>
        </div>

        {/* Bouton */}
        <button
          className="
            mt-8
            py-3
            rounded-full
            bg-blue-600
            text-white
            font-semibold
            transition-all duration-300
            hover:bg-blue-700
            cursor-pointer
            text-sm sm:text-base
          "
        >
          JE CHOISIS CET ABONNEMENT
        </button>
      </div>
    </div>
  );
}

export default CardAbn;