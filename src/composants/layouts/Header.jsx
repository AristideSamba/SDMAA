"use client";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

import ConnectBtn from "../buttons/connectBtn";
import logo from "../../assets/sdmma.jpg";

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Accueil", path: "/" },
    { name: "Le Club", path: "/club" },
    { name: "Activités", path: "/activites" },
    { name: "Planning", path: "/planning" },
    { name: "Contacts", path: "/contact" },
  ];

  return (
    <header className="relative sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-16 px-6 relative">

        {/* Logo */}
        <NavLink to="/">
          <img src={logo} alt="logo SDMAA" className="w-15 rounded-4xl" />
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 h-full">
          <ul className="flex items-center gap-8 font-semibold text-gray-800 h-full">

            {links.map((item) => (
              <li key={item.path} className="h-full font-bold flex items-center relative group">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `text-lg tracking-wide flex items-center h-full ${isActive ? "text-red-600" : "text-gray-800 hover:text-red-600"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <span className="relative flex flex-col items-center h-full justify-center">
                      {item.name}

                      <span
                        className={`absolute bottom-0 left-0 w-full h-[3px] bg-red-600
                        ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                      />
                    </span>
                  )}
                </NavLink>
              </li>
            ))}

            {/* DROPDOWN EQUIPEMENTS */}
            <li className="relative h-full flex items-center group font-bold">

              <span className="text-lg tracking-wide flex items-center gap-1 h-full text-gray-800 hover:text-red-600 cursor-pointer">
                Equipements
                <ChevronDown
                  size={22}
                  className="relative top-[2px] transition-transform duration-200 group-hover:rotate-180"
                />
              </span>

              {/* Trait rouge */}
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-red-600 opacity-0 group-hover:opacity-100"></span>

              {/* Dropdown */}
              <div className="absolute top-full left-0 w-44 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">

                <NavLink
                  to="/boutique"
                  className="block px-4 py-3 text-gray-700 hover:text-red-600"
                >
                  Boutique
                </NavLink>

                <NavLink
                  to="/emprunt"
                  className="block px-4 py-3 text-gray-700 hover:text-red-600"
                >
                  Emprunt
                </NavLink>

              </div>

            </li>

          </ul>

          <ConnectBtn />
        </nav>

        {/* Mobile button */}
        <button className="md:hidden" onClick={() => setIsOpen(true)}>
          <Menu size={26} />
        </button>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed top-0 left-0 w-[260px] h-screen bg-white z-50 shadow-xl flex flex-col">

            <div className="flex items-center justify-between p-5 border-b">
              <img src={logo} alt="logo" className="w-12 rounded-xl" />
              <button onClick={() => setIsOpen(false)}>
                <X size={28} />
              </button>
            </div>

            <ul className="flex flex-col gap-6 p-6 font-semibold text-gray-800">

              {links.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `block text-lg ${isActive ? "text-red-600" : "hover:text-red-600"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}

              {/* Equipements mobile */}
              <li className="pt-4 border-t">
                <span className="text-gray-500 text-sm">Equipements</span>

                <NavLink
                  to="/equipements/boutique"
                  onClick={() => setIsOpen(false)}
                  className="block mt-2 hover:text-red-600"
                >
                  Boutique
                </NavLink>

                <NavLink
                  to="/equipements/emprunt"
                  onClick={() => setIsOpen(false)}
                  className="block mt-2 hover:text-red-600"
                >
                  Emprunt
                </NavLink>
              </li>

            </ul>

            <div className="border-t border-gray-200 mx-6"></div>

            <div className="p-6">
              <ConnectBtn />
            </div>

          </div>
        </>
      )}
    </header>
  );
}

export default Header;