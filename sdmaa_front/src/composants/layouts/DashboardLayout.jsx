import { useEffect, useState } from "react";
import {
  User,
  Calendar,
  LogOut,
  ShoppingCart,
  Box,
  FileText,
  Target,
  Menu,
  X,
  LayoutDashboard,
  Users,
  Dumbbell,
  PackageCheck,
  HandCoins,
  Megaphone,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/sdmma.png";
import taekwondo from "../../assets/tea.png";

const getMenuItems = (role) => [
  ...(role === "ADHERENT"
    ? [
        { section: "Performance" },
        {
          icon: Target,
          label: "Compétitions",
          path: "/dashboard/competitions",
          highlight: true,
        },
        { section: "Entraînement" },
        {
          icon: Calendar,
          label: "Activités",
          path: "/dashboard/activites",
        },
        { section: "Équipements" },
        {
          icon: ShoppingCart,
          label: "Achat Équipements",
          path: "/dashboard/boutique",
        },
        {
          icon: Box,
          label: "Emprunt Équipements",
          path: "/dashboard/emprunt",
        },
        { section: "Personnel" },
        {
          icon: User,
          label: "Profil",
          path: "/dashboard/profil",
        },
        {
          icon: FileText,
          label: "Mes documents",
          path: "/dashboard/document",
        },
      ]
    : []),

  ...(role === "COACH"
    ? [
        { section: "Entraînement" },
        {
          icon: Calendar,
          label: "Mes cours",
          path: "/dashboard/coach/cours",
        },
        { section: "Personnel" },
        {
          icon: User,
          label: "Profil",
          path: "/dashboard/profil",
        },
      ]
    : []),

  ...(role === "ADMIN"
    ? [
        { section: "Administration" },
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          path: "/dashboard/admin",
        },
        {
          icon: Users,
          label: "Utilisateurs",
          path: "/dashboard/admin/utilisateurs",
        },
        {
          icon: Calendar,
          label: "Cours",
          path: "/dashboard/admin/cours",
        },
        {
          icon: Dumbbell,
          label: "Activités",
          path: "/dashboard/admin/activites",
        },
        {
          icon: ShoppingCart,
          label: "Équipements",
          path: "/dashboard/admin/equipements",
        },
        {
          icon: HandCoins,
          label: "Achats",
          path: "/dashboard/admin/achats",
        },
        {
          icon: PackageCheck,
          label: "Emprunts",
          path: "/dashboard/admin/emprunts",
        },
        {
          icon: FileText,
          label: "Documents",
          path: "/dashboard/admin/documents",
        },
        {
          icon: Megaphone,
          label: "Annonces cours",
          path: "/dashboard/admin/annonces-cours",
        },
        {
          icon: Megaphone,
          label: "Annonces",
          path: "/dashboard/admin/annonces",
        },
        { section: "Personnel" },
        {
          icon: User,
          label: "Profil",
          path: "/dashboard/profil",
        },
      ]
    : []),
];

function getHomePath(role) {
  if (role === "ADMIN") return "/dashboard/admin";
  if (role === "COACH") return "/dashboard/coach/cours";
  return "/dashboard";
}

function NavItem({ item, active, onClick }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex w-full cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 text-left transition-all duration-200",
        active
          ? "bg-white/5 text-gray-300 shadow-sm"
          : "text-gray-300 hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      <div
        className={[
          "inline-flex h-7 w-7 items-center justify-center rounded-xl transition-colors",
          active
            ? "bg-gray-500 text-gray-950"
            : item.highlight
            ? "bg-yellow-400/10 text-yellow-300"
            : "bg-white/5 text-gray-400 group-hover:text-white",
        ].join(" ")}
      >
        <Icon size={16} />
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <span className="truncate text-sm font-light">{item.label}</span>

        {item.highlight && !active && (
          <span className="h-2 w-2 rounded-full bg-yellow-400" />
        )}
      </div>
    </button>
  );
}

function DashboardSidebar({ isActive, navigate, onNavigate, user }) {
  const role = user?.role || localStorage.getItem("role") || "ADHERENT";
  const menuItems = getMenuItems(role);
  console.log("ROLE SIDEBAR:", user?.role, localStorage.getItem("role"));
  

  return (
    <div className="flex h-screen w-full flex-col">
      <div className="shrink-0 border-b border-white/10 px-6 pb-3 pt-3">
        <button
          type="button"
          onClick={() => {
            navigate(getHomePath(role));
            onNavigate?.();
          }}
          className="flex cursor-pointer items-center gap-4"
        >
          <img
            src={logo}
            alt="Logo du SDMAA"
            className="h-14 w-14 rounded-3xl object-cover ring-1 ring-white/10"
          />

          <div className="min-w-0 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
              Tableau de bord
            </p>
            <h1 className="truncate text-lg font-semibold text-white">
              {role === "ADMIN" ? "Espace admin" : "Mon espace"}
            </h1>
          </div>
        </button>

        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <img
            src={taekwondo}
            alt="Icône Taekwondo"
            className="h-10 w-10 object-contain"
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {user?.nomComplet || "Chargement..."}
            </p>
            <p className="text-xs text-gray-400">{role}</p>
            <p className="truncate text-xs text-gray-400">
              {role === "ADMIN"
                ? "Gestion du club"
                : "Suivi, activités et équipements"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <nav aria-label="Navigation du tableau de bord">
          {menuItems.map((item, index) =>
            item.section ? (
              <div key={`${item.section}-${index}`} className="mb-0 mt-5 px-3 first:mt-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                  {item.section}
                </p>
              </div>
            ) : (
              <div key={item.path} className="mb-1">
                <NavItem
                  item={item}
                  active={isActive(item.path)}
                  onClick={() => {
                    navigate(item.path);
                    onNavigate?.();
                  }}
                />
              </div>
            )
          )}
        </nav>
      </div>

      <div className="shrink-0 border-t border-white/10 p-2">
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("idUtilisateur");
            navigate("/");
            onNavigate?.();
          }}
          className="flex w-full cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </div>
  );
}

function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8080/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("idUtilisateur");
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Erreur API");
        }

        const data = await res.json();
        setUser(data);

        if (data?.role) {
          localStorage.setItem("role", data.role);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen overflow-hidden bg-[linear-gradient(to_bottom,#f8fafc,white_25%,#f8fafc)] text-gray-950">
      <div className="flex h-screen">
        <aside className="hidden h-screen w-[300px] shrink-0 border-r border-white/10 bg-gray-950 text-white lg:flex">
          <DashboardSidebar
            isActive={isActive}
            navigate={navigate}
            user={user}
          />
        </aside>

        <div className="fixed left-0 top-0 z-40 w-full border-b border-black/5 bg-white/80 backdrop-blur-xl lg:hidden">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <button
              type="button"
              onClick={() =>
                navigate(getHomePath(user?.role || localStorage.getItem("role")))
              }
              className="flex cursor-pointer items-center gap-3"
            >
              <img
                src={logo}
                alt="Logo du SDMAA"
                className="h-10 w-10 rounded-2xl object-cover ring-1 ring-black/5"
              />

              <div className="min-w-0 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Dashboard
                </p>
                <p className="text-sm font-semibold text-gray-950">
                  {user?.role === "ADMIN" ? "Espace admin" : "Mon espace"}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-black/10 bg-white text-gray-800 transition hover:bg-gray-50"
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Fermer le menu"
            />

            <aside className="fixed left-0 top-0 z-50 h-screen w-[88%] max-w-[320px] border-r border-white/10 bg-gray-950 text-white shadow-2xl lg:hidden">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-end border-b border-white/10 px-4 py-4">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                    aria-label="Fermer le menu"
                  >
                    <X size={18} />
                  </button>
                </div>

                <DashboardSidebar
                  isActive={isActive}
                  navigate={navigate}
                  user={user}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              </div>
            </aside>
          </>
        )}

        <main className="h-screen flex-1 overflow-y-auto">
          <div className="px-4 pb-8 pt-24 sm:px-6 sm:pb-10 lg:px-10 lg:pt-8">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;