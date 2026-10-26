import { useContext } from "react";
import About from "./About/page";
import Contact from "./Contact/page";
import Footer from "./Footer/page";
import Header from "./Header/page";
import Home from "./Home/page";
import Stack from "./Stack/page";
import { useReveal } from "./hooks/useReveal";
import { LanguageContext } from "./store/LanguageContext";

export default function Page() {
  const { language, t } = useContext(LanguageContext);
  useReveal(language);

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
        <Contact />
      </main>
      <Footer />
    </>
  );
}
