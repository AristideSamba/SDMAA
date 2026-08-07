import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Save,
  Send,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080/api"
).replace(/\/$/, "");

const INITIAL_FORM = {
  titre: "",
  contenu: "",
  statut: "BROUILLON",
};

export default function AdminNouvelleAnnonce() {
  const navigate = useNavigate();
  const pageTopRef = useRef(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.clear();
      navigate("/login");
      return null;
    }

    return response;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.titre.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }

    if (!form.contenu.trim()) {
      setError("Le contenu est obligatoire.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await apiFetch(
        `${API_URL}/annonces`,
        {
          method: "POST",
          body: JSON.stringify({
            titre: form.titre.trim(),
            contenu: form.contenu.trim(),
            statut: form.statut,
          }),
        }
      );

      if (!response) return;

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Impossible de créer l’annonce."
        );
      }

      navigate("/dashboard/admin/annonces");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );

      pageTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section ref={pageTopRef} className="space-y-8">
      <header className="rounded-[28px] border border-black/5 bg-white px-6 py-8 shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:px-10 sm:py-10">
        <button
          type="button"
          onClick={() =>
            navigate("/dashboard/admin/annonces")
          }
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-950"
        >
          <ArrowLeft size={16} />
          Retour aux annonces
        </button>

        <div className="mt-7">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
            Administration
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Nouvelle annonce
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
            Publiez une information concernant la vie du club.
          </p>
        </div>
      </header>

      {error && (
        <div className="flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />
          <p>{error}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8"
      >
        <div className="grid gap-7">
          <div>
            <label
              htmlFor="titre"
              className="text-sm font-semibold text-gray-900"
            >
              Titre
            </label>

            <input
              id="titre"
              value={form.titre}
              onChange={(event) =>
                updateField("titre", event.target.value)
              }
              placeholder="Ex. Passage de grade de juin"
              maxLength={150}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-black/20 focus:ring-2 focus:ring-gray-950/10"
            />
          </div>

          <div>
            <label
              htmlFor="contenu"
              className="text-sm font-semibold text-gray-900"
            >
              Contenu
            </label>

            <textarea
              id="contenu"
              value={form.contenu}
              onChange={(event) =>
                updateField("contenu", event.target.value)
              }
              placeholder="Rédigez l’annonce..."
              rows={10}
              className="mt-2 w-full resize-y rounded-3xl border border-black/10 bg-white px-4 py-4 text-sm leading-6 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-black/20 focus:ring-2 focus:ring-gray-950/10"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">
              Statut
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <StatusChoice
                active={form.statut === "BROUILLON"}
                icon={Save}
                title="Brouillon"
                description="Enregistrer sans prévenir les adhérents."
                onClick={() =>
                  updateField("statut", "BROUILLON")
                }
              />

              <StatusChoice
                active={form.statut === "PUBLIEE"}
                icon={Send}
                title="Publier"
                description="Publier immédiatement et envoyer les notifications."
                onClick={() =>
                  updateField("statut", "PUBLIEE")
                }
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-black/5 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard/admin/annonces")
            }
            className="cursor-pointer rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {form.statut === "PUBLIEE" ? (
              <Send size={16} />
            ) : (
              <Save size={16} />
            )}

            {submitting
              ? "Enregistrement..."
              : form.statut === "PUBLIEE"
                ? "Publier l’annonce"
                : "Enregistrer le brouillon"}
          </button>
        </div>
      </form>
    </section>
  );
}

function StatusChoice({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-3xl border p-5 text-left transition ${
        active
          ? "border-gray-950 bg-gray-950 text-white shadow-lg"
          : "border-black/10 bg-white text-gray-950 hover:bg-gray-50"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
          active
            ? "bg-white/10"
            : "bg-gray-100"
        }`}
      >
        <Icon size={17} />
      </div>

      <p className="mt-4 font-semibold">
        {title}
      </p>

      <p
        className={`mt-2 text-sm leading-6 ${
          active
            ? "text-white/70"
            : "text-gray-500"
        }`}
      >
        {description}
      </p>
    </button>
  );
}
