import { Routes, Route } from "react-router-dom";

import MainLayout from "./composants/layouts/MainLayout";
import AuthLayout from "./composants/layouts/AuthLayout";

import Home from "./pages/Home";
import LeClub from "./pages/LeClub";
import Activites from "./pages/Activites";
import Planning from "./pages/Planning";
import Contacts from "./pages/Contacts";
import Connexion from "./pages/Connexion";
import Boutique from "./pages/Boutique";
import Emprunt from "./pages/Emprunt";

function App() {
  return (
    <Routes>

      {/* Pages normales */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/club" element={<LeClub />} />
        <Route path="/activites" element={<Activites />} />
        <Route path="/planning" element={<Planning />} />
        <Route path="/contact" element={<Contacts />} />
        <Route path="/boutique" element={<Boutique />} />
        <Route path="/emprunt" element={<Emprunt />} />
      </Route>

      {/* Pages auth */}
      <Route element={<AuthLayout />}>
        <Route path="/Connexion" element={<Connexion />} />
      </Route>

    </Routes>
  );
}

export default App;