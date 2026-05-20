import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  User,
} from "lucide-react";

function InputField({
  icon: Icon,
  id,
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={18} aria-hidden="true" />
        </span>

        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-2xl border border-black/10 bg-white py-3 pl-11 pr-4 text-gray-900 outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-gray-900/10"
        />
      </div>
    </div>
  );
}

function EditProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    adresse: "",
    telephone: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("idUtilisateur");
          navigate("/login");
          return;
        }

        if (!res.ok) throw new Error("Impossible de charger le profil");

        const data = await res.json();

        setForm({
          email: data.email || "",
          adresse: data.adresse || "",
          telephone: data.telephone || "",
        });
      } catch (err) {
        setError("Impossible de charger vos informations.");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const validate = () => {
    if (!form.email || !form.adresse || !form.telephone) {
      return "Tous les champs sont obligatoires.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return "Veuillez saisir une adresse email valide.";
    }

    if (form.telephone.replace(/\s/g, "").length < 10) {
      return "Veuillez saisir un numéro de téléphone valide.";
    }

    return "";
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:8080/api/utilisateurs/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Erreur lors de la mise à jour.");
      }

      setSuccess("Vos coordonnées ont été mises à jour avec succès.");

      setTimeout(() => {
        navigate("/dashboard/profil");
      }, 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return <p className="text-gray-500">Chargement du formulaire...</p>;
  }

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[28px] border border-black/5 bg-gray-950 px-8 py-8 text-white shadow-[0_16px_50px_rgba(0,0,0,0.12)] sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-4rem] top-[-4rem] h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />
          <div className="absolute right-[-3rem] bottom-[-3rem] h-48 w-48 rounded-full bg-orange-400/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard/profil")}
            className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-gray-300 transition hover:text-white"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Retour au profil
          </button>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
                Profil
              </p>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Modifier mes coordonnées
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
                Mettez à jour vos informations de contact pour faciliter les
                échanges avec le club.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm lg:min-w-[300px]">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <User size={20} aria-hidden="true" />
                </div>

                <div>
                  <p className="text-sm text-gray-400">Mise à jour</p>
                  <p className="text-base font-semibold text-white">
                    Coordonnées de contact
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-gray-300">
                Vos informations doivent rester à jour pour recevoir les
                communications du club.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl">
        <section className="rounded-3xl border border-black/5 bg-white/85 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
              Formulaire
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              Modifier mes informations
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
              Renseignez ici vos coordonnées actuelles.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              icon={Mail}
              id="email"
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="exemple@email.com"
            />

            <InputField
              icon={MapPin}
              id="adresse"
              label="Adresse"
              name="adresse"
              value={form.adresse}
              onChange={handleChange}
              required
              placeholder="Votre adresse"
            />

            <InputField
              icon={Phone}
              id="telephone"
              label="Téléphone"
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
              required
              placeholder="06 00 00 00 00"
            />

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <p>{success}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-black/5 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/dashboard/profil")}
                className="inline-flex cursor-pointer items-center justify-center rounded-3xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-3xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </section>
  );
}

export default EditProfile;