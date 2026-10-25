import { createContext, useEffect, useState, type ReactNode } from "react";
import { SupportedLanguage, TranslationKey, translations } from "../constants/translations";

interface LanguageContextType {
  language: SupportedLanguage;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

function readCachedLanguage(): SupportedLanguage {
  try {
    return localStorage.getItem("portfolio_language") === "en" ? "en" : "zh";
  } catch {
    return "zh";
  }
}

export const LanguageContext = createContext<LanguageContextType>({
  language: "zh",
  toggleLanguage: () => {},
  t: (key) => translations.zh[key],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>(readCachedLanguage);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-Hans" : "en";
    document.title = translations[language].pageTitle;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", translations[language].pageDescription);
    try {
      localStorage.setItem("portfolio_language", language);
    } catch {
      /* private mode */
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "zh" : "en"));
  };

  const t = (key: TranslationKey) => translations[language][key];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
