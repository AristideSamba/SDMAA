import { useEffect, useRef, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  AlertCircle,
  Archive,
  ArrowLeft,
  Save,
  Send,
  Trash2,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080/api"
).replace(/\/$/, "");

export default function AdminModifierAnnonce() {
  const navigate = useNavigate();
  const { id } = useParams();
  const pageTopRef = useRef(null);

  const [form, setForm] = useState({
    titre: "",
    contenu: "",
    statut: "BROUILLON",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiFetch(
          `${API_URL}/annonces/${id}`
        );

        if (!response) return;

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Impossible de charger l’annonce."
          );
        }

        setForm({
          titre: data?.titre || "",
          contenu: data?.contenu || "",
          statut: data?.statut || "BROUILLON",
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnnonce();
  }, [id]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveAnnonce = async (event) => {
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
        `${API_URL}/annonces/${id}`,
        {
          method: "PUT",
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
            "Impossible de modifier l’annonce."
        );
      }

      navigate("/dashboard/admin/annonces");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const changerStatut = async (action) => {
    try {
      setSubmitting(true);
      setError("");

      const response = await apiFetch(
        `${API_URL}/annonces/${id}/${action}`,
        { method: "PUT" }
      );

      if (!response) return;

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Impossible de modifier le statut."
        );
      }

      setForm((current) => ({
        ...current,
        statut:
          data?.statut ||
          (
            action === "publier"
              ? "PUBLIEE"
              : "ARCHIVEE"
          ),
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de modifier le statut."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const supprimerAnnonce = async () => {
    if (!window.confirm("Supprimer définitivement cette annonce ?")) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await apiFetch(
        `${API_URL}/annonces/${id}`,
        { method: "DELETE" }
      );

      if (!response) return;

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.message ||
            data?.error ||
            "Impossible de supprimer l’annonce."
        );
      }

      navigate("/dashboard/admin/annonces");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer l’annonce."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <p className="text-gray-500">
        Chargement de l’annonce...
      </p>
    );
  }

  return (
    <section
      ref={pageTopRef}
      className="space-y-8"
    >
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
            Modifier l’annonce
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
            Modifiez le contenu ou le statut de cette annonce.
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
        onSubmit={saveAnnonce}
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
              maxLength={150}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm text-gray-950 outline-none transition focus:border-black/20 focus:ring-2 focus:ring-gray-950/10"
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
              rows={10}
              className="mt-2 w-full resize-y rounded-3xl border border-black/10 bg-white px-4 py-4 text-sm leading-6 text-gray-950 outline-none transition focus:border-black/20 focus:ring-2 focus:ring-gray-950/10"
            />
          </div>

          <div className="rounded-3xl bg-gray-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Statut actuel
            </p>

            <p className="mt-2 text-lg font-semibold text-gray-950">
              {form.statut}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              {form.statut !== "PUBLIEE" && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    changerStatut("publier")
                  }
                  className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-green-100 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={15} />
                  Publier
                </button>
              )}

              {form.statut === "PUBLIEE" && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    changerStatut("archiver")
                  }
                  className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Archive size={15} />
                  Archiver
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-black/5 pt-6 sm:flex-row sm:justify-between">
          <button
            type="button"
            disabled={submitting}
            onClick={supprimerAnnonce}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={16} />
            Supprimer
          </button>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
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
              <Save size={16} />

              {submitting
                ? "Enregistrement..."
                : "Enregistrer"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
