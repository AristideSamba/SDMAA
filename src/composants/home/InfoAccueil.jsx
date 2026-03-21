"use client";
import { motion } from "framer-motion";
import SubscribeBtn from "../buttons/subscribreBtn";
import PlanningBtn from "../buttons/planningBtn";
import profil1 from "../../assets/profil1.jpeg";
import taekwondo from "../../assets/taekwondo.png";

function InfoAccueil() {
  return (
    <section className="w-full min-h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden">

      {/* Left Column */}
      <div className="w-full md:w-1/2 flex flex-col justify-center
        px-6 sm:px-10 md:px-16
        py-12 md:py-0
        bg-[radial-gradient(circle_at_top_left,_#800020,_#4d0015)]
        text-white">

        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight tracking-wide mb-6 max-w-xl">
          Découvrez notre club
          <span className="text-yellow-300 font-medium">
            {" "}et dépassez vos limites
          </span>
        </h1>

        <p className="text-gray-100 text-base sm:text-lg lg:text-xl max-w-lg mb-8">
          Discipline, respect et dépassement de soi. Rejoignez notre club pour
          vivre une expérience unique de Taekwondo.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <SubscribeBtn />
          <PlanningBtn />
        </div>

      </div>

      {/* Right Column */}
      <div className="w-full md:w-1/2 relative min-h-[320px] md:min-h-full overflow-hidden">

        {/* Image principale */}
        <img
          src={profil1}
          alt="Entraînement Taekwondo"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Image Taekwondo animée */}
        <motion.img
          src={taekwondo}
          alt="Taekwondo en coréen"
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 0.25, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute right-2 sm:right-6 top-0
            h-full
            max-h-[80%]
            md:max-h-full
            object-contain object-right
            pointer-events-none"
        />

      </div>

    </section>
  );
}

export default InfoAccueil;