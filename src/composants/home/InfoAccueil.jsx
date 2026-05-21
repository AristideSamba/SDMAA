"use client";

import { motion } from "framer-motion";
import SubscribeBtn from "../buttons/subscribreBtn";
import PlanningBtn from "../buttons/planningBtn";
import profil1 from "../../assets/profil1.jpg";

function InfoAccueil() {
  return (
    <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden text-white">

      {/* Image FULL visible */}
      <img
        src={profil1}
        alt="Cours de Taekwondo en entraînement"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dégradé directionnel (gauche → droite) */}
     <div
  className="absolute inset-0"
  style={{
    background: `
      linear-gradient(
        to right,
        rgba(0, 0, 0, 0.78) 0%,
        rgba(0, 0, 0, 0.58) 24%,
        rgba(0, 0, 0, 0.34) 48%,
        rgba(0, 0, 0, 0.14) 68%,
        rgba(0, 0, 0, 0) 100%
      )
    `,
  }}
/>

      {/* Contenu */}
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-6 sm:px-10 md:px-16">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <p className="text-sm text-white/80 mb-4">
            Club de Taekwondo • Tous niveaux
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight">
            Dépassez vos limites.
            <span className="block text-white/85">
              Progressez avec discipline.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-white/80 max-w-lg">
            Un encadrement structuré, une progression réelle, et un esprit
            d’équipe fort pour tous les âges.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <SubscribeBtn />
            <PlanningBtn />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default InfoAccueil;