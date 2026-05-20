import { useEffect, useState } from "react";
import {
  FileUp,
  FileText,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import DocumentCard from "./DocumentCard";

function SectionCard({ eyebrow, title, description, children }) {
  return (
    <section className="rounded-3xl border border-black/5 bg-white/85 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8">
      <div className="mb-6">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [titre, setTitre] = useState("");
  const [typeDocument, setTypeDocument] = useState("Document");
  const [dateExpiration, setDateExpiration] = useState("");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("idUtilisateur");
      window.location.href = "/login";
      return null;
    }

    return res;
  };

  const fetchDocuments = async () => {
    try {
      setError("");

      const res = await apiFetch("http://localhost:8080/api/documents/me");

      if (!res) return;

      if (!res.ok) {
        throw new Error("Impossible de charger vos documents.");
      }

      const data = await res.json();

      setDocuments(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    if (!titre) {
      setTitre(file.name);
    }

    e.target.value = "";
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    console.log("UPLOAD CLICK", {
    selectedFile,
    titre,
    typeDocument,
    dateExpiration,
  });

    if (!selectedFile) {
      setError("Veuillez choisir un fichier.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("titre", titre || selectedFile.name);
      formData.append("typeDocument", typeDocument);

      if (dateExpiration) {
        formData.append("dateExpiration", dateExpiration);
      }

      const res = await apiFetch("http://localhost:8080/api/documents/me", {
        method: "POST",
        body: formData,
      });

      if (!res) return;

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Erreur lors de l’envoi du document.");
      }

      setSuccess("Document ajouté avec succès.");
      setSelectedFile(null);
      setTitre("");
      setTypeDocument("Document");
      setDateExpiration("");

      await fetchDocuments();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;

    const confirmDelete = window.confirm(
      "Voulez-vous vraiment supprimer ce document ?"
    );

    if (!confirmDelete) return;

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch(`http://localhost:8080/api/documents/${id}`, {
        method: "DELETE",
      });

      if (!res) return;

      const data = await res.json().catch(() => null);

      
      if (!res.ok) {
        throw new Error(
          data?.message || "Erreur lors de la suppression du document."
        );
      }
      

      setSuccess("Document supprimé avec succès.");

      setDocuments((prev) =>
        prev.filter((doc) => (doc.idDocument || doc.id) !== id)
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Chargement des documents...</p>;
  }

  return (
    <section className="space-y-8">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-[28px] border border-black/5 bg-gray-950 px-8 py-8 text-white shadow-[0_16px_50px_rgba(0,0,0,0.12)] sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-4rem] top-[-4rem] h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />
          <div className="absolute right-[-3rem] bottom-[-3rem] h-48 w-48 rounded-full bg-orange-400/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
              Documents
            </p>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Mes documents
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
              Déposez et retrouvez vos justificatifs utiles au suivi de votre
              dossier au club.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm lg:min-w-[300px]">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                <ShieldCheck size={20} />
              </div>

              <div>
                <p className="text-sm text-gray-400">Espace sécurisé</p>
                <p className="text-base font-semibold text-white">
                  Documents personnels
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-gray-300">
              Certificats, attestations et pièces utiles à votre inscription.
            </p>
          </div>
        </div>
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

      {/* CONTENU */}
      <div className="grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
        {/* UPLOAD */}
        <SectionCard
          eyebrow="Ajout"
          title="Ajouter un document"
          description="Déposez ici vos certificats, attestations ou autres fichiers utiles."
        >
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 p-6 text-center">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-800 shadow-sm">
                <FileUp size={24} />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-950">
                Importer un fichier
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                PDF, image ou justificatif utile à votre dossier.
              </p>

              <label className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black">
                Choisir un fichier
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {selectedFile && (
                <p className="mt-3 break-words text-sm font-medium text-gray-700">
                  {selectedFile.name}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Titre
              </label>
              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Ex : Certificat médical"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Type de document
              </label>
              <select
                value={typeDocument}
                onChange={(e) => setTypeDocument(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-gray-900/10"
              >
                <option value="Document">Document</option>
                <option value="Certificat médical">Certificat médical</option>
                <option value="Attestation">Attestation</option>
                <option value="Justificatif">Justificatif</option>
                <option value="Diplôme">Diplôme</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Date d’expiration
              </label>
              <input
                type="date"
                value={dateExpiration}
                onChange={(e) => setDateExpiration(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-gray-900 outline-none transition focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-gray-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? "Envoi..." : "Ajouter le document"}
            </button>

            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="flex items-start gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-gray-700 shadow-sm">
                  <FileText size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Documents souvent demandés
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-500">
                    <li>Certificat médical</li>
                    <li>Attestation</li>
                    <li>Diplôme ou justificatif</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </SectionCard>

        {/* LISTE */}
        <SectionCard
          eyebrow="Bibliothèque"
          title="Mes fichiers"
          description="Retrouvez ici tous les documents que vous avez ajoutés."
        >
          {documents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.idDocument || doc.id}
                  doc={doc}
                  onDelete={handleDelete}
                  deleting={deletingId === (doc.idDocument || doc.id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-black/10 bg-gray-50 px-6 py-14 text-center">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-800 shadow-sm">
                <FileText size={22} />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-950">
                Aucun document pour le moment
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Ajoutez votre premier document pour le retrouver ici ensuite.
              </p>
            </div>
          )}
        </SectionCard>
      </div>
    </section>
  );
}

export default DocumentList;