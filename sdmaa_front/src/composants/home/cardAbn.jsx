"use client";

import { Check, Shirt } from "lucide-react";
import { Link } from "react-router-dom";

function CardAbn({
  idAbonnement,
  nom,
  description,
  montant,
  prixAnnuel,
  prixMensuel,
  features = [],
  periode,
  disabled = false,
}) {
  const fraisInscription = 75;

  return (
    <div
      className={`
        flex w-full max-w-[340px] flex-col justify-between rounded-2xl
        border border-gray-300 bg-background-sdmaa shadow-lg
        transition-all duration-300 hover:border-gray-400 hover:shadow-2xl
        ${disabled ? "cursor-not-allowed opacity-50" : ""}
      `}
    >
      <div className="rounded-t-2xl bg-gray-700 p-4">
        <h3 className="text-center text-xl font-semibold text-white sm:text-2xl">
          {nom || "Abonnement"}
        </h3>
      </div>

      <div className="flex h-full flex-col justify-between p-6 sm:p-8">
        <div>
          <div className="mb-6 flex flex-col text-center text-3xl font-bold text-red-500 sm:text-4xl">
            {montant}€
            <span className="text-sm font-normal text-gray-500">
              {periode}
            </span>

            <p className="mt-2 text-xs italic text-gray-500">
              + {fraisInscription}€ frais d'inscription
            </p>
          </div>

          {description && (
            <p className="mb-6 text-sm leading-6 text-gray-600">
              {description}
            </p>
          )}

          {features.length > 0 && (
            <ul className="mb-6 space-y-3 text-sm text-gray-600">
              {features.map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check size={18} className="shrink-0 text-red-500" />
                  {item}
                </li>
              ))}
            </ul>
          )}

          <ul className="space-y-3 border-t border-gray-200 pt-5 text-sm text-gray-600">
            <li className="flex items-center gap-3">
              <Shirt size={18} className="shrink-0 text-red-500" />
              Dobok offert à l'inscription
            </li>
          </ul>
        </div>

        {disabled ? (
          <button
            type="button"
            disabled
            className="mt-8 w-full cursor-not-allowed rounded-full bg-gray-400 py-3 text-sm font-semibold text-white sm:text-base"
          >
            JE M'INSCRIS
          </button>
        ) : (
          <Link
            to="/inscription"
            state={{
              idAbonnement,
              nom,
              description,
              prixAnnuel,
              prixMensuel,
            }}
          >
            <button
              type="button"
              className="mt-8 w-full cursor-pointer rounded-full bg-blue-600 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 sm:text-base"
            >
              JE M'INSCRIS
            </button>
          </Link>
        )}

        {!disabled && (
          <p className="mt-2 text-center text-sm text-gray-500">
            Paiement sur place auprès du responsable
          </p>
        )}
      </div>
    </div>
  );
}

export default CardAbn;