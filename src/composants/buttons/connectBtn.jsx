"use client";
import { Link } from "react-router-dom";
import { useState } from "react";

function ConnectBtn() {
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
    <Link to="/connexion">
      <button
        onMouseDown={createRipple}
        className="
          relative
          overflow-hidden
          bg-digital-red
          text-white
          font-bold
          py-2 px-4
          border-none
          rounded-full
          cursor-pointer
          duration-300
          hover:bg-red-light
          hover:shadow-[0_0_6px_#ff0010]
        "
      >
        SE CONNECTER

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
    </Link>
  );
}

export default ConnectBtn;