import {
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  ImageIcon,
  Save,
  Send,
  Upload,
  X,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://sdmaa.onrender.com/api"
).replace(/\/$/, "");

const INITIAL_FORM = {
  titre: "",
  contenu: "",
  statut: "BROUILLON",
};

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

export default function AdminNouvelleAnnonce() {
  const navigate =
    useNavigate();

  const pageTopRef =
    useRef(null);

  const fileInputRef =
    useRef(null);

  const [
    form,
    setForm,
  ] = useState(
    INITIAL_FORM
  );

  const [
    imageFile,
    setImageFile,
  ] = useState(null);

  const [
    imagePreview,
    setImagePreview,
  ] = useState(null);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const updateField = (
    field,
    value
  ) => {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };

  /**
   * Requête générique.
   *
   * Le Content-Type n'est pas ajouté
   * automatiquement lorsqu'on envoie
   * un FormData.
   */
  const apiFetch = async (
    url,
    options = {}
  ) => {
    const token =
      localStorage.getItem(
        "token"
      );

    const isFormData =
      options.body
        instanceof FormData;

    const response =
      await fetch(
        url,
        {
          ...options,

          headers: {
            ...(
              !isFormData
                ? {
                    "Content-Type":
                      "application/json",
                  }
                : {}
            ),

            ...(
              options.headers ||
              {}
            ),

            ...(
              token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}
            ),
          },
        }
      );

    if (
      response.status ===
        401 ||
      response.status ===
        403
    ) {
      localStorage.clear();

      navigate(
        "/login"
      );

      return null;
    }

    return response;
  };

  const handleImageChange = (
    event
  ) => {
    const file =
      event.target
        .files?.[0];

    if (!file) {
      return;
    }

    setError("");

    if (
      !ACCEPTED_IMAGE_TYPES
        .includes(file.type)
    ) {
      setError(
        "Format non accepté. Utilisez une image JPG, PNG ou WEBP."
      );

      event.target.value =
        "";

      return;
    }

    if (
      file.size >
      MAX_IMAGE_SIZE
    ) {
      setError(
        "L’image ne doit pas dépasser 5 Mo."
      );

      event.target.value =
        "";

      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    const preview =
      URL.createObjectURL(
        file
      );

    setImageFile(file);
    setImagePreview(
      preview
    );
  };

  const removeSelectedImage =
    () => {
      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }

      setImageFile(null);
      setImagePreview(null);

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    };

  const uploadImage = async (
    annonceId
  ) => {
    if (!imageFile) {
      return null;
    }

    const formData =
      new FormData();

    formData.append(
      "image",
      imageFile
    );

    const response =
      await apiFetch(
        `${API_URL}/annonces/${annonceId}/image`,
        {
          method: "POST",
          body: formData,
        }
      );

    if (!response) {
      return null;
    }

    const data =
      await response
        .json()
        .catch(
          () => null
        );

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          "L’annonce a été créée, mais l’image n’a pas pu être envoyée."
      );
    }

    return data;
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (
      !form.titre.trim()
    ) {
      setError(
        "Le titre est obligatoire."
      );

      return;
    }

    if (
      !form.contenu.trim()
    ) {
      setError(
        "Le contenu est obligatoire."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");

      /*
       * Étape 1 :
       * création de l'annonce.
       */
      const response =
        await apiFetch(
          `${API_URL}/annonces`,
          {
            method: "POST",

            body:
              JSON.stringify(
                {
                  titre:
                    form.titre
                      .trim(),

                  contenu:
                    form.contenu
                      .trim(),

                  statut:
                    form.statut,
                }
              ),
          }
        );

      if (!response) {
        return;
      }

      const annonceCreee =
        await response
          .json()
          .catch(
            () => null
          );

      if (!response.ok) {
        throw new Error(
          annonceCreee?.message ||
            annonceCreee?.error ||
            "Impossible de créer l’annonce."
        );
      }

      const annonceId =
        annonceCreee?.id;

      if (!annonceId) {
        throw new Error(
          "L’annonce a été créée mais son identifiant est introuvable."
        );
      }

      /*
       * Étape 2 :
       * upload Cloudinary
       * uniquement si une image
       * a été sélectionnée.
       */
      if (imageFile) {
        await uploadImage(
          annonceId
        );
      }

      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }

      navigate(
        "/dashboard/admin/annonces"
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );

      pageTopRef.current
        ?.scrollIntoView({
          behavior:
            "smooth",

          block:
            "start",
        });

    } finally {
      setSubmitting(
        false
      );
    }
  };

  return (
    <section
      ref={pageTopRef}
      className="space-y-8"
    >
      <header className="rounded-[28px] border border-black/5 bg-white px-6 py-8 shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:px-10 sm:py-10">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/dashboard/admin/annonces"
            )
          }
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-950"
        >
          <ArrowLeft
            size={16}
          />

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
            Publiez une information
            concernant la vie du club.
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
        onSubmit={
          handleSubmit
        }
        className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8"
      >
        <div className="grid gap-7">

          {/* TITRE */}

          <div>
            <label
              htmlFor="titre"
              className="text-sm font-semibold text-gray-900"
            >
              Titre
            </label>

            <input
              id="titre"
              value={
                form.titre
              }
              onChange={(
                event
              ) =>
                updateField(
                  "titre",
                  event.target
                    .value
                )
              }
              placeholder="Ex. Passage de grade de juin"
              maxLength={150}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-black/20 focus:ring-2 focus:ring-gray-950/10"
            />
          </div>

          {/* CONTENU */}

          <div>
            <label
              htmlFor="contenu"
              className="text-sm font-semibold text-gray-900"
            >
              Contenu
            </label>

            <textarea
              id="contenu"
              value={
                form.contenu
              }
              onChange={(
                event
              ) =>
                updateField(
                  "contenu",
                  event.target
                    .value
                )
              }
              placeholder="Rédigez l’annonce..."
              rows={10}
              className="mt-2 w-full resize-y rounded-3xl border border-black/10 bg-white px-4 py-4 text-sm leading-6 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-black/20 focus:ring-2 focus:ring-gray-950/10"
            />
          </div>

          {/* IMAGE */}

          <div>
            <p className="text-sm font-semibold text-gray-900">
              Image
            </p>

            <div className="mt-3 rounded-3xl border border-dashed border-black/15 bg-gray-50 p-5">

              {!imagePreview ? (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl px-4 py-8 text-center transition hover:bg-gray-100">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-700 shadow-sm">
                    <Upload
                      size={20}
                    />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-gray-900">
                    Ajouter une image
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    JPG, PNG ou WEBP
                    — maximum 5 Mo
                  </p>

                  <input
                    ref={
                      fileInputRef
                    }
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleImageChange
                    }
                    className="hidden"
                  />

                </label>
              ) : (
                <div className="relative overflow-hidden rounded-3xl bg-gray-950">

                  <img
                    src={
                      imagePreview
                    }
                    alt="Aperçu de l’annonce"
                    className="h-64 w-full object-cover sm:h-80"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">

                    <div className="flex items-end justify-between gap-4">

                      <div className="min-w-0 text-white">

                        <div className="flex items-center gap-2">
                          <ImageIcon
                            size={16}
                          />

                          <p className="truncate text-sm font-medium">
                            {
                              imageFile
                                ?.name
                            }
                          </p>
                        </div>

                        <p className="mt-1 text-xs text-white/70">
                          {imageFile
                            ? `${(
                                imageFile.size /
                                1024 /
                                1024
                              ).toFixed(
                                2
                              )} Mo`
                            : ""}
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={
                          removeSelectedImage
                        }
                        className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
                        aria-label="Retirer l'image"
                      >
                        <X
                          size={18}
                        />
                      </button>

                    </div>

                  </div>

                </div>
              )}

            </div>
          </div>

          {/* STATUT */}

          <div>
            <p className="text-sm font-semibold text-gray-900">
              Statut
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">

              <StatusChoice
                active={
                  form.statut ===
                  "BROUILLON"
                }
                icon={Save}
                title="Brouillon"
                description="Enregistrer sans prévenir les adhérents."
                onClick={() =>
                  updateField(
                    "statut",
                    "BROUILLON"
                  )
                }
              />

              <StatusChoice
                active={
                  form.statut ===
                  "PUBLIEE"
                }
                icon={Send}
                title="Publier"
                description="Publier immédiatement et envoyer les notifications."
                onClick={() =>
                  updateField(
                    "statut",
                    "PUBLIEE"
                  )
                }
              />

            </div>
          </div>

        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-black/5 pt-6 sm:flex-row sm:justify-end">

          <button
            type="button"
            disabled={
              submitting
            }
            onClick={() =>
              navigate(
                "/dashboard/admin/annonces"
              )
            }
            className="cursor-pointer rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={
              submitting
            }
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {form.statut ===
            "PUBLIEE" ? (
              <Send
                size={16}
              />
            ) : (
              <Save
                size={16}
              />
            )}

            {submitting
              ? imageFile
                ? "Enregistrement et upload..."
                : "Enregistrement..."
              : form.statut ===
                  "PUBLIEE"
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
      onClick={
        onClick
      }
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
        <Icon
          size={17}
        />
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