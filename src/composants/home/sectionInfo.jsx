import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import profil2 from "../../assets/profil2.jpg";

function SectionInfo() {
  return (
    <section className="py-14 sm:py-16 px-6 sm:px-10 lg:px-20 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Titre */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 sm:mb-12"
        >
          On vous présente l’un de nos meilleurs athlètes
        </motion.h2>

        {/* Box */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white shadow-xl p-6 sm:p-8 md:p-10 rounded-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <img
                src={profil2}
                alt="Photo d'Amine Boukarnia"
                className="rounded-2xl shadow-lg object-cover w-full max-w-xs sm:max-w-sm md:max-w-md"
              />
            </motion.div>

            {/* Texte */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center md:text-left"
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-4 tracking-wide">
                Amine BOUKARNIA
              </h3>

              <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-semibold mb-6 text-sm sm:text-base">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                Champion de France senior 2026
              </div>

              <div className="space-y-4 text-gray-700 leading-relaxed text-sm sm:text-base">
                <p>
                  Amine Boukarnia est une fierté pour notre club. Premier champion
                  de France de notre histoire, il a marqué un tournant décisif et
                  ouvert la voie aux générations futures.
                </p>

                <p>
                  Pour lui, le taekwondo est bien plus qu’un sport : c’est une
                  véritable école de vie. Discipline, respect, persévérance et
                  maîtrise de soi sont des valeurs qu’il applique chaque jour,
                  sur le tatami comme en dehors.
                </p>

                <p>
                  Son titre est le fruit d’années d’efforts et de sacrifices.
                  Mais au-delà des médailles, c’est son état d’esprit qui inspire :
                  toujours prêt à progresser et à représenter fièrement les
                  couleurs du club.
                </p>

                <p className="font-semibold text-gray-900">
                  Amine est la preuve que passion et travail mènent à l’excellence.
                </p>
              </div>

            </motion.div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}

export default SectionInfo;