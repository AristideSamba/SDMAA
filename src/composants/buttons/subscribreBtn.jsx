"use client";

function SubscribeBtn() {
  const scrollToSection = () => {
    const section = document.getElementById("abonnements");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToSection}
      className="
        inline-flex items-center justify-center
        rounded-4xl
        border border-white/20
        bg-white/10
        backdrop-blur-md
        cursor-pointer
        px-6 py-3
        text-sm font-medium text-white
        shadow-[0_8px_30px_rgba(0,0,0,0.12)]
        transition-all duration-300
        hover:bg-white/16
        hover:border-white/30
        hover:-translate-y-0.5
        active:translate-y-0
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-white/70
        focus-visible:ring-offset-2
        focus-visible:ring-offset-black/30
      "
      aria-label="Aller à la section des abonnements"
    >
      S’inscrire
    </button>
  );
}

export default SubscribeBtn;