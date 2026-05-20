import { motion } from "motion/react";
import {
  CalendarDays,
  Target,
  Users,
  User,
  Dumbbell,
  Clock
} from "lucide-react";

/* ---------- Design tokens ---------- */

const styles = {
  surface:
    "bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-[0_10px_40px_rgba(0,0,0,0.06)]",
  hover:
    "hover:shadow-[0_20px_60px_rgba(0,0,0,0.10)] transition-all duration-300",
  icon:
    "p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700",
  title:
    "text-[15px] font-medium text-gray-500 tracking-wide",
  content:
    "text-sm text-gray-800"
};

/* ---------- UI primitives ---------- */

function Section({ icon: Icon, title, children }) {
  return (
    <section className="flex gap-3">
      <div className={styles.icon}>
        <Icon size={18} aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={styles.title}>{title}</h4>
        <div className="mt-2">{children}</div>
      </div>
    </section>
  );
}

function Badge({ children, variant = "neutral" }) {
  const variants = {
    neutral:
      "bg-gray-100 text-gray-700 border border-gray-200",
    accent:
      "bg-gradient-to-r from-red-50 to-orange-50 text-red-700 border border-red-100"
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

/* ---------- Card ---------- */

function CardPlanning({
  titre,
  planning = [],
  themes = [],
  niveau,
  instructeurs = [],
  typeSeance = []
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      viewport={{ once: true }}
      className={`
        ${styles.surface}
        ${styles.hover}
        rounded-3xl max-w-6xl mx-auto overflow-hidden
        focus-within:ring-2 focus-within:ring-red-500/40
      `}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5">
        <h3 className="text-2xl font-semibold tracking-tight text-gray-900">
          {titre}
        </h3>

        {niveau && (
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-sm">
            {niveau}
          </span>
        )}
      </header>

      {/* Divider subtil */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* Content */}
      <div className="grid md:grid-cols-3 gap-10 px-6 py-6">

        {/* Col 1 */}
        <div className="space-y-7">
          <Section icon={User} title="Instructeurs">
            <ul className="space-y-1">
              {instructeurs.map((inst, i) => (
                <li
                  key={i}
                  className="text-sm text-gray-700 leading-relaxed"
                >
                  {inst}
                </li>
              ))}
            </ul>
          </Section>

          <Section icon={Dumbbell} title="Type de séance">
            <div className="flex flex-wrap gap-2">
              {typeSeance.map((type, i) => (
                <Badge key={i}>{type}</Badge>
              ))}
            </div>
          </Section>
        </div>

        {/* Col 2 */}
        <div>
          <Section icon={CalendarDays} title="Horaires">
            <ul className="space-y-2">
              {planning.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-gray-200/70 shadow-sm hover:bg-gray-50 transition"
                >
                  <span className="text-sm font-medium text-gray-800">
                    {item.jour}
                  </span>

                  <span className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock size={14} aria-hidden="true" />
                    {item.heure}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* Col 3 */}
        <div className="space-y-7">
          <Section icon={Target} title="Thématiques">
            <div className="flex flex-wrap gap-2">
              {themes.map((theme, i) => (
                <Badge key={i} variant="accent">
                  {theme}
                </Badge>
              ))}
            </div>
          </Section>

          <Section icon={Users} title="Informations">
            <ul className="space-y-1 text-sm text-gray-600">
              <li>Accessible selon le niveau indiqué</li>
              <li>Passage de ceinture possible durant l'année</li>
            </ul>
          </Section>
        </div>

      </div>
    </motion.article>
  );
}

export default CardPlanning;