import { Info, Clock, Shirt, Droplets, BadgeCheck } from "lucide-react";

function Encart() {
  return (
    <div className="bg-gray-50 mb-5 border border-gray-200 rounded-xl p-6 max-w-[700px] mx-auto shadow-sm">

      {/* Titre */}
      <div className="flex items-center gap-2 mb-4">
        <Info className="text-red-500" size={22} />
        <h3 className="text-lg font-semibold text-gray-800">
          Informations importantes
        </h3>
      </div>

      {/* Liste */}
      <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">

        <div className="flex items-start gap-3">
          <Clock className="text-red-500 mt-0.5" size={18} />
          <p>
            Merci d’arriver <span className="font-medium">10 minutes avant</span> le début du cours.
          </p>
        </div>

        <div className="flex items-start gap-3">
          <Shirt className="text-red-500 mt-0.5" size={18} />
          <p>
            <span className="font-medium">Dobok recommandé</span> pour les pratiquants confirmés.
          </p>
        </div>

        <div className="flex items-start gap-3">
          <Droplets className="text-red-500 mt-0.5" size={18} />
          <p>
            Pensez à apporter <span className="font-medium">une bouteille d’eau</span>.
          </p>
        </div>

        <div className="flex items-start gap-3">
          <BadgeCheck className="text-red-500 mt-0.5" size={18} />
          <p>
            <span className="font-medium">Cours d’essai possible</span> selon les disponibilités.
          </p>
        </div>

      </div>
    </div>
  );
}

export default Encart;