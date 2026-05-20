import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginCard() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoToAbonnements = () => {
    navigate("/", {
      state: { scrollTo: "abonnements" },
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  try {
    const res = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        motDePasse,
      }),
    });

    const contentType = res.headers.get("content-type");

    const data = contentType?.includes("application/json")
      ? await res.json().catch(() => null)
      : null;

    const text = !data ? await res.text().catch(() => "") : "";

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error("Identifiant ou mot de passe incorrect");
      }

      throw new Error(
        data?.message ||
          text ||
          "Une erreur est survenue. Réessayez plus tard."
      );
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("idUtilisateur", data.idUtilisateur);

    if (data.role === "ADMIN") {
      navigate("/dashboard/admin");
    } else if (data.role === "COACH") {
      navigate("/dashboard/coach/cours");
    } else {
      navigate("/dashboard");
    }
  } catch (err) {
    setError(err.message || "Une erreur est survenue. Réessayez plus tard.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="absolute top-28 w-full max-w-md px-4">
      <div className="rounded-[2rem] bg-white px-6 py-8 shadow-[0_20px_70px_rgba(0,0,0,0.18)] sm:px-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#800020]">
            Espace membre
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950">
            Connexion
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Accédez à votre espace personnel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[#800020]/40 focus:ring-4 focus:ring-[#800020]/10"
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <input
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[#800020]/40 focus:ring-4 focus:ring-[#800020]/10"
            type="password"
            placeholder="Mot de passe"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-gray-950">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <a
              href="#"
              className="text-sm font-medium text-[#800020] hover:underline"
            >
              Mot de passe oublié ?
            </a>
          </div>

          <button
            className="mt-2 w-full cursor-pointer rounded-2xl bg-light-blue px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-digital-blue disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Nouveau ici ?{" "}
          <button
            type="button"
            onClick={handleGoToAbonnements}
            className="font-semibold cursor-pointer text-[#800020] hover:underline"
          >
            Devenir membre
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginCard;