import { motion } from "motion/react";
import {
  CalendarDays,
  Target,
  Users,
  User,
  Gauge,
  Dumbbell
} from "lucide-react";

function CardPlanning({
  titre,
  planning = [],
  themes = [],
  niveau,
  instructeurs = [],
  typeSeance = []
}) {

  const Separator = () => (
    <div className="flex justify-center py-1">
      <div className="w-[90%] h-[1px] bg-gray-200"></div>
    </div>
  );

  return (
    <motion.div
  whileHover={{ y: -6 }}
  transition={{ type: "spring", stiffness: 300 }}
  className="bg-white shadow-md overflow-hidden w-[350px]"
>

      {/* Header */}
      <div className="bg-gray-700 text-white p-4 text-center font-semibold text-lg">
        {titre}
      </div>

      <div className="p-6 space-y-3">

        {/* Niveau */}
        <div className="flex items-start gap-3">
          <Gauge className="text-red-500" size={20} />
          <div>
            <p className="font-semibold">Niveau</p>
            <p className="text-gray-600 text-sm">{niveau}</p>
          </div>
        </div>

        <Separator />

        {/* Instructeurs */}
        <div className="flex items-start gap-3">
          <User className="text-red-500" size={20} />
          <div>
            <p className="font-semibold">Instructeur(s)</p>
            <ul className="text-gray-600 text-sm">
              {instructeurs.map((inst, index) => (
                <li key={index}>{inst}</li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        {/* Planning jours + horaires */}
        <div className="flex items-start gap-3">
          <CalendarDays className="text-red-500" size={20} />

          <div className="w-full">
            <p className="font-semibold mb-1">Planning</p>

            <div className="grid grid-cols-2 text-sm text-gray-600">

              <div className="font-medium text-gray-700">Jour</div>
              <div className="font-medium text-gray-700">Horaire</div>

              {planning.map((item, index) => (
                <>
                  <div key={index + "j"}>{item.jour}</div>
                  <div key={index + "h"}>{item.heure}</div>
                </>
              ))}

            </div>
          </div>
        </div>

        <Separator />

        {/* Thématiques */}
        <div className="flex items-start gap-3">
          <Target className="text-red-500" size={20} />
          <div>
            <p className="font-semibold">Thématique</p>
            <ul className="text-gray-600 text-sm">
              {themes.map((theme, index) => (
                <li key={index}>{theme}</li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        {/* Type de séance */}
        <div className="flex items-start gap-3">
          <Dumbbell className="text-red-500" size={20} />
          <div>
            <p className="font-semibold">Type de séance</p>
            <ul className="text-gray-600 text-sm">
              {typeSeance.map((type, index) => (
                <li key={index}>{type}</li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        {/* Infos */}
        <div className="flex items-start gap-3">
          <Users className="text-red-500" size={20} />
          <div>
            <p className="font-semibold">Informations</p>
            <ul className="text-gray-600 text-sm">
              <li>Accessible selon le niveau indiqué</li>
              <li>Passage de ceinture possible durant l'année</li>
            </ul>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default CardPlanning;