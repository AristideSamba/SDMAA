"use client";

import { Link } from "react-router-dom";

function PlanningBtn() {
  return (
    <Link to="/planning" className="w-full sm:w-auto">
      <span
        role="button"
        tabIndex={0}
        className="
          inline-flex items-center justify-center
          w-full sm:w-auto

          rounded-4xl
          border border-white/15
          bg-white/5
          backdrop-blur-md

          px-6 py-3
          text-sm font-medium text-white

          transition-all duration-300
          hover:bg-white/10
          hover:border-white/25
          hover:-translate-y-0.5
          active:translate-y-0

          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-white/70
          focus-visible:ring-offset-2
          focus-visible:ring-offset-black/30
        "
        aria-label="Voir le planning des cours"
      >
        Notre planning
      </span>
    </Link>
  );
}

export default PlanningBtn;