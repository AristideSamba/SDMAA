import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  MapPin,
  Phone,
  Shield,
  Lock,
  Cake,
  Medal,
  Pencil,
} from "lucide-react";

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-gray-50 p-4">
      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-700 shadow-sm">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 break-words text-base font-semibold text-gray-950">
          {value || "Non renseigné"}
        </p>
      </div>
    </div>
  );
}

function SectionCard({ eyebrow, title, description, children }) {
  return (
    <section className="rounded-3xl border border-black/5 bg-white/85 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8">
      <div className="mb-6">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

function formatDate(date) {
  if (!date) return "Non renseignée";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function Profil() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
          throw new Error("Erreur lors du chargement du profil");
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return <p className="text-gray-500">Chargement du profil...</p>;
  }

  if (!user) {
    return (
      <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
        Impossible de charger le profil.
      </p>
    );
  }

  const nomComplet = `${user.nomComplet}`.trim();

  return (
    <section className="space-y-8">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-[28px] border border-black/5 bg-gray-950 px-6 py-8 text-white shadow-[0_16px_50px_rgba(0,0,0,0.12)] sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-4rem] top-[-4rem] h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />
          <div className="absolute bottom-[-3rem] right-[-3rem] h-48 w-48 rounded-full bg-orange-400/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
              Compte
            </p>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Mon profil
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
              Consultez vos informations personnelles et mettez à jour vos
              coordonnées de contact.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm lg:min-w-[300px]">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                <User size={20} />
              </div>

              <div>
                <p className="text-sm text-gray-400">{user.role || "Adhérent"}</p>
                <p className="text-base font-semibold text-white">
                  {nomComplet || "Utilisateur"}
                </p>
              </div>
            </div>

            <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white">
              Ceinture : {user.ceintureNom || "Non renseignée"}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <SectionCard
            eyebrow="Informations"
            title="Mes données personnelles"
            description="Ces informations sont enregistrées par le club."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow icon={User} label="Nom complet" value={nomComplet} />
              <InfoRow
                icon={Cake}
                label="Date de naissance"
                value={formatDate(user.dateNaissance)}
              />
              <InfoRow
                icon={Medal}
                label="Ceinture"
                value={user.ceintureNom}
              />
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Coordonnées"
            title="Informations modifiables"
            description="Gardez vos coordonnées à jour pour faciliter les échanges avec le club."
          >
            <div className="space-y-4">
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow icon={MapPin} label="Adresse" value={user.adresse} />
              <InfoRow icon={Phone} label="Téléphone" value={user.telephone} />
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate("/dashboard/profil/modifier")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-3xl border border-black/15 bg-transparent px-5 py-3 text-sm font-medium text-gray-950 transition-all cursor-pointer duration-200  sm:w-auto"
              >
                <Pencil size={16} />
                Modifier mes coordonnées
              </button>
            </div>
          </SectionCard>
        </div>

        <aside className="h-fit rounded-3xl border border-black/5 bg-white/85 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] xl:sticky xl:top-24">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
              Sécurité
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              Actions du compte
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Gérez ici les actions importantes liées à votre espace personnel.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="flex items-start gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-gray-800 shadow-sm">
                  <Shield size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Statut du compte
                  </p>
                  <p className="mt-1 text-base font-semibold text-gray-950">
                    {user.statutCompte || "Non renseigné"}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/dashboard/change-password")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-3xl border border-black/15 bg-transparent px-5 py-3 text-sm font-medium text-gray-950 transition-all cursor-pointer duration-200  sm:w-auto"
            >
              <Lock size={16} />
              Changer le mot de passe
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Profil;