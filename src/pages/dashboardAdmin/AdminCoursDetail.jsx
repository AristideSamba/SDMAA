import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

function getCoachsAffectes(cours) {
  if (cours?.coachs?.length > 0) {
    return cours.coachs;
  }

  return (cours?.affectationsCours || [])
    .filter((a) => a.statutAffectation !== "refusee")
    .map((a) => {
      const coach = a.coach;
      if (!coach) return "";

      return coach.nomComplet || `${coach.prenom || ""} ${coach.nom || ""}`.trim();
    })
    .filter(Boolean);
}

function AdminCoursDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pageTopRef = useRef(null);

  const [cours, setCours] = useState(null);
  const [coachs, setCoachs] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState("");

  const [form, setForm] = useState({
    titre: "",
    description: "",
    jour: "",
    heureDebut: "",
    heureFin: "",
    trancheAge: "",
    niveau: "",
    lieu: "",
    statutCours: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingCoach, setSavingCoach] = useState(false);

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

  const hydrateCours = (data) => {
    setCours(data);

    setForm({
      titre: data.titre || "",
      description: data.description || "",
      jour: data.jour || "",
      heureDebut: data.heureDebut ? String(data.heureDebut).slice(0, 5) : "",
      heureFin: data.heureFin ? String(data.heureFin).slice(0, 5) : "",
      trancheAge: data.trancheAge || "",
      niveau: data.niveau || "",
      lieu: data.lieu || "",
      statutCours: data.statutCours || "actif",
    });
  };

  const refreshCours = async () => {
    const res = await apiFetch(`http://localhost:8080/api/cours/${id}`);

    if (!res) return;

    if (!res.ok) {
      throw new Error("Impossible de recharger le cours.");
    }

    const data = await res.json();
    hydrateCours(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("");

        const [coursRes, usersRes] = await Promise.all([
          apiFetch(`http://localhost:8080/api/cours/${id}`),
          apiFetch("http://localhost:8080/api/utilisateurs"),
        ]);

        if (!coursRes || !usersRes) return;

        if (!coursRes.ok) {
          throw new Error("Impossible de charger le cours.");
        }

        if (!usersRes.ok) {
          throw new Error("Impossible de charger les coachs.");
        }

        const coursData = await coursRes.json();
        const usersData = await usersRes.json();

        hydrateCours(coursData);

        setCoachs(
          (usersData || []).filter(
            (user) =>
              String(user.role || "").toUpperCase().replace("ROLE_", "") ===
              "COACH"
          )
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const saveCours = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch(`http://localhost:8080/api/cours/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res?.json().catch(() => null);

      if (!res?.ok) {
        throw new Error(data?.message || "Erreur lors de la mise à jour.");
      }

      hydrateCours(data);
      setSuccess("Cours mis à jour avec succès.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const affecterCoach = async () => {
    if (!selectedCoach) {
      setError("Veuillez choisir un coach.");
      setSuccess("");
      return;
    }

    setSavingCoach(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch(
        `http://localhost:8080/api/affectations-cours?idCours=${id}&idCoach=${selectedCoach}`,
        {
          method: "POST",
        }
      );

      const data = await res?.json().catch(() => null);

      if (!res?.ok) {
        throw new Error(data?.message || "Erreur lors de l’affectation du coach.");
      }

      setSelectedCoach("");
      await refreshCours();

      setSuccess("Coach affecté au cours avec succès.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingCoach(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Chargement du cours...</p>;
  }

  const coachsAffectes = getCoachsAffectes(cours);

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
          {cours?.titre || "Modifier le cours"}
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
          Modifiez les informations du cours, ses horaires, son niveau et son
          statut.
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
              Mettez à jour les données principales du cours.
            </p>
          </div>
        </div>

        <form onSubmit={saveCours} className="space-y-5">
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
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-black/5 bg-white/85 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8">
        <div className="mb-6 flex items-start gap-4">
          <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-950">
            <Users size={20} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-950">
              Affecter un coach
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Associez un coach à ce cours. Les coachs affectés seront visibles
              sur le planning.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Coach
            </label>

            <select
              value={selectedCoach}
              onChange={(e) => setSelectedCoach(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-gray-950/10"
            >
              <option value="">Choisir un coach</option>
              {coachs.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.nomComplet} — {coach.email}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={affecterCoach}
            disabled={savingCoach}
            className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingCoach ? "Affectation..." : "Affecter le coach"}
          </button>

          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-700">
              Coachs affectés
            </p>

            {coachsAffectes.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {coachsAffectes.map((coach, index) => (
                  <span
                    key={`${coach}-${index}`}
                    className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm"
                  >
                    {coach}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">
                Aucun coach affecté pour le moment.
              </p>
            )}
          </div>
        </div>
      </section>
    </section>
  );
}

export default AdminCoursDetail;