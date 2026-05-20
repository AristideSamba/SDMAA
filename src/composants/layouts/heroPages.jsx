function HeroPages({ titre, intro, image }) {
  return (
    <section className="relative h-[70vh] overflow-hidden text-white">
      
      {/* Image de fond */}
      <img
        src={image}
        alt="Pratiquants de Taekwondo en entraînement"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dégradé prononcé depuis la gauche */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              to right,
              rgba(0, 0, 0, 0.90) 0%,
              rgba(0, 0, 0, 0.75) 20%,
              rgba(0, 0, 0, 0.50) 40%,
              rgba(0, 0, 0, 0.25) 60%,
              rgba(0, 0, 0, 0.08) 75%,
              rgba(0, 0, 0, 0) 100%
            )
          `,
        }}
      />

      {/* Renfort subtil autour du texte */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              circle at 20% 50%,
              rgba(0, 0, 0, 0.35) 0%,
              rgba(0, 0, 0, 0.18) 25%,
              rgba(0, 0, 0, 0.08) 45%,
              rgba(0, 0, 0, 0) 65%
            )
          `,
        }}
      />

      {/* Contenu */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6 sm:px-10 md:px-16">
        
        <div className="max-w-2xl text-left">
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight tracking-tight">
            {titre}
          </h1>

          <p className="mt-4 text-lg md:text-xl text-white/80 leading-relaxed">
            {intro}
          </p>
        </div>

      </div>
    </section>
  );
}

export default HeroPages;