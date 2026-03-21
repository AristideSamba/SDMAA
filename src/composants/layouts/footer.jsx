import {
  Facebook,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Send,
} from "lucide-react";

function Footer() {
  return (
    <footer className="bg-neutral text-neutral-content border-t border-primary/30">
      
      {/* SECTION PRINCIPALE */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-4">

        {/* Identité Club */}
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-wider uppercase">
            SDMAA
          </h2>
          <p className="mt-4 text-sm opacity-80 leading-relaxed">
            Discipline. Honneur. Puissance.
            <br />
            Rejoignez un club où le dépassement de soi
            forge le corps et l’esprit.
          </p>

          <div className="flex gap-4 mt-6">
            <Facebook className="hover:text-primary transition cursor-pointer" />
            <Instagram className="hover:text-primary transition cursor-pointer" />
            <Youtube className="hover:text-primary transition cursor-pointer" />
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h6 className="text-primary font-semibold mb-4 uppercase tracking-wider">
            Navigation
          </h6>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-primary transition cursor-pointer">Accueil</li>
            <li className="hover:text-primary transition cursor-pointer">Le Club</li>
            <li className="hover:text-primary transition cursor-pointer">Planning</li>
            <li className="hover:text-primary transition cursor-pointer">Activités</li>
            <li className="hover:text-primary transition cursor-pointer">Contact</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h6 className="text-primary font-semibold mb-4 uppercase tracking-wider">
            Contact
          </h6>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-primary" />
              <span>123 Rue du Sport, Paris</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={18} className="text-primary" />
              <span>06 12 34 56 78</span>
            </div>

            <div className="flex items-center gap-3">
              <Mail size={18} className="text-primary" />
              <span>contact@tkdelite.fr</span>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h6 className="text-primary font-semibold mb-4 uppercase tracking-wider">
            Newsletter
          </h6>

          <p className="text-sm opacity-80 mb-4">
            Recevez les actualités, stages et compétitions du club.
          </p>

          <form className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Votre email"
              className="input input-bordered input-sm w-full bg-neutral-focus border-primary/40 focus:border-primary"
            />

            <button className="btn btn-primary btn-sm flex items-center gap-2">
              S'inscrire
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* BARRE BASSE */}
      <div className="border-t border-neutral-content/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-xs uppercase tracking-wider">
          <p>
            © {new Date().getFullYear()} SAINT-DENIS MARTIAL ARTS ACADEMY — Tous droits réservés
          </p>

          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="hover:text-primary transition cursor-pointer">
              Mentions légales
            </span>
            <span className="hover:text-primary transition cursor-pointer">
              Confidentialité
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
