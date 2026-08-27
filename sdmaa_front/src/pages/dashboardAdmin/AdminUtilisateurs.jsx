import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Mail,
  Phone,
  Trash2,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  CalendarDays,
  BadgeCheck,
  UserX,
  XCircle,
  Clock3,
  MessageSquareText,
} from "lucide-react";

const roles = ["TOUS", "ADHERENT", "COACH", "ADMIN"];

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://sdmaa.onrender.com/api"
).replace(/\/$/, "");

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

function RoleBadge({ role }) {
  const styles = {
    ADMIN: "bg-gray-950 text-white",
    COACH: "bg-blue-50 text-blue-700",
    ADHERENT: "bg-green-50 text-green-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[role] || "bg-gray-100 text-gray-700"
        }`}
    >
      {role}
    </span>
  );
}

function StatusBadge({ statut }) {
  const value = String(statut || "en_attente").toLowerCase();

  const styles = {
    active: "bg-green-50 text-green-700",
    actif: "bg-green-50 text-green-700",
    validee: "bg-green-50 text-green-700",
    valide: "bg-green-50 text-green-700",
    en_attente: "bg-yellow-50 text-yellow-700",
    suspendu: "bg-red-50 text-red-700",
    refusee: "bg-red-50 text-red-700",
  };

  const labels = {
    active: "Actif",
    actif: "Actif",
    validee: "Validée",
    valide: "Validée",
    en_attente: "En attente",
    suspendu: "Suspendu",
    refusee: "Refusée",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[value] || "bg-gray-100 text-gray-700"
        }`}
    >
      {labels[value] || statut || "En attente"}
    </span>
  );
}


