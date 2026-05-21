import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const formatDate = (date) => {
  if (!date) return "Date non renseignée";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const normalizeActivite = (item) => ({
  id: item.idActivite || item.id,
  titre: item.titre || item.nom || "Activité",
  description: item.description || "",
  date: item.dateActivite || item.date || item.dateDebut,
  lieu: item.lieu || item.adresse || "Lieu non renseigné",
  typeActivite: item.typeActivite,
  prix: item.prix ?? item.tarif ?? 0,
  duree: item.duree || "Durée non renseignée",
  lien:
    item.lienInscription ||
    item.urlInscription ||
    item.lienActivite ||
    item.lien ||
    item.url ||
    "",
});

function InputField({
  label,
  id,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  disabled = false,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-gray-900/10 disabled:bg-gray-100 disabled:text-gray-500"
      />
    </div>
  );
}

function DashboardActivityRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [activity, setActivity] = useState(
    location.state?.activite ? normalizeActivite(location.state.activite) : null
  );

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    commentaire: "",
  });

  const [loading, setLoading] = useState(!location.state?.activite);
  const [submitting, setSubmitting] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState("");
  const [error, setError] = useState("");

  const isPaid = Number(activity?.prix || 0) > 0;

  useEffect(() => {
    window.scrollTo(0, 0);

    const token = localStorage.getItem("token");

    const apiFetch = async (url, options = {}) => {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("idUtilisateur");
        navigate("/connexion");
        return null;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Erreur API");
      }

      return res.json().catch(() => null);
    };

    const fetchData = async () => {
      try {
        const [me, activiteData] = await Promise.all([
          apiFetch("http://localhost:8080/api/me"),
          activity
            ? Promise.resolve(activity)
            : apiFetch(`http://localhost:8080/api/activites/${id}`),
        ]);

        if (me) {
          setForm((prev) => ({
            ...prev,
            nom: me.nom || "",
            prenom: me.prenom || "",
            email: me.email || "",
            telephone: me.telephone || "",
          }));
        }

        if (activiteData) {
          const normalized = normalizeActivite(activiteData);

          if (normalized.lien) {
            navigate("/dashboard/activites");
            return;
          }

          setActivity(normalized);
        }
      } catch (err) {
        setError(err.message || "Impossible de charger l’activité.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  if (loading) {
    return <p className="text-gray-500">Chargement de l’activité...</p>;
  }

  if (!activity) {
    return (
      <section className="space-y-6">
        <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 px-6 py-12 text-center text-gray-500">
          Activité introuvable.
        </div>
      </section>
    );
  }

  const validate = () => {
    if (!form.nom || !form.prenom || !form.email) {
      return "Le nom, le prénom et l’email sont obligatoires.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return "Veuillez saisir une adresse email valide.";
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
  `http://localhost:8080/api/inscriptions-activites/me?idActivite=${activity.id}&commentaire=${encodeURIComponent(form.commentaire || "")}`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      const data = await res.json().catch(() => null);

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("idUtilisateur");
        navigate("/connexion");
        return;
      }

      if (!res.ok) {
        throw new Error(data?.message || "Erreur lors de l’inscription.");
      }

      setSubmittedStatus(
        Number(activity.prix) > 0 ? "EN_ATTENTE_PAIEMENT" : "DEMANDE_ENVOYEE"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-8">
      {/* HERO */}
      <div className="rounded-[28px] border border-black/5 bg-gray-950 px-8 py-8 text-white shadow-[0_16px_50px_rgba(0,0,0,0.12)] sm:px-10 sm:py-10">
        <button
          type="button"
          onClick={() => navigate("/dashboard/activites")}
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-300 transition hover:text-white"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Retour aux activités
        </button>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
          Inscription
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          {activity.titre}
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
          Remplissez le formulaire ci-dessous pour envoyer votre demande
          d’inscription à cette activité du club.
        </p>
        
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {submittedStatus ? (
        <section className="rounded-3xl border border-black/5 bg-white/85 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-700">
              <CheckCircle2 size={24} aria-hidden="true" />
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-gray-950">
              Demande envoyée
            </h2>

            <p className="mt-4 text-base leading-7 text-gray-600">
              {submittedStatus === "EN_ATTENTE_PAIEMENT"
                ? "Votre demande a bien été enregistrée. Le paiement doit maintenant être effectué en espèces auprès du responsable. L’inscription sera confirmée après validation par l’administration."
                : "Votre demande a bien été enregistrée. Elle sera validée par l’administration du club."}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => navigate("/dashboard/activites")}
                className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black"
              >
                Retour aux activités
              </button>
            </div>
          </div>
        </section>
      ) : (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* FORM */}
          <section className="rounded-3xl border border-black/5 bg-white/85 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
                Formulaire
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                Vos informations
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
                Vérifiez vos coordonnées avant d’envoyer votre demande.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Nom"
                  id="nom"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                  disabled
                />

                <InputField
                  label="Prénom"
                  id="prenom"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  required
                  disabled
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Email"
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled
                />

                <InputField
                  label="Téléphone"
                  id="telephone"
                  name="telephone"
                  value={form.telephone}
                  onChange={handleChange}
                  disabled
                />
              </div>

              <div>
                <label
                  htmlFor="commentaire"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Commentaire
                </label>

                <textarea
                  id="commentaire"
                  name="commentaire"
                  rows={5}
                  value={form.commentaire}
                  onChange={handleChange}
                  placeholder="Informations complémentaires, disponibilité, remarque éventuelle..."
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-gray-900/10"
                />
              </div>

              <div className="border-t border-black/5 pt-5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Envoi en cours..." : "Envoyer ma demande"}
                </button>
              </div>
            </form>
          </section>

          {/* SIDEBAR */}
          <aside className="h-fit rounded-3xl border border-black/5 bg-white/85 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] xl:sticky xl:top-24">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
                Récapitulatif
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                Détails de l’activité
              </h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CalendarDays size={16} aria-hidden="true" />
                  <span>{formatDate(activity.date)}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={16} aria-hidden="true" />
                  <span>{activity.lieu}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock3 size={16} aria-hidden="true" />
                  <span>{activity.duree}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white p-4">
                <p className="text-sm text-gray-500">Tarif</p>
                <p className="mt-1 text-lg font-semibold text-gray-950">
                  {isPaid ? `${activity.prix} €` : "Gratuit"}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm leading-6 text-gray-600">
                  {isPaid
                    ? "Le paiement s’effectue en espèces auprès du responsable. L’inscription sera confirmée après validation par l’administration."
                    : "Cette activité est gratuite. Votre inscription sera confirmée après validation par l’administration."}
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

export default DashboardActivityRegistration;