import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import InfoAccueil from "../composants/home/InfoAccueil";
import Abonnements from "../composants/home/abonnements";
import SectionInfo from "../composants/home/sectionInfo";

function Home(){
  const location = useLocation();

useEffect(() => {
  if (location.state?.scrollTo === "abonnements") {
    setTimeout(() => {
      document
        .getElementById("abonnements")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 500);
  }
}, [location]);
  return(
    <>
      <InfoAccueil />
      <Abonnements />
      <SectionInfo />
    </>
  )
}

export default Home;