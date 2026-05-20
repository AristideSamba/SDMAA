import HeroPages from "../composants/layouts/heroPages";
import equipement from "../assets/equipement.jpg";
import PresentationClub from "../composants/leClub/PresentationClub";
import HistoriqueClub from "../composants/leClub/HistoriqueClub";

function LeClub() {
  return (
    <div>
      <HeroPages titre="Découvrez notre club" 
                  intro="Vous trouverez tout ce qu'il faut savoir sur notre club sur cette page."
                  image={equipement}/>
      <PresentationClub />
      <HistoriqueClub />
    </div>
  );
}

export default LeClub;