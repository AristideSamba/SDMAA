"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Users } from "lucide-react";
import CardAbn from "./cardAbn";

const getFeaturesByName = (nom = "") => {
  const value = nom.toLowerCase();

  if (value.includes("baby")) {
    return [
      "3 cours par semaine",
      "Développement de la motricité",
      "Encadrement spécialisé",
      "Passage de ceintures",
    ];
  }

  if (value.includes("enfant") || value.includes("ado")) {
    return [
      "4 cours par semaine",
      "Self-défense",
      "Préparation compétitions",
      "Passage de ceintures",
    ];
  }

  return [
    "4 cours par semaine",
    "Self-défense",
    "Préparation physique & compétitions",
    "Passage de ceintures",
  ];
};

function Abonnements() {
  const [isAnnuel, setIsAnnuel] = useState(true);
  const [abonnements, setAbonnements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAbonnements = async () => {
    try {
      setError("");

      const res = await fetch("http://localhost:8080/api/abonnements");

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message || "Impossible de charger les abonnements."
        );
      }

      setAbonnements(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbonnements();
  }, []);

  const displayedPlans = useMemo(() => {
    return abonnements.map((plan) => {
      const prixAnnuel = Number(plan.prixAnnuel || 0);
      const prixMensuel = Number(plan.prixMensuel || 0);

      return {
        ...plan,
        prixAnnuel,
        prixMensuel,
        montant: isAnnuel ? prixAnnuel : prixMensuel,
        features: getFeaturesByName(plan.nom),
      };
    });
  }, [abonnements, isAnnuel]);

  const periode = isAnnuel ? "/an" : "/mois";

  return (
    <section
      id="abonnements"
      className="relative overflow-hidden scroll-mt-20 bg-[linear-gradient(to_bottom,#f8fafc,white_30%,#f8fafc)] px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-10 h-56 w-56 rounded-full bg-red-100/40 blur-3xl" />
        <div className="absolute right-[-6rem] top-24 h-64 w-64 rounded-full bg-orange-100/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-red-600/80">
            Tarifs & formules
          </p>

          <h2 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl md:text-5xl">
            Des abonnements simples, clairs et adaptés à chaque âge
          </h2>

          <p className="mt-5 text-base leading-7 text-gray-600 sm:text-lg">
            Choisissez la formule qui correspond à votre pratique et progressez
            dans un cadre structuré, exigeant et motivant.
          </p>

          <div className="mt-8 flex justify-center">
            <div
              className="inline-flex rounded-full border border-black/5 bg-white/80 p-1 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl"
              role="tablist"
              aria-label="Choisir la période de facturation"
            >
              <button
                type="button"
                role="tab"
                aria-selected={!isAnnuel}
                onClick={() => setIsAnnuel(false)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 sm:px-6 ${
                  !isAnnuel
                    ? "bg-gray-950 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-950"
                }`}
              >
                Mensuel
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={isAnnuel}
                onClick={() => setIsAnnuel(true)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 sm:px-6 ${
                  isAnnuel
                    ? "bg-gray-950 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-950"
                }`}
              >
                Annuel
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-auto mb-8 flex max-w-3xl items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">
            Chargement des abonnements...
          </p>
        ) : displayedPlans.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
            {displayedPlans.map((plan) => (
              <CardAbn
                key={plan.idAbonnement}
                idAbonnement={plan.idAbonnement}
                nom={plan.nom}
                description={plan.description}
                montant={plan.montant}
                prixAnnuel={plan.prixAnnuel}
                prixMensuel={plan.prixMensuel}
                periode={periode}
                features={plan.features}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-black/10 bg-white/80 px-6 py-12 text-center text-gray-500">
            Aucun abonnement disponible pour le moment.
          </div>
        )}

        <div className="mx-auto mt-10 max-w-3xl">
          <div className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:p-7">
            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Users size={22} aria-hidden="true" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-950">
                  Réduction familiale dès 3 enfants inscrits
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">
                  Une remise spéciale est appliquée automatiquement à partir de
                  trois inscriptions dans une même famille.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Abonnements;