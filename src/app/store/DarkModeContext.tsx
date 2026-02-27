import { createContext, useEffect, useState } from "react";

interface DarkModeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
});

function getInitialDarkMode() {
  const saved = localStorage.getItem("portfolio_dark_mode");
  if (saved === "true") {
    return true;
  }
  if (saved === "false") {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState<boolean>(getInitialDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("portfolio_dark_mode", String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}
