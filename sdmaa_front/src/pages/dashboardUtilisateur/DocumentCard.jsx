import {
  FileText,
  CalendarDays,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

function DocumentCard({ doc, onDelete }) {
  if (!doc) return null;

  const isExpired =
    doc.dateExpiration &&
    new Date(doc.dateExpiration) < new Date();

  const formatDate = (date) => {
    if (!date) return "—";

    const d = new Date(date);

    return isNaN(d)
      ? "—"
      : d.toLocaleDateString("fr-FR");
  };

  const fileUrl =
    doc.urlFichier?.startsWith("http")
      ? doc.urlFichier
      : `http://localhost:8080${doc.urlFichier || ""}`;

  return (
    <article className="flex h-full flex-col justify-between rounded-3xl border border-black/5 bg-white/90 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
      {/* HEADER De MA PAGE */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          {/* ICON */}
          <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-800">
            <FileText size={20} />
          </div>

          {/* TEXT */}
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-gray-950">
              {doc.titre || "Sans titre"}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {doc.typeDocument || doc.type || "Document"}
            </p>
          </div>
        </div>

        {/* STATUS */}
        {doc.dateExpiration && (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${
              isExpired
                ? "border-red-100 bg-red-50 text-red-700"
                : "border-green-100 bg-green-50 text-green-700"
            }`}
          >
            {isExpired ? (
              <>
                <AlertCircle size={12} />
                Expiré
              </>
            ) : (
              <>
                <CheckCircle2 size={12} />
                Valide
              </>
            )}
          </span>
        )}
      </div>

      {/* INFOS */}
      <div className="mt-5 space-y-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} />
          <span>
            Ajouté le {formatDate(doc.dateUpload)}
          </span>
        </div>

        {doc.dateExpiration && (
          <div className="flex items-center gap-2">
            <CalendarDays size={14} />
            <span>
              Expire le {formatDate(doc.dateExpiration)}
            </span>
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {doc.urlFichier && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black"
          >
            <Eye size={14} />
            Voir
          </a>
        )}

        <button
          type="button"
          onClick={() => onDelete(doc.id)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-950"
        >
          <Trash2 size={14} />
          Supprimer
        </button>
      </div>
    </article>
  );
}

export default DocumentCard;