import { NavLink } from "react-router-dom";
import logo from "../../assets/sdmma.png";

function HeaderConnexion() {
  return (
    <header className="relative overflow-hidden border-b border-black/5 bg-white/80 backdrop-blur-xl">
      
      {/* Glow décoratif */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-4rem] top-[-2rem] h-40 w-40 rounded-full bg-[#800020]/5 blur-3xl" />
        <div className="absolute right-[-3rem] top-0 h-36 w-36 rounded-full bg-red-100 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        
        {/* Logo + branding */}
        <NavLink
          to="/"
          className="group flex items-center gap-4"
        >
          <div className="hidden sm:block">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#800020]">
              SDMAA
            </p>

            <h1 className="mt-1 text-base font-semibold tracking-tight text-gray-950">
              Saint-Denis Martial Arts Academy
            </h1>
          </div>
        </NavLink>
      </div>
    </header>
  );
}

export default HeaderConnexion;