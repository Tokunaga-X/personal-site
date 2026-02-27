import { createContext, useEffect, useState } from "react";
import { SupportedLanguage, TranslationKey, translations } from "../constants/translations";

interface LanguageContextType {
  language: SupportedLanguage;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  toggleLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    const cached = localStorage.getItem("portfolio_language");
    return cached === "zh" ? "zh" : "en";
  });

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem("portfolio_language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "zh" : "en"));
  };

  const t = (key: TranslationKey) => {
    return translations[language][key];
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
