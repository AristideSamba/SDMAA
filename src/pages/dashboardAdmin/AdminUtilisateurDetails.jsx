import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Medal,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

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

function Panel({ title, description, icon: Icon, children }) {
  return (
    <section className="rounded-3xl border border-black/5 bg-white/85 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-950">
          <Icon size={20} />
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-950">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function AdminUtilisateurDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pageTopRef = useRef(null);

  const [user, setUser] = useState(null);
  const [ceintures, setCeintures] = useState([]);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
  });

  const [selectedCeinture, setSelectedCeinture] = useState("");
  const [statutCompte, setStatutCompte] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProfil, setSavingProfil] = useState(false);
  const [savingCeinture, setSavingCeinture] = useState(false);
  const [savingStatut, setSavingStatut] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      localStorage.clear();
      navigate("/login");
      return null;
    }

    return res;
  };

  const fetchData = async () => {
    try {
      setError("");

      const [userRes, ceinturesRes] = await Promise.all([
        apiFetch(`http://localhost:8080/api/utilisateurs/${id}`),
        apiFetch("http://localhost:8080/api/ceintures"),
      ]);

      if (!userRes || !ceinturesRes) return;

      if (!userRes.ok) {
        throw new Error("Impossible de charger l’utilisateur.");
      }

      if (!ceinturesRes.ok) {
        throw new Error("Impossible de charger les ceintures.");
      }

      const userData = await userRes.json();
      const ceinturesData = await ceinturesRes.json();

      setUser(userData);
      setCeintures(ceinturesData || []);

      setForm({
        nom: userData.nom || "",
        prenom: userData.prenom || "",
        email: userData.email || "",
        telephone: userData.telephone || "",
        adresse: userData.adresse || "",
      });

      setSelectedCeinture(userData.ceintureId || "");
      setStatutCompte(userData.statutCompte || "en_attente");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const saveProfil = async (e) => {
    e.preventDefault();

    setSavingProfil(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch(
        `http://localhost:8080/api/utilisateurs/${id}/profil`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res?.json().catch(() => null);

      if (!res?.ok) {
        throw new Error(data?.message || "Erreur lors de la mise à jour.");
      }

      setUser(data);
      setSuccess("Profil utilisateur mis à jour avec succès.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProfil(false);
    }
  };

  const saveCeinture = async () => {
    if (!selectedCeinture) {
      setError("Veuillez choisir une ceinture.");
      return;
    }

    setSavingCeinture(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch(
        `http://localhost:8080/api/utilisateurs/${id}/ceinture/${selectedCeinture}`,
        {
          method: "PUT",
        }
      );

      const data = await res?.json().catch(() => null);

      if (!res?.ok) {
        throw new Error(data?.message || "Erreur lors du changement de ceinture.");
      }

      setUser(data);
      setSuccess("Ceinture mise à jour avec succès.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingCeinture(false);
    }
  };

  const saveStatut = async () => {
    setSavingStatut(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch(
        `http://localhost:8080/api/utilisateurs/${id}/statut?statut=${statutCompte}`,
        {
          method: "PUT",
        }
      );

      const data = await res?.json().catch(() => null);

      if (!res?.ok) {
        throw new Error(data?.message || "Erreur lors du changement de statut.");
      }

      setUser(data);
      setSuccess("Statut du compte mis à jour avec succès.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingStatut(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Chargement de l’utilisateur...</p>;
  }

  return (
    <section ref={pageTopRef} className="space-y-8">
      <div className="rounded-[28px] border border-black/5 bg-white px-6 py-8 text-gray-950 shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:px-10 sm:py-10">
        <button
          type="button"
          onClick={() => navigate("/dashboard/admin/utilisateurs")}
          className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-950"
        >
          <ArrowLeft size={16} />
          Retour aux utilisateurs
        </button>

        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
          Administration
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          {user?.nomComplet || "Utilisateur"}
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
          Modifiez les informations personnelles, la ceinture et le statut du
          compte.
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

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel
          icon={User}
          title="Informations personnelles"
          description="Modifiez les coordonnées et informations principales de l’utilisateur."
        >
          <form onSubmit={saveProfil} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                icon={User}
                label="Nom"
                name="nom"
                value={form.nom}
                onChange={handleChange}
              />
              <Field
                icon={User}
                label="Prénom"
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
              />
              <Field
                icon={Mail}
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
              <Field
                icon={Phone}
                label="Téléphone"
                name="telephone"
                value={form.telephone}
                onChange={handleChange}
              />
            </div>

            <Field
              icon={MapPin}
              label="Adresse"
              name="adresse"
              value={form.adresse}
              onChange={handleChange}
            />

            <div className="border-t border-black/5 pt-5">
              <button
                type="submit"
                disabled={savingProfil}
                className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingProfil ? "Enregistrement..." : "Enregistrer le profil"}
              </button>
            </div>
          </form>
        </Panel>

        <div className="space-y-8">
          <Panel
            icon={Medal}
            title="Ceinture"
            description="Assignez ou modifiez la ceinture de l’utilisateur."
          >
            <div className="space-y-4">
              <select
                value={selectedCeinture}
                onChange={(e) => setSelectedCeinture(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-gray-950/10"
              >
                <option value="">Choisir une ceinture</option>
                {ceintures.map((ceinture) => (
                  <option
                    key={ceinture.idCeinture || ceinture.id}
                    value={ceinture.idCeinture || ceinture.id}
                  >
                    {ceinture.nom}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={saveCeinture}
                disabled={savingCeinture}
                className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingCeinture ? "Enregistrement..." : "Mettre à jour"}
              </button>
            </div>
          </Panel>

          <Panel
            icon={ShieldCheck}
            title="Statut du compte"
            description="Activez, suspendez ou refusez le compte utilisateur."
          >
            <div className="space-y-4">
              <select
                value={statutCompte}
                onChange={(e) => setStatutCompte(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-gray-950/10"
              >
                <option value="en_attente">En attente</option>
                <option value="actif">Actif</option>
                <option value="suspendu">Suspendu</option>
                <option value="refuse">Refusé</option>
              </select>

              <button
                type="button"
                onClick={saveStatut}
                disabled={savingStatut}
                className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingStatut ? "Enregistrement..." : "Changer le statut"}
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}

export default AdminUtilisateurDetails;