import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock3 } from "lucide-react";

function InscriptionSucces() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-[linear-gradient(to_bottom,#f8fafc,white_35%,#f8fafc)] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[2rem] border border-black/5 bg-white p-7 text-center shadow-[0_18px_55px_rgba(0,0,0,0.08)] sm:p-9">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
            <CheckCircle2 size={34} />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-[#800020]">
            Inscription envoyée
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950">
            Votre compte a bien été créé
          </h1>

          <p className="mt-4 text-sm leading-6 text-gray-600 sm:text-base">
            Votre demande d’adhésion est maintenant en attente de validation.
            Une fois le paiement validé par le club, vous pourrez vous connecter
            à votre espace membre.
          </p>

          <div className="mt-6 rounded-2xl bg-orange-50 px-5 py-4 text-left">
            <div className="flex gap-3">
              <Clock3 size={20} className="mt-0.5 shrink-0 text-orange-500" />

              <p className="text-sm leading-6 text-gray-600">
                Pensez à régler les frais d’inscription directement sur place
                auprès d’un responsable du club.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex flex-1 items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Retour à l’accueil
            </Link>

            <Link
              to="/connexion"
              className="inline-flex flex-1 items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Aller à la connexion
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InscriptionSucces;