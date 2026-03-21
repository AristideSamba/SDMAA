import { Award } from "lucide-react";

function LegendeNiveaux() {
  return (
    <div className="bg-white mb-5 border border-gray-200 rounded-xl p-6 max-w-[700px] mx-auto shadow-sm">

      {/* Titre */}
      <div className="flex items-center gap-2 mb-5">
        <Award className="text-red-500" size={22} />
        <h3 className="text-lg font-semibold text-gray-800">
          Légende des niveaux
        </h3>
      </div>

      {/* Niveaux */}
      <div className="flex flex-wrap gap-4">

        {/* Débutant */}
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg">
          <span className="w-8 h-3 bg-white border border-gray-400 rounded-sm"></span>
          <div>
            <p className="font-semibold text-sm text-gray-800">Débutant</p>
            <p className="text-xs text-gray-600">Ceintures blanches</p>
          </div>
        </div>

        {/* Intermédiaire */}
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg">
          <span className="w-8 h-3 bg-yellow-400 rounded-sm"></span>
          <div>
            <p className="font-semibold text-sm text-gray-800">Intermédiaire</p>
            <p className="text-xs text-gray-600">Progression technique</p>
          </div>
        </div>

        {/* Avancé */}
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg">
          <span className="w-8 h-3 bg-black rounded-sm"></span>
          <div>
            <p className="font-semibold text-sm text-gray-800">Avancé</p>
            <p className="text-xs text-gray-600">Ceintures noires</p>
          </div>
        </div>

      </div>

    </div>
  );
}

export default LegendeNiveaux;