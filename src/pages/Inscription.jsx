"use client";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  MapPin,
  User,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const initialForm = {
  genre: "",
  nom: "",
  prenom: "",
  email: "",
  motDePasse: "",
  dateNaissance: "",
  telephone: "",
  niveau: "",
  numero: "",
  rue: "",
  ville: "",
  codePostal: "",
  departement: "",
};

const validators = {
  nom: (value) =>
    /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,50}$/.test(value.trim())
      ? ""
      : "Le nom doit contenir entre 2 et 50 caractères valides.",

  prenom: (value) =>
    /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,50}$/.test(value.trim())
      ? ""
      : "Le prénom doit contenir entre 2 et 50 caractères valides.",

  email: (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
      ? ""
      : "Veuillez saisir une adresse email valide.",

  telephone: (value) =>
    /^(?:(?:\+33|0033)\s?[1-9](?:[\s.-]?\d{2}){4}|0[1-9](?:[\s.-]?\d{2}){4})$/.test(
      value.trim()
    )
      ? ""
      : "Veuillez saisir un numéro français valide.",

  motDePasse: (value) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{13,}$/.test(value)
      ? ""
      : "13 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.",

  dateNaissance: (value) =>
    value ? "" : "La date de naissance est obligatoire.",

  niveau: (value) => (value ? "" : "Veuillez choisir un niveau."),

  codePostal: (value) =>
    !value || /^[0-9]{5}$/.test(value.trim())
      ? ""
      : "Le code postal doit contenir 5 chiffres.",
};

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  className = "",
  autoComplete = "off",
  error = "",
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className={[
          "w-full rounded-2xl border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition",
          error
            ? "border-red-300 focus:border-red-300 focus:ring-2 focus:ring-red-100"
            : "border-black/10 focus:border-[#800020]/30 focus:ring-2 focus:ring-[#800020]/10",
        ].join(" ")}
      />

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Inscription() {
  const navigate = useNavigate();
  const location = useLocation();
  const abonnement = location.state;
  const fraisInscription = 75;

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [open, setOpen] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validateField = (name, value) => {
    if (!validators[name]) return "";
    return validators[name](value || "");
  };

  const validateAllFields = () => {
    const nextErrors = {};

    Object.keys(validators).forEach((key) => {
      const message = validators[key](form[key] || "");
      if (message) nextErrors[key] = message;
    });

    return nextErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validators[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    if (validators[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const markAllAsTouched = (fields) => {
    const nextTouched = {};

    fields.forEach((field) => {
      nextTouched[field] = true;
    });

    setTouched((prev) => ({
      ...prev,
      ...nextTouched,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!abonnement?.idAbonnement) {
        throw new Error("Veuillez sélectionner un abonnement.");
      }

      const validationErrors = validateAllFields();

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        markAllAsTouched(Object.keys(validationErrors));
        throw new Error("Veuillez corriger les champs du formulaire.");
      }

      const adresseComplete = [
        form.numero,
        form.rue,
        form.codePostal,
        form.ville,
        form.departement,
      ]
        .filter(Boolean)
        .join(" ");

      const res = await fetch("http://localhost:8080/api/auth/register-complet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: form.nom.trim(),
          prenom: form.prenom.trim(),
          email: form.email.trim().toLowerCase(),
          motDePasse: form.motDePasse,
          dateNaissance: form.dateNaissance,
          telephone: form.telephone.trim(),
          adresse: adresseComplete,
          idAbonnement: abonnement.idAbonnement,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Impossible de créer le compte.");
      }

      navigate("/inscription/succes");

      setForm(initialForm);
      setErrors({});
      setTouched({});
      setQuery("");
      setSuggestions([]);
      setShowAddress(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value) => {
    setQuery(value);

    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
          value
        )}&limit=5`
      );

      const data = await res.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error("Erreur recherche adresse :", error);
      setSuggestions([]);
    }
  };

  const handleSelectAddress = (sug) => {
    const props = sug.properties;

    setForm((prev) => ({
      ...prev,
      numero: props.housenumber || "",
      rue: props.street || props.name || "",
      codePostal: props.postcode || "",
      ville: props.city || "",
      departement: props.context?.split(",")[0]?.trim() || "",
    }));

    setErrors((prev) => ({
      ...prev,
      codePostal: validateField("codePostal", props.postcode || ""),
    }));

    setQuery(props.label);
    setSuggestions([]);
    setShowAddress(true);
  };

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(to_bottom,#f8fafc,white_28%,#f8fafc)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-7rem] top-16 h-56 w-56 rounded-full bg-red-100/40 blur-3xl" />
        <div className="absolute right-[-5rem] top-24 h-64 w-64 rounded-full bg-orange-100/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#800020]">
            Inscription
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
            Finalisez votre adhésion au club
          </h1>

          <p className="mt-4 text-base leading-7 text-gray-600 sm:text-lg">
            Renseignez vos coordonnées pour nous transmettre votre demande
            d’inscription. Le règlement s’effectue ensuite sur place auprès du
            responsable.
          </p>
        </div>

        {error && (
          <div className="mx-auto mb-6 flex max-w-3xl items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mx-auto mb-6 flex max-w-3xl items-start gap-3 rounded-3xl border border-green-100 bg-green-50 p-5 text-sm text-green-700">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-3xl border border-black/5 bg-white/90 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:p-8">
            <form
              onSubmit={handleSubmit}
              className="space-y-8"
              autoComplete="off"
              noValidate
            >
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-900">
                    <User size={18} />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-950">
                      Vos coordonnées
                    </h2>
                    <p className="text-sm text-gray-500">
                      Informations personnelles du pratiquant
                    </p>
                  </div>
                </div>

                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-gray-700">
                    Genre
                  </legend>

                  <div className="flex flex-wrap gap-3">
                    {["Homme", "Femme", "Autre"].map((g) => {
                      const checked = form.genre === g;

                      return (
                        <label
                          key={g}
                          className={[
                            "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                            checked
                              ? "border-[#800020] bg-[#800020] text-white"
                              : "border-black/10 bg-white text-gray-700 hover:bg-gray-50",
                          ].join(" ")}
                        >
                          <input
                            type="radio"
                            name="genre"
                            value={g}
                            checked={checked}
                            onChange={handleChange}
                            required
                            className="sr-only"
                          />
                          <span>{g}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InputField
                    label="Nom"
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Votre nom"
                    required
                    error={touched.nom || form.nom ? errors.nom : ""}
                  />

                  <InputField
                    label="Prénom"
                    name="prenom"
                    value={form.prenom}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Votre prénom"
                    required
                    error={touched.prenom || form.prenom ? errors.prenom : ""}
                  />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="exemple@email.com"
                    required
                    autoComplete="new-email"
                    error={touched.email || form.email ? errors.email : ""}
                  />

                  <InputField
                    label="Téléphone"
                    name="telephone"
                    type="tel"
                    value={form.telephone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="06 00 00 00 00"
                    required
                    error={
                      touched.telephone || form.telephone
                        ? errors.telephone
                        : ""
                    }
                  />

                  <InputField
                    label="Date de naissance"
                    name="dateNaissance"
                    type="date"
                    value={form.dateNaissance}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    error={
                      touched.dateNaissance || form.dateNaissance
                        ? errors.dateNaissance
                        : ""
                    }
                  />

                  <div>
                    <InputField
                      label="Mot de passe"
                      name="motDePasse"
                      type="password"
                      value={form.motDePasse}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Créer un mot de passe"
                      required
                      autoComplete="new-password"
                      error={
                        touched.motDePasse || form.motDePasse
                          ? errors.motDePasse
                          : ""
                      }
                    />

                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      Minimum 13 caractères, avec une majuscule, une minuscule,
                      un chiffre et un caractère spécial.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="niveau"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Niveau
                  </label>

                  <div className="relative">
                    <select
                      id="niveau"
                      name="niveau"
                      value={form.niveau}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={[
                        "w-full appearance-none rounded-2xl border bg-white px-4 py-3 text-gray-900 outline-none transition",
                        errors.niveau && touched.niveau
                          ? "border-red-300 focus:ring-2 focus:ring-red-100"
                          : "border-black/10 focus:border-[#800020]/30 focus:ring-2 focus:ring-[#800020]/10",
                      ].join(" ")}
                    >
                      <option value="">Choisir votre niveau</option>
                      <option value="debutant">Débutant</option>
                      <option value="intermediaire">Intermédiaire</option>
                      <option value="avance">Avancé</option>
                    </select>

                    <GraduationCap
                      size={18}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>

                  {errors.niveau && touched.niveau && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.niveau}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-5 flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-900">
                    <MapPin size={18} />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-950">
                      Adresse
                    </h2>
                    <p className="text-sm text-gray-500">
                      Recherchez puis complétez votre adresse
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <label
                    htmlFor="adresse-search"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Rechercher votre adresse
                  </label>

                  <input
                    id="adresse-search"
                    type="text"
                    placeholder="Commencez à taper votre adresse..."
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#800020]/30 focus:ring-2 focus:ring-[#800020]/10"
                  />

                  {suggestions.length > 0 && (
                    <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
                      {suggestions.map((sug, index) => (
                        <li key={index}>
                          <button
                            type="button"
                            onClick={() => handleSelectAddress(sug)}
                            className="w-full cursor-pointer px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                          >
                            {sug.properties.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    showAddress
                      ? "mt-5 max-h-[500px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                      label="Numéro"
                      name="numero"
                      value={form.numero}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="N°"
                    />

                    <InputField
                      label="Rue"
                      name="rue"
                      value={form.rue}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Rue"
                    />

                    <InputField
                      label="Code postal"
                      name="codePostal"
                      value={form.codePostal}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Code postal"
                      error={
                        touched.codePostal || form.codePostal
                          ? errors.codePostal
                          : ""
                      }
                    />

                    <InputField
                      label="Ville"
                      name="ville"
                      value={form.ville}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ville"
                    />

                    <InputField
                      label="Département"
                      name="departement"
                      value={form.departement}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Département"
                      className="sm:col-span-2"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-black/5 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-gray-950 px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Envoi en cours..." : "Envoyer mon inscription"}
                </button>

                <p className="mt-3 text-center text-sm text-gray-500">
                  Paiement sur place auprès du responsable
                </p>
              </div>
            </form>
          </div>

          <aside className="h-fit rounded-3xl border border-black/5 bg-white/90 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] backdrop-blur-xl lg:sticky lg:top-24">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#800020]">
                  Récapitulatif
                </p>

                <h2 className="mt-2 text-xl font-semibold text-gray-950">
                  {abonnement?.nom || abonnement?.titre || "Abonnement"}
                </h2>
              </div>

              {abonnement && (
                <button
                  type="button"
                  onClick={() => setOpen((prev) => !prev)}
                  className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-black/10 bg-white text-gray-700 transition hover:bg-gray-50"
                >
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
            </div>

            {abonnement ? (
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  open ? "mt-6 max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="space-y-4">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Mensuel</p>
                    <p className="mt-1 text-lg font-semibold text-gray-950">
                      {abonnement.prixMensuel} € / mois
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Annuel</p>
                    <p className="mt-1 text-lg font-semibold text-gray-950">
                      {abonnement.prixAnnuel} € / an
                    </p>
                  </div>

                  <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                    <p className="text-sm text-gray-600">
                      Frais d’inscription
                    </p>
                    <p className="mt-1 text-lg font-semibold text-gray-950">
                      {fraisInscription} €
                    </p>
                  </div>

                  <p className="text-sm leading-6 text-gray-500">
                    Votre compte restera en attente jusqu’à la validation du
                    paiement au club.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
                Aucun abonnement n’a été sélectionné. Retournez choisir une
                formule.
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Inscription;