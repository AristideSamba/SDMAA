import HeroPages from "../composants/layouts/heroPages";
import imgActivite from "../assets/activite.jpg";
import ActiviteCard from "../composants/activites/ActiviteCard";

function Activites(){
  return(
    <div>
      <HeroPages titre="Nos Activités" 
                  image={imgActivite}
                  intro="Découvrez sur cette page les activités de notre club mais aussi des activités externes et toutes les compétitions à venir"/>
      
      <ActiviteCard />
    </div>
  )
}

export default Activites;