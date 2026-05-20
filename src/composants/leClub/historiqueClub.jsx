import dojo from "../../assets/profil.jpeg";

function HistoriqueClub() {
  return (
    <section className="py-16 px-4 sm:px-10 max-w-7xl mx-auto">

      <div className="grid md:grid-cols-2 gap-10 h-[400px]">

        {/* Image */}
        <div className="overflow-hidden h-auto shadow-lg">
          <img
            src={dojo}
            alt="Dojo du club"
            className="w-auto h-auto object-cover transition duration-500"
          />
        </div>

        {/* Texte */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            L'histoire du club
          </h2>

          <div className="w-20 h-1 bg-[radial-gradient(circle_at_top_left,_#800020,_#4d0015)] mb-6 rounded-full"></div>

          <p className="text-gray-600 leading-relaxed mb-4">
            Fondé avec la volonté de transmettre les valeurs des arts martiaux,
            le <span className="font-semibold text-gray-800">Saint-Denis Martial Art Academy</span>
            est devenu au fil des années un lieu incontournable pour les
            passionnés de taekwondo.
          </p>

          <p className="text-gray-600 leading-relaxed">
            Grâce à l’engagement de ses entraîneurs et à la motivation de ses
            adhérents, le club a su évoluer et accueillir des pratiquants de
            tous âges, en mettant toujours en avant le respect, la discipline
            et le dépassement de soi.
          </p>
        </div>

      </div>

    </section>
  );
}

export default HistoriqueClub;