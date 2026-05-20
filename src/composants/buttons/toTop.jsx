"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function ToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Remonter en haut de la page"
      className={`
        cursor-pointer
        fixed bottom-6 right-6 z-50
        inline-flex h-12 w-12 items-center justify-center
        rounded-2xl
        border border-black/10
        bg-white/85
        text-gray-900
        shadow-[0_10px_30px_rgba(0,0,0,0.16)]
        backdrop-blur-xl
        transition-all duration-300
        hover:-translate-y-1
        hover:bg-white
        active:translate-y-0
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-gray-900/70
        focus-visible:ring-offset-2
        focus-visible:ring-offset-white
        ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}
      `}
    >
      <ChevronUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}