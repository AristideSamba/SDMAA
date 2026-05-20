import { Routes, Route } from "react-router-dom";

import MainLayout from "./composants/layouts/MainLayout";
import AuthLayout from "./composants/layouts/AuthLayout";
import DashboardLayout from "./composants/layouts/DashboardLayout";

import Home from "./pages/Home";
import LeClub from "./pages/LeClub";
import Activites from "./pages/Activites";
import Planning from "./pages/Planning";
import Contacts from "./pages/Contacts";
import Connexion from "./pages/Connexion";
import Boutique from "./pages/Boutique";
import Emprunt from "./pages/Emprunt";
import Inscription from "./pages/Inscription";
import Dashboard from "./pages/dashboardUtilisateur/Dashboard";
import Profil from "./pages/dashboardUtilisateur/profil";
import ChangePassword from "./pages/dashboardUtilisateur/ChangePassword";
import DashboardCompetitions from "./pages/dashboardUtilisateur/DashboardCompetitions";
import AchatEquipement from "./pages/dashboardUtilisateur/AchatEquipement";
import EmpruntEquipement from "./pages/dashboardUtilisateur/EmpruntEquipement";
import DocumentList from "./pages/dashboardUtilisateur/DocumentList";
import ActiviteDashboard from "./pages/dashboardUtilisateur/ActiviteDashboard";
import DashboardActivityRegistration from "./pages/dashboardUtilisateur/dashboardActivityRegistration";
import EditProfile from "./pages/dashboardUtilisateur/EditProfil";
import ProtectedRoute from "./composants/security/ProtectedRoute";
import Notifications from "./pages/dashboardUtilisateur/Notifications";
import MesInscriptionsActivite from "./pages/dashboardUtilisateur/MesInscriptionsActivite";
import MesEmprunts from "./pages/dashboardUtilisateur/MesEmprunts";
import MesAchats from "./pages/dashboardUtilisateur/MesAchats";
import AdminDashboard from "./pages/dashboardAdmin/AdminDashboard";
import AdminUtilisateurs from "./pages/dashboardAdmin/AdminUtilisateurs";
import AdminUtilisateurDetails from "./pages/dashboardAdmin/AdminUtilisateurDetails";
import AdminCours from "./pages/dashboardAdmin/AdminCours";
import AdminCoursDetail from "./pages/dashboardAdmin/AdminCoursDetail";
import AdminCoursCreate from "./pages/dashboardAdmin/AdminCoursCreate";
import AdminActivites from "./pages/dashboardAdmin/AdminActivites";
import AdminActiviteDetail from "./pages/dashboardAdmin/AdminActiviteDetail";
import AdminActiviteCreate from "./pages/dashboardAdmin/AdminActiviteCreate";
import AdminInscriptionsActivites from "./pages/dashboardAdmin/AdminInscriptionsActivites";
import AdminAnnoncesCours from "./pages/dashboardAdmin/AdminAnnoncesCours";
import InscriptionSucces from "./pages/InscriptionSucces";
import AdminEquipements from "./pages/dashboardAdmin/AdminEquipements";
import AdminAchatsEquipements from "./pages/dashboardAdmin/AdminAchatsEquipements";
import AdminEmpruntsEquipements from "./pages/dashboardAdmin/AdminEmpruntsEquipements";


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
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/inscription/succes" element={<InscriptionSucces />} />
      </Route>

      {/* Pages auth */}
      <Route element={<AuthLayout />}>
        <Route path="/Connexion" element={<Connexion />} />
      </Route>

      <Route element={<DashboardLayout />}>
        {/* Pages Dashboard Admin*/}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/utilisateurs" element={<AdminUtilisateurs />} />
          <Route path="/dashboard/admin/cours" element={<AdminCours />} />
          <Route path="/dashboard/admin/cours/nouveau" element={<AdminCoursCreate />} />
          <Route path="/dashboard/admin/activites" element={<AdminActivites />} />
          <Route path="/dashboard/admin/equipements" element={<AdminEquipements />} />
          <Route path="/dashboard/admin/achats" element={<AdminAchatsEquipements />} />
          <Route path="/dashboard/admin/emprunts" element={<AdminEmpruntsEquipements />} />
          <Route path="/dashboard/admin/activites/nouveau" element={<AdminActiviteCreate />} />
          <Route path="/dashboard/admin/activites/inscriptions" element={<AdminInscriptionsActivites />} />
          <Route path="/dashboard/admin/annonces-cours" element={<AdminAnnoncesCours />} />
          <Route path="/dashboard/admin/activites/:id" element={<AdminActiviteDetail />} />
          <Route path="/dashboard/admin/utilisateurs/:id" element={<AdminUtilisateurDetails />} />
          <Route path="/dashboard/admin/cours/:id" element={<AdminCoursDetail />} />
        </Route>
        {/* Pages Dashboard Utilisateur*/}
        <Route element={<ProtectedRoute allowedRoles={["ADHERENT"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/profil" element={<Profil />} />
          <Route path="/dashboard/change-password" element={<ChangePassword />} />
          <Route path="/dashboard/competitions" element={<DashboardCompetitions />} />
          <Route path="/dashboard/boutique" element={<AchatEquipement />} />
          <Route path="/dashboard/emprunt" element={<EmpruntEquipement />} />
          <Route path="/dashboard/document" element={<DocumentList />} />
          <Route path="/dashboard/activites" element={<ActiviteDashboard />} />
          <Route path="/dashboard/activites/mes-inscriptions" element={<MesInscriptionsActivite />} />
          <Route path="/dashboard/activites/:id/inscription" element={<DashboardActivityRegistration />} />
          <Route path="/dashboard/profil/modifier" element={<EditProfile />} />
          <Route path="/dashboard/notifications" element={<Notifications />} />
          <Route path="/dashboard/emprunt/mes-emprunts" element={<MesEmprunts />} />
          <Route path="/dashboard/boutique/mes-achats" element={<MesAchats />} />
        </Route>
      </Route>


    </Routes>
  );
}

export default App;