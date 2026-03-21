"use client";
import { useState } from "react";

function SubscribeBtn() {
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

  const scrollToSection = () => {
    const section = document.getElementById("abonnements");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button
      onMouseDown={createRipple}
      onClick={scrollToSection}
      className="
        relative
        overflow-hidden
        bg-transparent
        text-white
        font-bold
        py-2 px-4
        rounded-full
        cursor-pointer
        transition-shadow
        duration-200
        shadow-[0_0_9px_#ff0039]
        hover:shadow-[0_0_15px_#ff0045] 
      "
    >
      S'INSCRIRE

      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          style={{
            position: "absolute",
            borderRadius: "50%",
            background: "rgba(255, 0, 0, 0.25)",
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
  );
}

export default SubscribeBtn;