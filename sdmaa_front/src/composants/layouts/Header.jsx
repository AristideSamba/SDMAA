"use client";

import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

import ConnectBtn from "../buttons/connectBtn";
import logo from "../../assets/sdmma.png";

const links = [
  { name: "Accueil", path: "/" },
  { name: "Le Club", path: "/club" },
  { name: "Activités", path: "/activites" },
  { name: "Planning", path: "/planning" },
  { name: "Contacts", path: "/contact" },
];

const equipmentLinks = [
  { name: "Boutique", path: "/boutique" },
  { name: "Emprunt", path: "/emprunt" },
];

function NavItem({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-white text-gray-950 shadow-sm"
            : "text-gray-700 hover:bg-white/70 hover:text-gray-950",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/70 backdrop-blur-xl">
      <div className="flex h-16 w-full items-center justify-between px-6 sm:px-8 lg:px-10 xl:px-16">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <img
            src={logo}
            alt="Logo SDMAA"
            className="h-11 w-11 rounded-3xl object-cover ring-1 ring-black/5"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold tracking-wide text-gray-950">
              SDMAA
            </p>
            <p className="text-xs text-gray-500">
              Saint-Denis Martial Arts Academy
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Navigation principale"
          className="hidden lg:flex items-center"
        >
          <div className="flex items-center gap-1 rounded-full border border-black/5 bg-black/[0.03] p-1">
            {links.map((item) => (
              <NavItem key={item.path} to={item.path}>
                {item.name}
              </NavItem>
            ))}

            <div className="relative group">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-white/70 hover:text-gray-950"
                aria-haspopup="true"
              >
                Equipements
                <ChevronDown
                  size={16}
                  className="transition-transform duration-200 group-hover:rotate-180"
                  aria-hidden="true"
                />
              </button>

              <div className="pointer-events-none absolute left-0 top-full pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                <div className="w-48 rounded-2xl border border-white/60 bg-white/90 p-2 shadow-[0_18px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                  {equipmentLinks.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        [
                          "block rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-gray-100 text-gray-950"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-950",
                        ].join(" ")
                      }
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Right actions */}
        <div className="hidden lg:flex items-center">
          <ConnectBtn />
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white/60 text-gray-900 transition hover:bg-white lg:hidden"
          onClick={() => setIsOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={isOpen}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-label="Fermer le menu"
          />

          <aside className="fixed right-0 top-0 z-50 flex h-dvh w-[88%] max-w-sm flex-col border-l border-white/20 bg-white/90 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3"
              >
                <img
                  src={logo}
                  alt="Logo SDMAA"
                  className="h-10 w-10 rounded-xl object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-950">SDMAA</p>
                  <p className="text-xs text-gray-500">Club de Taekwondo</p>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white/70 text-gray-900"
                aria-label="Fermer le menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav
              aria-label="Navigation mobile"
              className="flex-1 overflow-y-auto px-5 py-6"
            >
              <ul className="space-y-2">
                {links.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        [
                          "block rounded-2xl px-4 py-3 text-base font-medium transition-all",
                          isActive
                            ? "bg-gray-950 text-white"
                            : "text-gray-800 hover:bg-gray-100",
                        ].join(" ")
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-black/5 pt-6">
                <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Equipements
                </p>

                <div className="space-y-2">
                  {equipmentLinks.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        [
                          "block rounded-2xl px-4 py-3 text-base font-medium transition-all",
                          isActive
                            ? "bg-gray-950 text-white"
                            : "text-gray-800 hover:bg-gray-100",
                        ].join(" ")
                      }
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </div>
            </nav>

            <div className="border-t border-black/5 p-5">
              <ConnectBtn />
            </div>
          </aside>
        </>
      )}
    </header>
  );
}

export default Header;