function DeletionRequestBadge({ statut }) {
  const value = String(statut || "EN_ATTENTE")
    .trim()
    .toUpperCase();

  const styles = {
    EN_ATTENTE: "border-amber-100 bg-amber-50 text-amber-700",
    TRAITEE: "border-green-100 bg-green-50 text-green-700",
    REFUSEE: "border-red-100 bg-red-50 text-red-700",
  };

  const labels = {
    EN_ATTENTE: "En attente",
    TRAITEE: "Traitée",
    REFUSEE: "Refusée",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[value] || "border-gray-100 bg-gray-50 text-gray-700"
      }`}
    >
      {labels[value] || value}
    </span>
  );
}

function AdminUtilisateurs() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [adhesions, setAdhesions] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);

  const [search, setSearch] = useState("");
  const [adhesionSearch, setAdhesionSearch] = useState("");
  const [deletionSearch, setDeletionSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("TOUS");
  const [deletionStatusFilter, setDeletionStatusFilter] = useState("TOUS");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [validatingAdhesionId, setValidatingAdhesionId] = useState(null);
  const [processingDeletionId, setProcessingDeletionId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [userToSuspend, setUserToSuspend] = useState(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const [deletionRequestToProcess, setDeletionRequestToProcess] = useState(null);
  const [deletionAction, setDeletionAction] = useState(null);
  const [deletionComment, setDeletionComment] = useState("");
  const [showDeletionModal, setShowDeletionModal] = useState(false);

  const apiFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.clear();
      navigate("/login");
      return null;
    }

    return res;
  };

  const fetchUsers = async () => {
    const res = await apiFetch(`${API_URL}/utilisateurs`);

    if (!res) return [];

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.message || "Impossible de charger les utilisateurs.");
    }

    return data || [];
  };

  const fetchAdhesions = async () => {
    const res = await apiFetch(`${API_URL}/adhesions`);

    if (!res) return [];

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.message || "Impossible de charger les adhésions.");
    }

    return data || [];
  };


  const fetchDeletionRequests = async () => {
    const res = await apiFetch(`${API_URL}/demandes-suppression`);

    if (!res) return [];

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(
        data?.message ||
          "Impossible de charger les demandes de suppression."
      );
    }

    return data || [];
  };

  const loadData = async () => {
    try {
      setError("");

      const [
        usersData,
        adhesionsData,
        deletionRequestsData,
      ] = await Promise.all([
        fetchUsers(),
        fetchAdhesions(),
        fetchDeletionRequests(),
      ]);

      setUsers(usersData);
      setAdhesions(adhesionsData);
      setDeletionRequests(deletionRequestsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return users.filter((user) => {
      const role = user.role || "";

      const text = `
        ${user.nomComplet || ""}
        ${user.email || ""}
        ${user.telephone || ""}
        ${user.statutCompte || ""}
      `.toLowerCase();

      return (
        (!q || text.includes(q)) &&
        (roleFilter === "TOUS" || role === roleFilter)
      );
    });
  }, [users, search, roleFilter]);

  const filteredAdhesions = useMemo(() => {
    const q = adhesionSearch.trim().toLowerCase();

    return adhesions.filter((adhesion) => {
      const utilisateur = adhesion.utilisateur || {};
      const abonnement = adhesion.abonnement || {};

      const text = `
        ${utilisateur.nom || ""}
        ${utilisateur.prenom || ""}
        ${utilisateur.nomComplet || ""}
        ${utilisateur.email || ""}
        ${abonnement.titre || ""}
        ${abonnement.nom || ""}
        ${adhesion.statut || ""}
        ${adhesion.statutAdhesion || ""}
      `.toLowerCase();

      return !q || text.includes(q);
    });
  }, [adhesions, adhesionSearch]);


  const filteredDeletionRequests = useMemo(() => {
    const q = deletionSearch.trim().toLowerCase();

    return deletionRequests.filter((request) => {
      const statut = String(request.statut || "EN_ATTENTE")
        .trim()
        .toUpperCase();

      const content = `
        ${request.utilisateurNom || ""}
        ${request.utilisateurEmail || ""}
        ${request.motif || ""}
        ${request.commentaireAdmin || ""}
        ${statut}
      `.toLowerCase();

      return (
        (!q || content.includes(q)) &&
        (deletionStatusFilter === "TOUS" ||
          statut === deletionStatusFilter)
      );
    });
  }, [
    deletionRequests,
    deletionSearch,
    deletionStatusFilter,
  ]);

  const changeRole = async (id, newRole) => {
    setUpdatingId(id);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch(
        `${API_URL}/utilisateurs/${id}/role?role=${encodeURIComponent(newRole)}`,
        { method: "PUT" }
      );

      const data = await res?.json().catch(() => null);

      if (!res?.ok) {
        throw new Error(data?.message || "Erreur lors du changement de rôle.");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );

      setSuccess("Rôle mis à jour avec succès.");
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const suspendUser = async () => {
    if (!userToSuspend) return;

    setUpdatingId(userToSuspend.id);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch(
        `${API_URL}/utilisateurs/${userToSuspend.id}/suspendre`,
        { method: "PUT" }
      );

      if (!res?.ok) {
        throw new Error("Erreur lors de la suspension.");
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userToSuspend.id ? { ...u, statutCompte: "suspendu" } : u
        )
      );

      setSuccess("Utilisateur suspendu avec succès.");
      setShowSuspendModal(false);
      setUserToSuspend(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const validerAdhesion = async (id) => {
    setValidatingAdhesionId(id);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch(
        `${API_URL}/adhesions/${id}/valider`,
        { method: "PUT" }
      );

      const data = await res?.json().catch(() => null);

      if (!res?.ok) {
        throw new Error(data?.message || "Erreur lors de la validation.");
      }

      setAdhesions((prev) =>
        prev.map((adhesion) =>
          (adhesion.id || adhesion.idAdhesion) === id
            ? { ...adhesion, ...(data || {}) }
            : adhesion
        )
      );

      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);

      setSuccess("Adhésion validée avec succès.");
    } catch (err) {
      setError(err.message);
    } finally {
      setValidatingAdhesionId(null);
    }
  };


  const openDeletionModal = (request, action) => {
    setDeletionRequestToProcess(request);
    setDeletionAction(action);
    setDeletionComment("");
    setShowDeletionModal(true);
  };

  const closeDeletionModal = () => {
    if (processingDeletionId) return;

    setShowDeletionModal(false);
    setDeletionRequestToProcess(null);
    setDeletionAction(null);
    setDeletionComment("");
  };

  const processDeletionRequest = async () => {
    if (!deletionRequestToProcess || !deletionAction) {
      return;
    }

    const id = deletionRequestToProcess.id;

    setProcessingDeletionId(id);
    setError("");
    setSuccess("");

    try {
      const endpoint =
        deletionAction === "TRAITER"
          ? "traiter"
          : "refuser";

      const params = new URLSearchParams();

      if (deletionComment.trim()) {
        params.set(
          "commentaireAdmin",
          deletionComment.trim()
        );
      }

      const query = params.toString();

      const res = await apiFetch(
        `${API_URL}/demandes-suppression/${id}/${endpoint}${
          query ? `?${query}` : ""
        }`,
        {
          method: "PUT",
        }
      );

      const data = await res?.json().catch(() => null);

      if (!res?.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Impossible de traiter la demande."
        );
      }

      setDeletionRequests((prev) =>
        prev.map((request) =>
          request.id === id
            ? {
                ...request,
                ...(data || {}),
              }
            : request
        )
      );

      setSuccess(
        deletionAction === "TRAITER"
          ? "La demande de suppression a été marquée comme traitée."
          : "La demande de suppression a été refusée."
      );

      setShowDeletionModal(false);
      setDeletionRequestToProcess(null);
      setDeletionAction(null);
      setDeletionComment("");
    } catch (err) {
      setError(
        err?.message ||
          "Impossible de traiter la demande."
      );
    } finally {
      setProcessingDeletionId(null);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Chargement des utilisateurs...</p>;
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[28px] border border-black/5 bg-white px-6 py-8 text-gray-950 shadow-[0_16px_50px_rgba(0,0,0,0.06)] sm:px-10 sm:py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
          Administration
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Utilisateurs
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
          Gérez les adhérents, coachs, administrateurs et demandes d’adhésion du
          club.
        </p>
      </div>

      {error && (
        <div className="flex gap-3 rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex gap-3 rounded-3xl border border-green-100 bg-green-50 p-5 text-sm text-green-700">
          <CheckCircle2 size={18} />
          <p>{success}</p>
        </div>
      )}

      <section className="space-y-5">
        <div className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un utilisateur..."
                className="w-full rounded-3xl border border-black/10 bg-white px-11 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleFilter(role)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${roleFilter === role
                    ? "bg-gray-950 text-white"
                    : "border border-black/10 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
          {filteredUsers.length > 0 ? (
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <article
                  key={user.id}
                  className="rounded-3xl border border-black/5 bg-white p-4"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-900">
                        <Users size={20} />
                      </div>

                      <div
                        className="min-w-0 cursor-pointer"
                        onClick={() =>
                          navigate(`/dashboard/admin/utilisateurs/${user.id}`)
                        }
                      >
                        <h2 className="truncate text-lg font-medium text-gray-950">
                          {user.nomComplet || "Utilisateur"}
                        </h2>

                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <Mail size={14} />
                            {user.email}
                          </span>

                          {user.telephone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone size={14} />
                              {user.telephone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <RoleBadge role={user.role} />

                      <StatusBadge statut={user.statutCompte} />

                      <select
                        value={user.role || "ADHERENT"}
                        disabled={updatingId === user.id}
                        onChange={(e) => changeRole(user.id, e.target.value)}
                        className="rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
                      >
                        <option value="ADHERENT">ADHERENT</option>
                        <option value="COACH">COACH</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>

                      <button
                        type="button"
                        disabled={
                          updatingId === user.id ||
                          user.statutCompte === "suspendu"
                        }
                        onClick={() => {
                          setUserToSuspend(user);
                          setShowSuspendModal(true);
                        }}
                        className={[
                          "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition",
                          user.statutCompte === "suspendu"
                            ? "cursor-not-allowed bg-gray-200 text-gray-500"
                            : "cursor-pointer border border-red-100 bg-red-50 text-red-700 hover:bg-red-100",
                        ].join(" ")}
                      >
                        <Trash2 size={15} />
                        {user.statutCompte === "suspendu"
                          ? "Suspendu"
                          : "Suspendre"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 px-6 py-12 text-center text-gray-500">
              Aucun utilisateur trouvé.
            </div>
          )}
        </section>
      </section>

      <section className="space-y-5">
        <div className="rounded-[28px] border border-black/5 bg-white px-6 py-7 shadow-[0_16px_50px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
                Adhésions
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-950">
                Demandes d’adhésion
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                Consultez les demandes d’adhésion au club et validez celles qui
                sont en attente.
              </p>
            </div>

            <div className="relative w-full max-w-md">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={adhesionSearch}
                onChange={(e) => setAdhesionSearch(e.target.value)}
                placeholder="Rechercher une adhésion..."
                className="w-full rounded-3xl border border-black/10 bg-white px-11 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
              />
            </div>
          </div>
        </div>

        <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
          {filteredAdhesions.length > 0 ? (
            <div className="grid gap-3">
              {[...filteredAdhesions]
                .sort((a, b) => {
                  const dateA =
                    new Date(
                      a.dateDemande ||
                      a.dateAdhesion ||
                      a.createdAt ||
                      0
                    ).getTime();

                  const dateB =
                    new Date(
                      b.dateDemande ||
                      b.dateAdhesion ||
                      b.createdAt ||
                      0
                    ).getTime();

                  return dateB - dateA;
                })
                .map((adhesion) => {
                  const utilisateur = adhesion.utilisateur || {};
                  const abonnement = adhesion.abonnement || {};

                  const adhesionId = adhesion.id || adhesion.idAdhesion;
                  const statut =
                    adhesion.statutAdhesion || adhesion.statut || "en_attente";

                  const nomComplet =
                    utilisateur.nomComplet ||
                    `${utilisateur.prenom || ""} ${utilisateur.nom || ""
                      }`.trim() ||
                    "Utilisateur";

                  const abonnementTitre =
                    abonnement.titre || abonnement.nom || "Abonnement";

                  const prix =
                    abonnement.prixAnnuel ||
                    abonnement.prixMensuel ||
                    abonnement.prix ||
                    null;

                  const isValidated =
                    String(statut).toLowerCase() === "validee" ||
                    String(statut).toLowerCase() === "valide";

                  return (
                    <article
                      key={adhesionId}
                      className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        {/* Partie gauche */}
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-900">
                            <CreditCard size={20} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-base font-semibold text-gray-950">
                                {nomComplet}
                              </h3>

                              <StatusBadge statut={statut} />
                            </div>

                            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                              <span>{utilisateur.email || "Email non renseigné"}</span>

                              <span>{abonnementTitre}</span>

                              <span>
                                {formatDate(
                                  adhesion.dateDemande ||
                                  adhesion.dateAdhesion ||
                                  adhesion.createdAt
                                )}
                              </span>

                              {prix && <span>{prix} €</span>}
                            </div>
                          </div>
                        </div>

                        {/* Partie droite */}
                        <div className="flex shrink-0 items-center gap-3">
                          <button
                            type="button"
                            disabled={
                              validatingAdhesionId === adhesionId || isValidated
                            }
                            onClick={() => validerAdhesion(adhesionId)}
                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <CheckCircle2 size={15} />

                            {isValidated ? "Validée" : "Valider"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 px-6 py-12 text-center text-gray-500">
              Aucune adhésion trouvée.
            </div>
          )}
        </section>
      </section>


      {/* ---------------------------------------------------------------- */}
      {/* DEMANDES DE SUPPRESSION                                          */}
      {/* ---------------------------------------------------------------- */}

      <section className="space-y-5">
        <div className="rounded-[28px] border border-red-100 bg-white px-6 py-7 shadow-[0_16px_50px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-red-400">
                Comptes
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-950">
                Demandes de suppression
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                Consultez les demandes envoyées depuis l’application mobile.
                Le traitement d’une demande ne supprime pas automatiquement le
                compte : il enregistre uniquement la décision de
                l’administration.
              </p>
            </div>

            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {
                deletionRequests.filter(
                  (request) =>
                    String(request.statut || "EN_ATTENTE")
                      .trim()
                      .toUpperCase() === "EN_ATTENTE"
                ).length
              }{" "}
              en attente
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={deletionSearch}
                onChange={(e) =>
                  setDeletionSearch(e.target.value)
                }
                placeholder="Rechercher une demande..."
                className="w-full rounded-3xl border border-black/10 bg-white px-11 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["TOUS", "Toutes"],
                ["EN_ATTENTE", "En attente"],
                ["TRAITEE", "Traitées"],
                ["REFUSEE", "Refusées"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setDeletionStatusFilter(value)
                  }
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    deletionStatusFilter === value
                      ? "bg-gray-950 text-white"
                      : "border border-black/10 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
          {filteredDeletionRequests.length > 0 ? (
            <div className="grid gap-4">
              {[...filteredDeletionRequests]
                .sort(
                  (a, b) =>
                    new Date(b.dateDemande || 0).getTime() -
                    new Date(a.dateDemande || 0).getTime()
                )
                .map((request) => {
                  const statutNormalise = String(
                    request.statut || "EN_ATTENTE"
                  )
                    .trim()
                    .toUpperCase();

                  const isPending =
                    statutNormalise === "EN_ATTENTE";

                  return (
                    <article
                      key={request.id}
                      className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.04)]"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="flex min-w-0 flex-1 items-start gap-4">
                          <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                            <UserX size={21} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold text-gray-950">
                                {request.utilisateurNom || "Utilisateur"}
                              </h3>

                              <DeletionRequestBadge
                                statut={statutNormalise}
                              />
                            </div>

                            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                              <span className="inline-flex items-center gap-1.5">
                                <Mail size={14} />
                                {request.utilisateurEmail ||
                                  "Email non renseigné"}
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={14} />
                                {formatDate(request.dateDemande)}
                              </span>
                            </div>

                            <div className="mt-4 rounded-2xl bg-gray-50 p-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                                Motif
                              </p>

                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                {request.motif ||
                                  "Aucun motif renseigné par l’utilisateur."}
                              </p>
                            </div>

                            {request.commentaireAdmin && (
                              <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                                <div className="flex items-center gap-2 text-blue-700">
                                  <MessageSquareText size={15} />

                                  <p className="text-xs font-semibold uppercase tracking-[0.14em]">
                                    Réponse du club
                                  </p>
                                </div>

                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-blue-900">
                                  {request.commentaireAdmin}
                                </p>
                              </div>
                            )}

                            {request.dateTraitement && (
                              <p className="mt-3 text-xs text-gray-400">
                                Traitée le{" "}
                                {formatDate(request.dateTraitement)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                disabled={
                                  processingDeletionId === request.id
                                }
                                onClick={() =>
                                  openDeletionModal(
                                    request,
                                    "REFUSER"
                                  )
                                }
                                className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <XCircle size={16} />
                                Refuser
                              </button>

                              <button
                                type="button"
                                disabled={
                                  processingDeletionId === request.id
                                }
                                onClick={() =>
                                  openDeletionModal(
                                    request,
                                    "TRAITER"
                                  )
                                }
                                className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <CheckCircle2 size={16} />
                                Traiter
                              </button>
                            </>
                          ) : (
                            <div
                              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium ${
                                statutNormalise === "TRAITEE"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {statutNormalise === "TRAITEE" ? (
                                <CheckCircle2 size={16} />
                              ) : (
                                <XCircle size={16} />
                              )}

                              {statutNormalise === "TRAITEE"
                                ? "Demande traitée"
                                : "Demande refusée"}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 px-6 py-12 text-center">
              <UserX
                size={28}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 text-sm font-medium text-gray-700">
                Aucune demande de suppression
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Les demandes envoyées depuis l’application apparaîtront ici.
              </p>
            </div>
          )}
        </section>
      </section>

      {showDeletionModal && deletionRequestToProcess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div
                className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  deletionAction === "TRAITER"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {deletionAction === "TRAITER" ? (
                  <CheckCircle2 size={21} />
                ) : (
                  <XCircle size={21} />
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Demande de suppression
                </p>

                <h2 className="mt-2 text-xl font-semibold text-gray-950">
                  {deletionAction === "TRAITER"
                    ? "Marquer comme traitée"
                    : "Refuser la demande"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {deletionRequestToProcess.utilisateurNom ||
                    "Utilisateur"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="deletion-comment"
                className="text-sm font-medium text-gray-800"
              >
                Commentaire pour l’utilisateur{" "}
                <span className="font-normal text-gray-400">
                  (optionnel)
                </span>
              </label>

              <textarea
                id="deletion-comment"
                value={deletionComment}
                maxLength={1000}
                onChange={(e) =>
                  setDeletionComment(e.target.value)
                }
                rows={5}
                placeholder={
                  deletionAction === "TRAITER"
                    ? "Ex. Votre demande a été prise en compte..."
                    : "Ex. Votre demande ne peut pas être traitée actuellement..."
                }
                className="mt-3 w-full resize-none rounded-2xl border border-black/10 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-950/5"
              />

              <p className="mt-2 text-right text-xs text-gray-400">
                {deletionComment.length}/1000
              </p>
            </div>

            <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              Cette action met uniquement à jour le statut de la demande.
              Elle ne supprime pas automatiquement le compte ni les données
              de l’utilisateur.
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeletionModal}
                disabled={Boolean(processingDeletionId)}
                className="cursor-pointer rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={processDeletionRequest}
                disabled={Boolean(processingDeletionId)}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  deletionAction === "TRAITER"
                    ? "bg-gray-950 hover:bg-black"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {processingDeletionId ? (
                  <Clock3
                    size={16}
                    className="animate-spin"
                  />
                ) : deletionAction === "TRAITER" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <XCircle size={16} />
                )}

                {deletionAction === "TRAITER"
                  ? "Confirmer le traitement"
                  : "Confirmer le refus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-950">
              Suspendre l’utilisateur
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Voulez-vous vraiment suspendre{" "}
              <span className="font-medium text-gray-900">
                {userToSuspend?.nomComplet}
              </span>{" "}
              ?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowSuspendModal(false);
                  setUserToSuspend(null);
                }}
                className="cursor-pointer rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={suspendUser}
                className="cursor-pointer rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Suspendre
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminUtilisateurs;