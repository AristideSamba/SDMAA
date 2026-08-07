import {
  Users,
  CalendarDays,
  Dumbbell,
  ShoppingCart,
  PackageCheck,
  HandCoins,
  Megaphone,
  FileText,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const adminCards = [
  {
    title: "Utilisateurs",
    description: "Gérer les adhérents, coachs et administrateurs.",
    icon: Users,
    path: "/dashboard/admin/utilisateurs",
  },
  {
    title: "Cours",
    description: "Créer les cours, horaires, coachs et plannings.",
    icon: CalendarDays,
    path: "/dashboard/admin/cours",
  },
  {
    title: "Activités",
    description: "Gérer stages, événements et compétitions.",
    icon: Dumbbell,
    path: "/dashboard/admin/activites",
  },
  {
    title: "Équipements",
    description: "Gérer le stock, les achats et les emprunts.",
    icon: ShoppingCart,
    path: "/dashboard/admin/equipements",
  },
  {
    title: "Achats",
    description: "Valider les commandes d’équipements.",
    icon: HandCoins,
    path: "/dashboard/admin/achats",
  },
  {
    title: "Emprunts",
    description: "Valider les demandes et retours de matériel.",
    icon: PackageCheck,
    path: "/dashboard/admin/emprunts",
  },
  {
    title: "Documents",
    description: "Consulter les justificatifs transmis.",
    icon: FileText,
    path: "/dashboard/admin/documents",
  },
  {
    title: "Annonces cours",
    description: "Informer les adhérents en cas de changement.",
    icon: Megaphone,
    path: "/dashboard/admin/annonces-cours",
  },
  {
    title: "Annonces",
    description: "Informer les adhérents sur la vie du club.",
    icon: Megaphone,
    path: "/dashboard/admin/annonces",
  }
];

function AdminCard({ item }) {
  const navigate = useNavigate();
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => navigate(item.path)}
      className="group flex h-full cursor-pointer flex-col rounded-3xl border border-black/5 bg-white/90 p-5 text-left shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]"
    >
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-950 transition group-hover:bg-gray-950 group-hover:text-white">
        <Icon size={22} />
      </div>

      <h2 className="text-lg font-semibold text-gray-950">{item.title}</h2>

      <p className="mt-2 flex-1 text-sm leading-6 text-gray-500">
        {item.description}
      </p>

      <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-gray-950">
        Ouvrir
        <ArrowRight size={16} className="transition group-hover:translate-x-1" />
      </div>
    </button>
  );
}

function AdminDashboard() {
  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[28px] border border-black/5 bg-white px-6 py-8 text-gray-950 shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-5rem] top-[-5rem] h-48 w-48 rounded-full bg-gray-100 blur-3xl" />
          <div className="absolute bottom-[-4rem] right-[-4rem] h-56 w-56 rounded-full bg-gray-100 blur-3xl" />
        </div>

        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
            Administration
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Dashboard Admin
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
            Gérez les adhérents, les cours, les activités, les équipements et les
            validations depuis un espace centralisé.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {adminCards.map((item) => (
          <AdminCard key={item.path} item={item} />
        ))}
      </div>
    </section>
  );
}

export default AdminDashboard;