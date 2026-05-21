import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  FileText,
  Users,
  Link as LinkIcon,
  Trophy,
  Image,
  Euro,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

function Field({ icon: Icon, label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <Icon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          className="w-full rounded-2xl border border-black/10 bg-white py-3 pl-11 pr-4 text-gray-900 outline-none transition focus:ring-2 focus:ring-gray-950/10"
        />
      </div>
    </div>
  );
}

function AdminActiviteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pageTopRef = useRef(null);

  const [form, setForm] = useState({
    titre: "",
    description: "",
    dateActivite: "",
    heureDebut: "",
    heureFin: "",
    dureeActivite: "",
    lieu: "",
    prix: "",
    capaciteMax: "",
    isInternal: true,
    typeActivite: "",
    lienExterne: "",
    imageActivite: "",
    discipline: "",
    categorie: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.clear();
      navigate("/login");
      return null;
    }

    return res;
  };

  useEffect(() => {
    const fetchActivite = async () => {
      try {
        setError("");

        const res = await apiFetch(`http://localhost:8080/api/activites/${id}`);
        if (!res) return;

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.message || "Impossible de charger l’activité.");
        }

        setForm({
          titre: data.titre || "",
          description: data.description || "",
          dateActivite: data.dateActivite || "",
          heureDebut: data.heureDebut ? String(data.heureDebut).slice(0, 5) : "",
          heureFin: data.heureFin ? String(data.heureFin).slice(0, 5) : "",
          dureeActivite: data.dureeActivite || "",
          lieu: data.lieu || "",
          prix: data.prix ?? "",
          capaciteMax: data.capaciteMax ?? "",
          isInternal: Boolean(data.isInternal),
          typeActivite: data.typeActivite || "",
          lienExterne: data.lienExterne || "",
          imageActivite: data.imageActivite || "",
          discipline: data.discipline || "",
          categorie: data.categorie || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivite();
  }, [id]);

  useEffect(() => {
    if (success || error) {
      pageTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [success, error]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveActivite = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        prix: form.prix === "" ? null : Number(form.prix),
        capaciteMax: form.capaciteMax === "" ? null : Number(form.capaciteMax),
      };

      const res = await apiFetch(`http://localhost:8080/api/activites/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res?.json().catch(() => null);

      if (!res?.ok) {
        throw new Error(data?.message || "Erreur lors de la mise à jour.");
      }

      setSuccess("Activité mise à jour avec succès.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Chargement de l’activité...</p>;
  }

  return (
    <section ref={pageTopRef} className="space-y-8">
      <div className="rounded-[28px] border border-black/5 bg-white px-6 py-8 text-gray-950 shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:px-10 sm:py-10">
        <button
          type="button"
          onClick={() => navigate("/dashboard/admin/activites")}
          className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-950"
        >
          <ArrowLeft size={16} />
          Retour aux activités
        </button>

        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
          Administration
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          {form.titre || "Modifier l’activité"}
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
          Modifiez les informations de l’activité, son type, son lieu, son tarif
          et ses liens d’inscription.
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
            <Trophy size={20} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-950">
              Informations de l’activité
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Renseignez les données visibles par les adhérents.
            </p>
          </div>
        </div>

        <form onSubmit={saveActivite} className="space-y-5">
          <Field icon={FileText} label="Titre" name="titre" value={form.titre} onChange={handleChange} />

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
            <Field icon={CalendarDays} label="Date" name="dateActivite" type="date" value={form.dateActivite} onChange={handleChange} />
            <Field icon={MapPin} label="Lieu" name="lieu" value={form.lieu} onChange={handleChange} />
            <Field icon={Clock3} label="Heure début" name="heureDebut" type="time" value={form.heureDebut} onChange={handleChange} />
            <Field icon={Clock3} label="Heure fin" name="heureFin" type="time" value={form.heureFin} onChange={handleChange} />
            <Field icon={Clock3} label="Durée" name="dureeActivite" value={form.dureeActivite} onChange={handleChange} />
            <Field icon={Euro} label="Prix" name="prix" type="number" value={form.prix} onChange={handleChange} />
            <Field icon={Users} label="Capacité max" name="capaciteMax" type="number" value={form.capaciteMax} onChange={handleChange} />
            <Field icon={Trophy} label="Type d’activité" name="typeActivite" value={form.typeActivite} onChange={handleChange} />
            <Field icon={Trophy} label="Discipline" name="discipline" value={form.discipline} onChange={handleChange} />
            <Field icon={Users} label="Catégorie" name="categorie" value={form.categorie} onChange={handleChange} />
            <Field icon={LinkIcon} label="Lien externe" name="lienExterne" value={form.lienExterne} onChange={handleChange} />
            <Field icon={Image} label="Image activité" name="imageActivite" value={form.imageActivite} onChange={handleChange} />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/10 bg-gray-50 p-4 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              name="isInternal"
              checked={form.isInternal}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300"
            />
            Activité interne au club
          </label>

          <div className="border-t border-black/5 pt-5">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}

export default AdminActiviteDetail;