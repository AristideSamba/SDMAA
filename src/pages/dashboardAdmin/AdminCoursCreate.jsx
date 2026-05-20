import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  FileText,
  Users,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const jours = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

function Field({ icon: Icon, label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          className="w-full rounded-2xl border border-black/10 bg-white py-3 pl-11 pr-4 text-gray-900 outline-none transition focus:ring-2 focus:ring-gray-950/10"
        />
      </div>
    </div>
  );
}

function SelectField({ icon: Icon, label, name, value, onChange, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <select
          name={name}
          value={value || ""}
          onChange={onChange}
          className="w-full appearance-none rounded-2xl border border-black/10 bg-white py-3 pl-11 pr-4 text-gray-900 outline-none transition focus:ring-2 focus:ring-gray-950/10"
        >
          {children}
        </select>
      </div>
    </div>
  );
}

function AdminCoursCreate() {
  const navigate = useNavigate();
  const pageTopRef = useRef(null);

  const [form, setForm] = useState({
    titre: "",
    description: "",
    jour: "",
    heureDebut: "",
    heureFin: "",
    trancheAge: "",
    niveau: "",
    lieu: "",
    statutCours: "actif",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (success || error) {
      pageTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [success, error]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    if (!form.titre.trim()) return "Le titre est obligatoire.";
    if (!form.jour) return "Le jour est obligatoire.";
    if (!form.heureDebut) return "L’heure de début est obligatoire.";
    if (!form.heureFin) return "L’heure de fin est obligatoire.";
    if (!form.lieu.trim()) return "Le lieu est obligatoire.";

    if (form.heureDebut >= form.heureFin) {
      return "L’heure de fin doit être après l’heure de début.";
    }

    return "";
  };

  const createCours = async (e) => {
    e.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:8080/api/cours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Erreur lors de la création du cours.");
      }

      setSuccess("Cours créé avec succès.");

      setTimeout(() => {
        navigate("/dashboard/admin/cours");
      }, 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section ref={pageTopRef} className="space-y-8">
      <div className="rounded-[28px] border border-black/5 bg-white px-6 py-8 text-gray-950 shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:px-10 sm:py-10">
        <button
          type="button"
          onClick={() => navigate("/dashboard/admin/cours")}
          className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-950"
        >
          <ArrowLeft size={16} />
          Retour aux cours
        </button>

        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
          Administration
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Créer un cours
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
          Ajoutez un nouveau cours au planning du club.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-3xl border border-green-100 bg-green-50 p-5 text-sm text-green-700">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <section className="rounded-3xl border border-black/5 bg-white/85 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8">
        <div className="mb-6 flex items-start gap-4">
          <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-950">
            <CalendarDays size={20} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-950">
              Informations du cours
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Renseignez les informations principales, horaires, niveau et lieu.
            </p>
          </div>
        </div>

        <form onSubmit={createCours} className="space-y-5">
          <Field
            icon={FileText}
            label="Titre"
            name="titre"
            value={form.titre}
            onChange={handleChange}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              rows={5}
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-gray-950/10"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <SelectField
              icon={CalendarDays}
              label="Jour"
              name="jour"
              value={form.jour}
              onChange={handleChange}
            >
              <option value="">Choisir un jour</option>
              {jours.map((jour) => (
                <option key={jour} value={jour}>
                  {jour}
                </option>
              ))}
            </SelectField>

            <Field
              icon={MapPin}
              label="Lieu"
              name="lieu"
              value={form.lieu}
              onChange={handleChange}
            />

            <Field
              icon={Clock3}
              label="Heure début"
              name="heureDebut"
              type="time"
              value={form.heureDebut}
              onChange={handleChange}
            />

            <Field
              icon={Clock3}
              label="Heure fin"
              name="heureFin"
              type="time"
              value={form.heureFin}
              onChange={handleChange}
            />

            <Field
              icon={Users}
              label="Tranche d’âge"
              name="trancheAge"
              value={form.trancheAge}
              onChange={handleChange}
            />

            <Field
              icon={Users}
              label="Niveau"
              name="niveau"
              value={form.niveau}
              onChange={handleChange}
            />

            <SelectField
              icon={CheckCircle2}
              label="Statut"
              name="statutCours"
              value={form.statutCours}
              onChange={handleChange}
            >
              <option value="actif">Actif</option>
              <option value="suspendu">Suspendu</option>
              <option value="brouillon">Brouillon</option>
            </SelectField>
          </div>

          <div className="border-t border-black/5 pt-5">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Création..." : "Créer le cours"}
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}

export default AdminCoursCreate;