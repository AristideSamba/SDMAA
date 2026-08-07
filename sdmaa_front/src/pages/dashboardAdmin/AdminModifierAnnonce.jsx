import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  AlertCircle,
  Archive,
  ArrowLeft,
  ImageIcon,
  Save,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://sdmaa.onrender.com/api"
).replace(/\/$/, "");

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

export default function AdminModifierAnnonce() {
  const navigate =
    useNavigate();

  const { id } =
    useParams();

  const pageTopRef =
    useRef(null);

  const fileInputRef =
    useRef(null);

  const [form, setForm] =
    useState({
      titre: "",
      contenu: "",
      statut: "BROUILLON",
    });

  const [
    currentImage,
    setCurrentImage,
  ] = useState(null);

  const [
    imageFile,
    setImageFile,
  ] = useState(null);

  const [
    imagePreview,
    setImagePreview,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    deletingImage,
    setDeletingImage,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

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
      response.status === 401 ||
      response.status === 403
    ) {
      localStorage.clear();

      navigate(
        "/login"
      );

      return null;
    }

    return response;
  };

  useEffect(() => {
    const fetchAnnonce =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await apiFetch(
              `${API_URL}/annonces/${id}`
            );

          if (!response) {
            return;
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
                "Impossible de charger l’annonce."
            );
          }

          setForm({
            titre:
              data?.titre ||
              "",

            contenu:
              data?.contenu ||
              "",

            statut:
              data?.statut ||
              "BROUILLON",
          });

          setCurrentImage(
            data?.imageUrl ||
              data?.image ||
              null
          );

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

  useEffect(() => {
    if (error) {
      pageTopRef.current
        ?.scrollIntoView({
          behavior:
            "smooth",
          block:
            "start",
        });
    }
  }, [error]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }
    };
  }, [imagePreview]);

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

    setImageFile(
      file
    );

    setImagePreview(
      preview
    );
  };

  const cancelSelectedImage =
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

  const uploadImage = async () => {
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
        `${API_URL}/annonces/${id}/image`,
        {
          method:
            "POST",

          body:
            formData,
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
          "Impossible d’envoyer l’image."
      );
    }

    setCurrentImage(
      data?.imageUrl ||
        data?.image ||
        null
    );

    cancelSelectedImage();

    return data;
  };

  const deleteImage = async () => {
    if (!currentImage) {
      return;
    }

    const confirmation =
      window.confirm(
        "Supprimer l’image de cette annonce ?"
      );

    if (!confirmation) {
      return;
    }

    try {
      setDeletingImage(
        true
      );

      setError("");

      const response =
        await apiFetch(
          `${API_URL}/annonces/${id}/image`,
          {
            method:
              "DELETE",
          }
        );

      if (!response) {
        return;
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
            "Impossible de supprimer l’image."
        );
      }

      setCurrentImage(
        null
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer l’image."
      );

    } finally {
      setDeletingImage(
        false
      );
    }
  };

  const saveAnnonce = async (
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
       * sauvegarde des informations.
       */
      const response =
        await apiFetch(
          `${API_URL}/annonces/${id}`,
          {
            method:
              "PUT",

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
            "Impossible de modifier l’annonce."
        );
      }

      /*
       * Étape 2 :
       * remplacement éventuel de l'image.
       */
      if (imageFile) {
        await uploadImage();
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

    } finally {
      setSubmitting(
        false
      );
    }
  };

  const changerStatut = async (
    action
  ) => {
    try {
      setSubmitting(
        true
      );

      setError("");

      const response =
        await apiFetch(
          `${API_URL}/annonces/${id}/${action}`,
          {
            method:
              "PUT",
          }
        );

      if (!response) {
        return;
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
            "Impossible de modifier le statut."
        );
      }

      setForm(
        (current) => ({
          ...current,

          statut:
            data?.statut ||
            (
              action ===
              "publier"
                ? "PUBLIEE"
                : "ARCHIVEE"
            ),
        })
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de modifier le statut."
      );

    } finally {
      setSubmitting(
        false
      );
    }
  };

  const supprimerAnnonce =
    async () => {
      const confirmation =
        window.confirm(
          "Supprimer définitivement cette annonce ?"
        );

      if (!confirmation) {
        return;
      }

      try {
        setSubmitting(
          true
        );

        setError("");

        const response =
          await apiFetch(
            `${API_URL}/annonces/${id}`,
            {
              method:
                "DELETE",
            }
          );

        if (!response) {
          return;
        }

        if (!response.ok) {
          const data =
            await response
              .json()
              .catch(
                () => null
              );

          throw new Error(
            data?.message ||
              data?.error ||
              "Impossible de supprimer l’annonce."
          );
        }

        navigate(
          "/dashboard/admin/annonces"
        );

      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de supprimer l’annonce."
        );

      } finally {
        setSubmitting(
          false
        );
      }
    };

  if (loading) {
    return (
      <p className="text-gray-500">
        Chargement de l’annonce...
      </p>
    );
  }

  const displayedImage =
    imagePreview ||
    currentImage;

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
            Modifier l’annonce
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
            Modifiez le contenu,
            l’image ou le statut de
            cette annonce.
          </p>
        </div>
      </header>

      {error && (
        <div className="flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <p>
            {error}
          </p>
        </div>
      )}

      <form
        onSubmit={
          saveAnnonce
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
              maxLength={150}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm text-gray-950 outline-none transition focus:border-black/20 focus:ring-2 focus:ring-gray-950/10"
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
              rows={10}
              className="mt-2 w-full resize-y rounded-3xl border border-black/10 bg-white px-4 py-4 text-sm leading-6 text-gray-950 outline-none transition focus:border-black/20 focus:ring-2 focus:ring-gray-950/10"
            />
          </div>

          {/* IMAGE */}

          <div>
            <p className="text-sm font-semibold text-gray-900">
              Image
            </p>

            <div className="mt-3 rounded-3xl border border-dashed border-black/15 bg-gray-50 p-5">

              {displayedImage ? (
                <div className="relative overflow-hidden rounded-3xl bg-gray-950">

                  <img
                    src={
                      displayedImage
                    }
                    alt="Image de l’annonce"
                    className="h-64 w-full object-cover sm:h-80"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                      <div className="min-w-0 text-white">

                        <div className="flex items-center gap-2">
                          <ImageIcon
                            size={16}
                          />

                          <p className="truncate text-sm font-medium">
                            {imageFile
                              ? imageFile.name
                              : "Image actuelle"}
                          </p>
                        </div>

                        {imageFile && (
                          <p className="mt-1 text-xs text-white/70">
                            {(
                              imageFile.size /
                              1024 /
                              1024
                            ).toFixed(
                              2
                            )}{" "}
                            Mo
                          </p>
                        )}

                      </div>

                      <div className="flex flex-wrap gap-2">

                        {imagePreview && (
                          <button
                            type="button"
                            onClick={
                              cancelSelectedImage
                            }
                            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/25"
                          >
                            <X
                              size={15}
                            />

                            Annuler
                          </button>
                        )}

                        {!imagePreview &&
                          currentImage && (
                            <button
                              type="button"
                              onClick={
                                deleteImage
                              }
                              disabled={
                                deletingImage
                              }
                              className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-red-600/90 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2
                                size={15}
                              />

                              {deletingImage
                                ? "Suppression..."
                                : "Supprimer l’image"}
                            </button>
                          )}

                      </div>

                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl bg-white p-6 text-center">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                    <ImageIcon
                      size={21}
                    />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-gray-900">
                    Aucune image
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Ajoutez une image
                    pour illustrer cette
                    annonce.
                  </p>

                </div>
              )}

              <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50">

                <Upload
                  size={16}
                />

                {currentImage
                  ? "Remplacer l’image"
                  : "Ajouter une image"}

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

              <p className="mt-3 text-center text-xs text-gray-400">
                JPG, PNG ou WEBP —
                maximum 5 Mo.
              </p>

            </div>
          </div>

          {/* STATUT */}

          <div className="rounded-3xl bg-gray-50 p-5">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Statut actuel
            </p>

            <p className="mt-2 text-lg font-semibold text-gray-950">
              {form.statut}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">

              {form.statut !==
                "PUBLIEE" && (
                  <button
                    type="button"
                    disabled={
                      submitting
                    }
                    onClick={() =>
                      changerStatut(
                        "publier"
                      )
                    }
                    className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-green-100 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send
                      size={15}
                    />

                    Publier
                  </button>
                )}

              {form.statut ===
                "PUBLIEE" && (
                  <button
                    type="button"
                    disabled={
                      submitting
                    }
                    onClick={() =>
                      changerStatut(
                        "archiver"
                      )
                    }
                    className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Archive
                      size={15}
                    />

                    Archiver
                  </button>
                )}

            </div>
          </div>

        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-black/5 pt-6 sm:flex-row sm:justify-between">

          <button
            type="button"
            disabled={
              submitting
            }
            onClick={
              supprimerAnnonce
            }
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2
              size={16}
            />

            Supprimer
          </button>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">

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
                submitting ||
                deletingImage
              }
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save
                size={16}
              />

              {submitting
                ? imageFile
                  ? "Enregistrement et upload..."
                  : "Enregistrement..."
                : "Enregistrer"}
            </button>

          </div>
        </div>
      </form>
    </section>
  );
}