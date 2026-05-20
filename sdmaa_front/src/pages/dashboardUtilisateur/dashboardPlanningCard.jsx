import { CalendarDays, User, Target, Dumbbell, MapPin } from "lucide-react";

function DashboardCardPlanning({ cours }) {
  const {
    titre = "Cours inconnu",
    ceinture = "N/A",
    planning = [],
    themes = [],
    instructeurs = [],
    typeSeance = [],
    lieu,
  } = cours || {};

  const Section = ({ Icon, items }) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="flex min-w-0 items-start gap-2 text-sm text-gray-600">
        <Icon size={16} className="mt-0.5 shrink-0 text-gray-400" />
        <span className="min-w-0 break-words">
          {Array.isArray(items) ? items.join(", ") : items}
        </span>
      </div>
    );
  };

  return (
    <article className="min-w-0 rounded-3xl border border-black/5 bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
      <div className="mb-4 flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="break-words text-lg font-semibold tracking-tight text-gray-950">
            {titre}
          </h3>
          {lieu && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <MapPin size={16} className="shrink-0" />
              <span className="break-words">{lieu}</span>
            </div>
          )}
        </div>

        <span className="shrink-0 rounded-full bg-gray-950 px-3 py-1 text-xs font-medium text-white">
          {ceinture}
        </span>
      </div>

      <div className="space-y-3">
        <Section Icon={User} items={instructeurs} />

        {planning.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <CalendarDays size={16} className="shrink-0 text-gray-400" />
              <span>Planning</span>
            </div>

            <div className="space-y-2">
              {planning.map((p, i) => (
                <div
                  key={`${p.jour}-${p.heure}-${i}`}
                  className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700"
                >
                  <span className="font-medium text-gray-950">{p.jour}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span>{p.heure}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Section Icon={Target} items={themes} />
        <Section Icon={Dumbbell} items={typeSeance} />
      </div>
    </article>
  );
}

export default DashboardCardPlanning;