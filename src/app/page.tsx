import { useContext } from "react";
import About from "./About/page";
import Agents from "./Agents/page";
import Contact from "./Contact/page";
import Footer from "./Footer/page";
import Header from "./Header/page";
import Home from "./Home/page";
import Mixtape from "./Music/Mixtape";
import Rankings from "./Rankings/page";
import Stack from "./Stack/page";
import { useHeroScene } from "./hooks/useHeroScene";
import { useReveal } from "./hooks/useReveal";
import { LanguageContext } from "./store/LanguageContext";

export default function Page() {
  const { language, t } = useContext(LanguageContext);
  useReveal(language);
  useHeroScene();

  return (
    <>
      <a className="skip-link" href="#manifesto">
        {t("skip")}
      </a>
      <Header />
      <main>
        <Home />
        <About />
        <Stack />
        <Agents />
        <Rankings />
        <Contact />
      </main>
      <Footer />
      <Mixtape />
    </>
  );
}
