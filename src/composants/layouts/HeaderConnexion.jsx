import { NavLink } from "react-router-dom";
import logo from "../../assets/sdmma.jpg";

function HeaderConnexion() {
  return (
    <header className="relative h-[50vh] p-5 bg-[radial-gradient(circle_at_top_left,_#800020,_#4d0015)] overflow-hidden">
      
      <NavLink
        to="/"
        className="text-lg md:text-xl font-bold uppercase tracking-wider text-red-600"
      >
        <img
          src={logo}
          alt="logo SDMAA"
          className="w-15 rounded-4xl"
        />
      </NavLink>

      {/* Divs décoratives */}
      <div className="relative w-full h-full">
        <div className="absolute -left-10 top-30 w-20 h-3 bg-white -rotate-25"></div>
        <div className="absolute -right-10 top-10 w-20 h-20 bg-white rounded-[50%]"></div>
        <div className="absolute -right-5 top-32 bg-white w-15 h-3"></div>
        <div className="absolute -right-5 top-37 bg-white w-30 h-3"></div>
      </div>

    </header>
  );
}

export default HeaderConnexion;