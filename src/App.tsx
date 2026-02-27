import Page from "./app/page";
import { DarkModeProvider } from "./app/store/DarkModeContext";
import { LanguageProvider } from "./app/store/LanguageContext";

export default function App() {
  return (
    <LanguageProvider>
      <DarkModeProvider>
        <Page />
      </DarkModeProvider>
    </LanguageProvider>
  );
}
