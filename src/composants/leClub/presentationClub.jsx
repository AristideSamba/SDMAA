import { motion } from "framer-motion";

function PresentationClub() {
  return (
    <section className="py-16 px-4 sm:px-10 max-w-7xl mx-auto">

      {/* Titre */}
      <div className="mx-auto mb-12 max-w-3xl text-center">
          <motion.p
            className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-red-600/80"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Saint-Denis Martial Art Academy
          </motion.p>

          <motion.h1
            className="text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            Découvrez tout à propos de notre club
          </motion.h1>

          <motion.p
            className="mt-5 text-base leading-7 text-gray-600 sm:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            Notre club accueille tous les passionnés de taekwondo dans un esprit
          de respect, de discipline et de progression. Ouvert aux enfants,
          adolescents et adultes, il permet à chacun de pratiquer et d’évoluer
          dans une ambiance conviviale et motivante.
          </motion.p>
        </div>

      {/* Stats du club */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">

        <div className="bg-white shadow-md rounded-xl p-6">
          <h3 className="text-4xl font-bold text-[#800020] mb-2">150+</h3>
          <p className="text-gray-600">Adhérents</p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6">
          <h3 className="text-4xl font-bold text-[#800020] mb-2">3+</h3>
          <p className="text-gray-600">Années d'expérience</p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6">
          <h3 className="text-4xl font-bold text-[#800020] mb-2">5</h3>
          <p className="text-gray-600">Entraîneurs qualifiés</p>
        </div>

      </div>

    </section>
  );
}

export default PresentationClub;