"use client";
import { useState } from "react";
import { Link } from "react-router-dom";

function PlanningBtn() {
  const [ripples, setRipples] = useState([]);

  const createRipple = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();

    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, ripple]);

    setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 600);
  };

  return (
    <Link to="/planning" className="w-full sm:w-auto">
      <button
        onClick={createRipple}
        className="
          relative overflow-hidden

          w-full sm:w-auto
          text-center

          bg-transparent
          text-white
          font-bold
          tracking-wide

          text-sm sm:text-base lg:text-lg

          py-3 px-6
          sm:py-2 sm:px-6
          lg:px-8

          rounded-full
          cursor-pointer

          transition-all duration-200

          shadow-[0_0_9px_#ff0039]
          hover:shadow-[0_0_18px_#ff0045]
        "
      >
        NOTRE PLANNING

        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            style={{
              position: "absolute",
              borderRadius: "50%",
              background: "rgba(255,0,0,0.25)",
              width: ripple.size,
              height: ripple.size,
              left: ripple.x,
              top: ripple.y,
              transform: "scale(0)",
              animation: "ripple 1000ms ease-out",
              pointerEvents: "none",
            }}
          />
        ))}

        <style>
          {`
            @keyframes ripple {
              to {
                transform: scale(4);
                opacity: 0;
              }
            }
          `}
        </style>
      </button>
    </Link>
  );
}

export default PlanningBtn;