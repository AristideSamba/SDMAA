"use client";
import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react"; // flèche style < vers le haut

export default function ToTop() {
  const [show, setShow] = useState(false);

  // Vérifie le scroll pour afficher le bouton
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) setShow(true);
      else setShow(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!show) return null;

  return (
    <button
      onClick={scrollToTop}
      className="
        fixed
        bottom-8
        right-8
        bg-digital-red
        hover:light-red
        text-white
        p-4
        rounded-full
        shadow-lg
        z-50
        flex
        items-center
        justify-center
        transition-colors
        duration-300
        cursor-pointer
      "
    >
      {/* Flèche animée séparément */}
      <ChevronUp className="w-6 h-6 animate-bounce-slow text-yellow-300" />
      
      <style>
        {`
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 1s infinite;
          }
        `}
      </style>
    </button>
  );
}