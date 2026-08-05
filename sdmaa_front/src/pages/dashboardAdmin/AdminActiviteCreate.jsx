import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Euro,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  MapPin,
  Trophy,
  Upload,
  Users,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080/api"
).replace(/\/$/, "");

const initialForm = {
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
  discipline: "",
  categorie: "",
};

function Field({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  type = "text",
  min,
  step,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <div className="relative">
        <Icon
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          id={name}
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          min={min}
          step={step}
          required={required}
          className="w-full rounded-2xl border border-black/10 bg-white py-3 pl-11 pr-4 text-gray-900 outline-none transition focus:ring-2 focus:ring-gray-950/10"
        />
      </div>
    </div>
  );
}

function AdminActiviteCreate() {
  const navigate = useNavigate();
  const pageTopRef = useRef(null);
  const fileInputRef = useRef(null);

  const [form, setForm] =
    useState(initialForm);

  const [imageFile, setImageFile] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    if (success || error) {
      pageTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [success, error]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }
    };
  }, [imagePreview]);

  const apiFetch = async (
    url,
    options = {}
  ) => {
    const isFormData =
      options.body instanceof FormData;

    const token =
      localStorage.getItem("token");

    const response = await fetch(url, {
      ...options,

      headers: {
        ...(!isFormData
          ? {
              "Content-Type":
                "application/json",
            }
          : {}),

        ...(options.headers || {}),

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    });

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem(
        "idUtilisateur"
      );

      navigate("/login");

      return null;
    }

    return response;
  };

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleImageChange = (
    event
  ) => {
    const fichier =
      event.target.files?.[0] ||
      null;

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setImageFile(fichier);

    setImagePreview(
      fichier
        ? URL.createObjectURL(fichier)
        : ""
    );
  };

  const validate = () => {
    if (!form.titre.trim()) {
      return "Le titre est obligatoire.";
    }

    if (!form.dateActivite) {
      return "La date est obligatoire.";
    }

    if (!form.heureDebut) {
      return "L’heure de début est obligatoire.";
    }

    if (!form.heureFin) {
      return "L’heure de fin est obligatoire.";
    }

    if (
      form.heureDebut >= form.heureFin
    ) {
      return "L’heure de fin doit être après l’heure de début.";
    }

    if (!form.dureeActivite.trim()) {
      return "La durée est obligatoire.";
    }

    if (!form.lieu.trim()) {
      return "Le lieu est obligatoire.";
    }

    if (!form.typeActivite.trim()) {
      return "Le type d’activité est obligatoire.";
    }

    if (!form.discipline.trim()) {
      return "La discipline est obligatoire.";
    }

    if (!form.categorie.trim()) {
      return "La catégorie est obligatoire.";
    }

    if (!imageFile) {
      return "L’image de l’activité est obligatoire.";
    }

    if (
      form.prix !== "" &&
      Number(form.prix) < 0
    ) {
      return "Le prix ne peut pas être négatif.";
    }

    if (
      form.capaciteMax !== "" &&
      Number(form.capaciteMax) < 1
    ) {
      return "La capacité maximale doit être supérieure à zéro.";
    }

    if (
      !form.isInternal &&
      !form.lienExterne.trim()
    ) {
      return "Le lien externe est obligatoire pour une activité externe.";
    }

    return "";
  };

  const buildPayload = () => ({
    titre: form.titre.trim(),

    description:
      form.description.trim() ||
      null,

    dateActivite:
      form.dateActivite,

    heureDebut:
      form.heureDebut,

    heureFin:
      form.heureFin,

    dureeActivite:
      form.dureeActivite.trim(),

    lieu: form.lieu.trim(),

    prix:
      form.prix === ""
        ? 0
        : Number(form.prix),

    capaciteMax:
      form.capaciteMax === ""
        ? null
        : Number(
            form.capaciteMax
          ),

    isInternal: Boolean(
      form.isInternal
    ),

    typeActivite:
      form.typeActivite.trim(),

    lienExterne:
      form.isInternal
        ? null
        : form.lienExterne.trim(),

    discipline:
      form.discipline.trim(),

    categorie:
      form.categorie.trim(),
  });

  const uploadActiviteImage =
    async (
      activiteId,
      fichier
    ) => {
      const formData = new FormData();

      formData.append(
        "image",
        fichier
      );

      const response = await apiFetch(
        `${API_URL}/activites/${activiteId}/image`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response) {
        return null;
      }

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Impossible d’envoyer l’image de l’activité."
        );
      }

      return data;
    };

  const createActivite = async (
    event
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    const validationError =
      validate();

    if (validationError) {
      setError(validationError);
      setSuccess("");

      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch(
        `${API_URL}/activites`,
        {
          method: "POST",

          body: JSON.stringify(
            buildPayload()
          ),
        }
      );

      if (!response) {
        return;
      }

      const activiteCree =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          activiteCree?.message ||
            activiteCree?.error ||
            "Erreur lors de la création de l’activité."
        );
      }

      if (!activiteCree?.id) {
        throw new Error(
          "L’identifiant de l’activité créée est absent."
        );
      }

      await uploadActiviteImage(
        activiteCree.id,
        imageFile
      );

      setSuccess(
        "Activité et image créées avec succès."
      );

      setForm(initialForm);
      setImageFile(null);

      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }

      setImagePreview("");

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      setTimeout(() => {
        navigate(
          "/dashboard/admin/activites"
        );
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue pendant la création."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      ref={pageTopRef}
      className="space-y-8"
    >
      <header className="rounded-[28px] border border-black/5 bg-white px-6 py-8 text-gray-950 shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:px-10 sm:py-10">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/dashboard/admin/activites"
            )
          }
          className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-950"
        >
          <ArrowLeft size={16} />

          Retour aux activités
        </button>

        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
          Administration
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Créer une activité
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
          Ajoutez une nouvelle activité,
          compétition ou événement au
          planning du club.
        </p>
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

      {success && (
        <div className="flex items-start gap-3 rounded-3xl border border-green-100 bg-green-50 p-5 text-sm text-green-700">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0"
          />

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
              Renseignez les informations
              visibles par les adhérents.
            </p>
          </div>
        </div>

        <form
          onSubmit={createActivite}
          className="space-y-5"
        >
          <Field
            icon={FileText}
            label="Titre"
            name="titre"
            value={form.titre}
            onChange={handleChange}
            required
          />

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={5}
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-gray-950/10"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              icon={CalendarDays}
              label="Date"
              name="dateActivite"
              type="date"
              value={
                form.dateActivite
              }
              onChange={handleChange}
              required
            />

            <Field
              icon={MapPin}
              label="Lieu"
              name="lieu"
              value={form.lieu}
              onChange={handleChange}
              required
            />

            <Field
              icon={Clock3}
              label="Heure début"
              name="heureDebut"
              type="time"
              value={form.heureDebut}
              onChange={handleChange}
              required
            />

            <Field
              icon={Clock3}
              label="Heure fin"
              name="heureFin"
              type="time"
              value={form.heureFin}
              onChange={handleChange}
              required
            />

            <Field
              icon={Clock3}
              label="Durée"
              name="dureeActivite"
              value={
                form.dureeActivite
              }
              onChange={handleChange}
              required
            />

            <Field
              icon={Euro}
              label="Prix"
              name="prix"
              type="number"
              min="0"
              step="0.01"
              value={form.prix}
              onChange={handleChange}
            />

            <Field
              icon={Users}
              label="Capacité max"
              name="capaciteMax"
              type="number"
              min="1"
              value={form.capaciteMax}
              onChange={handleChange}
            />

            <Field
              icon={Trophy}
              label="Type d’activité"
              name="typeActivite"
              value={
                form.typeActivite
              }
              onChange={handleChange}
              required
            />

            <Field
              icon={Trophy}
              label="Discipline"
              name="discipline"
              value={form.discipline}
              onChange={handleChange}
              required
            />

            <Field
              icon={Users}
              label="Catégorie"
              name="categorie"
              value={form.categorie}
              onChange={handleChange}
              required
            />

            {!form.isInternal && (
              <Field
                icon={LinkIcon}
                label="Lien externe"
                name="lienExterne"
                type="url"
                value={
                  form.lienExterne
                }
                onChange={handleChange}
                required
              />
            )}
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

          <div className="rounded-3xl border border-dashed border-black/15 bg-gray-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-gray-700 shadow-sm">
                <ImageIcon
                  size={20}
                />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Image de l’activité
                </h3>

                <p className="text-sm text-gray-500">
                  JPG, PNG ou WEBP —
                  maximum 5 Mo.
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                handleImageChange
              }
              className="mt-5 block w-full text-sm text-gray-500 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-gray-950 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-black"
            />

            {imageFile && (
              <p className="mt-3 text-sm font-medium text-green-700">
                Fichier sélectionné :{" "}
                {imageFile.name}
              </p>
            )}

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Aperçu de l’activité"
                className="mt-5 h-48 w-full rounded-2xl object-cover sm:max-w-md"
              />
            )}
          </div>

          <div className="border-t border-black/5 pt-5">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload size={16} />

              {saving
                ? "Création et envoi de l’image..."
                : "Créer l’activité"}
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}

export default AdminActiviteCreate;