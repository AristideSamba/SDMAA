"use client";

import { useState } from "react";
import { CalendarDays, MapPin, Clock3, ExternalLink, X } from "lucide-react";
import imgpoomse from "../../assets/poomse.jpg";
import imgpoomse2 from "../../assets/poomse2.jpg";

/* ================= DATA ================= */
const infos = [
  {
    id: 1,
    titre: "Stage de poomsae",
    description: "Stage de perfectionnement avec le Grand Maître Shin-Sul.",
    image: imgpoomse,
    date: "2026-07-25",
    lieu: "Paris",
    type: "external",
    prix: 25,
    duree: "3 jours",
    lien: "https://google.com",
  },
  {
    id: 2,
    titre: "Entraînement club",
    description: "Session technique et combat.",
    image: imgpoomse2,
    date: "2026-03-10",
    lieu: "Dojo",
    type: "club",
    prix: 0,
    duree: "1 jour",
  },
];

/* ================= UTILS ================= */
const isPast = (date) => new Date(date) < new Date();

const formatDate = (date) => {
  return new Date(date)
    .toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .replace(/^./, (c) => c.toUpperCase());
};

/* ================= UI ================= */
function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    dark: "bg-gray-950 text-white",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    muted: "bg-gray-200 text-gray-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

/* ================= CARD ================= */
function ActiviteCard({ act, onOpen }) {
  const past = isPast(act.date);

  return (
    <article className="overflow-hidden rounded-3xl border border-black/5 bg-white/90 shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
      <div className="grid h-full md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="h-52 md:h-full">
          <img
            src={act.image}
            alt={act.titre}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant={act.type === "external" ? "blue" : "green"}>
              {act.type === "external" ? "Externe" : "Club"}
            </Badge>

            <Badge variant={past ? "muted" : "yellow"}>
              {past ? "Terminé" : "À venir"}
            </Badge>
          </div>

          <h3 className="text-xl font-semibold tracking-tight text-gray-950 sm:text-2xl">
            {act.titre}
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            {act.description}
          </p>

          <div className="mt-4 space-y-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} aria-hidden="true" />
              <span>{formatDate(act.date)}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={16} aria-hidden="true" />
              <span>{act.lieu}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock3 size={16} aria-hidden="true" />
              <span>{act.duree}</span>
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between gap-4">
            <p className="text-lg font-semibold text-gray-950">
              {act.prix === 0 ? "Gratuit" : `${act.prix} €`}
            </p>

            <button
              type="button"
              onClick={() => onOpen(act)}
              className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black"
            >
              Voir les détails
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ================= PAGE ================= */
export default function ActiviteList() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <section className="relative overflow-hidden bg-[linear-gradient(to_bottom,#f8fafc,white_28%,#f8fafc)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-7rem] top-16 h-56 w-56 rounded-full bg-red-100/40 blur-3xl" />
          <div className="absolute right-[-5rem] top-32 h-64 w-64 rounded-full bg-orange-100/30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">

          {/* Liste */}
          <div className="grid gap-6 lg:grid-cols-2">
            {infos.map((act) => (
              <ActiviteCard key={act.id} act={act} onOpen={setSelected} />
            ))}
          </div>
        </div>
      </section>

      {/* Overlay */}
      {selected && (
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
          aria-label="Fermer les détails de l’activité"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-xl transform border-l border-black/5 bg-white/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ${
          selected ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!selected}
      >
        {selected && (
          <div className="flex h-full flex-col">
            {/* Image */}
            <div className="h-64 overflow-hidden border-b border-black/5 bg-gray-50">
              <img
                src={selected.image}
                alt={selected.titre}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Contenu */}
            <div className="flex flex-1 flex-col overflow-y-auto p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge
                      variant={
                        selected.type === "external" ? "blue" : "green"
                      }
                    >
                      {selected.type === "external" ? "Externe" : "Club"}
                    </Badge>

                    <Badge
                      variant={isPast(selected.date) ? "muted" : "yellow"}
                    >
                      {isPast(selected.date) ? "Terminé" : "À venir"}
                    </Badge>
                  </div>

                  <h2 className="text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
                    {selected.titre}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-black/10 bg-white text-gray-700 transition hover:bg-gray-50"
                  aria-label="Fermer"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="mt-6 grid gap-3 rounded-3xl bg-gray-50 p-5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} aria-hidden="true" />
                  <span>{formatDate(selected.date)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={16} aria-hidden="true" />
                  <span>{selected.lieu}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock3 size={16} aria-hidden="true" />
                  <span>Durée : {selected.duree}</span>
                </div>

                <div className="pt-1 text-base font-semibold text-gray-950">
                  {selected.prix === 0 ? "Gratuit" : `${selected.prix} €`}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-400">
                  Description
                </h3>
                <p className="mt-3 text-base leading-7 text-gray-600">
                  {selected.description}
                </p>
              </div>

              <div className="mt-auto pt-8">
                {selected.type === "external" ? (
                  <a
                    href={selected.lien}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-black"
                  >
                    <span>S’inscrire</span>
                    <ExternalLink size={16} aria-hidden="true" />
                  </a>
                ) : (
                  <button
                    type="button"
                    className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-gray-950 px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-black"
                  >
                    S’inscrire
                  </button>
                )}

                <p className="mt-3 text-center text-xs leading-5 text-gray-500">
                  Les modalités d’inscription peuvent varier selon l’activité.
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}