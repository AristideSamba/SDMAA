import { section } from "motion/react-client";

function HeroPages({titre, intro, image}){
  return(
    <section className="w-full h-[50vh] flex flex-col md:flex-row overflow-hidden">
      {/* Left Column - Info + Radial Gradient */}
      <div className="md:w-1/2 w-full h-1/2 md:h-full flex flex-col justify-center px-8 md:px-16 py-12
                      bg-[radial-gradient(circle_at_top_left,_#800020,_#4d0015)] text-white">
        
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-wide mb-4 text-yellow-300">
          {titre}
        </h1>

        <p className="text-gray-100 text-lg sm:text-xl max-w-lg mb-6">
          {intro}
        </p>

      </div>

      <div className="md:w-1/2 w-full h-1/2 md:h-full relative overflow-hidden">

        {/* Image principale */}
        <img
          src={image}
          alt="Entraînement Taekwondo"
          className="absolute inset-0 w-full h-full object-cover"
        />

      </div>
    </section>
  )
}

export default HeroPages;