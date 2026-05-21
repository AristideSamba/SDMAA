import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
  hint,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-12 text-gray-900 outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-gray-900/10"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {hint && <p className="mt-2 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function ChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return "Tous les champs sont obligatoires.";
    }

    if (newPassword.length < 13) {
      return "Le nouveau mot de passe doit contenir au moins 13 caractères.";
    }

    if (newPassword !== confirmPassword) {
      return "Les mots de passe ne correspondent pas.";
    }

    if (currentPassword === newPassword) {
      return "Le nouveau mot de passe doit être différent de l’ancien.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const err = validate();

  if (err) {
    setError(err);
    setSuccess("");
    return;
  }

  setLoading(true);
  setError("");
  setSuccess("");

  try {
    const res = await fetch("http://localhost:8080/api/utilisateurs/me/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        ancienMotDePasse: currentPassword,
        nouveauMotDePasse: newPassword,
        confirmationMotDePasse: confirmPassword,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.message || "Erreur lors du changement du mot de passe.");
    }

    setSuccess("Mot de passe modifié avec succès.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      navigate("/dashboard/profil");
    }, 1000);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[28px] border border-black/5 bg-gray-950 px-8 py-8 text-white shadow-[0_16px_50px_rgba(0,0,0,0.12)] sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-4rem] top-[-4rem] h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />
          <div className="absolute right-[-3rem] bottom-[-3rem] h-48 w-48 rounded-full bg-orange-400/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard/profil")}
            className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-gray-300 transition hover:text-white"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Retour au profil
          </button>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
                Sécurité
              </p>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Modifier le mot de passe
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
                Mettez à jour votre mot de passe pour sécuriser votre espace
                personnel.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm lg:min-w-[300px]">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <ShieldCheck size={20} aria-hidden="true" />
                </div>

                <div>
                  <p className="text-sm text-gray-400">Protection du compte</p>
                  <p className="text-base font-semibold text-white">
                    Sécurité renforcée
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-gray-300">
                Choisissez un mot de passe long et difficile à deviner.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl">
        <section className="rounded-3xl border border-black/5 bg-white/85 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8">
          <div className="mb-6 flex items-start gap-4">
            <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-900">
              <Lock size={20} aria-hidden="true" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
                Formulaire
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                Mettre à jour mon mot de passe
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
                Renseignez votre mot de passe actuel puis choisissez un nouveau
                mot de passe sécurisé.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <PasswordField
              id="current-password"
              label="Mot de passe actuel"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              show={showCurrent}
              onToggle={() => setShowCurrent((prev) => !prev)}
            />

            <PasswordField
              id="new-password"
              label="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              show={showNew}
              onToggle={() => setShowNew((prev) => !prev)}
              hint="Minimum 13 caractères."
            />

            <PasswordField
              id="confirm-password"
              label="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              show={showConfirm}
              onToggle={() => setShowConfirm((prev) => !prev)}
            />

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <p>{success}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-black/5 pt-5 sm:flex-row sm:justify-center">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-3xl border border-black/15 bg-transparent px-5 py-3 text-sm font-medium text-gray-950 transition-all cursor-pointer duration-200  sm:w-auto"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  "Mettre à jour"
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </section>
  );
}

export default ChangePassword;