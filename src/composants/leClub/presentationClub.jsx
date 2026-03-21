function PresentationClub() {
  return (
    <section className="py-16 px-4 sm:px-10 max-w-7xl mx-auto">

      {/* Titre */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Saint-Denis Martial Art Academy
        </h2>

        <div className="w-24 h-1 bg-[radial-gradient(circle_at_top_left,_#800020,_#4d0015)] mx-auto mb-6 rounded-full"></div>

        <p className="max-w-2xl mx-auto text-gray-600 text-lg leading-relaxed">
          Notre club accueille tous les passionnés de taekwondo dans un esprit
          de respect, de discipline et de progression. Ouvert aux enfants,
          adolescents et adultes, il permet à chacun de pratiquer et d’évoluer
          dans une ambiance conviviale et motivante.
        </p>
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