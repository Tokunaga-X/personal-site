import Page from "./app/page";
import { LanguageProvider } from "./app/store/LanguageContext";

export default function App() {
  return (
    <LanguageProvider>
      <Page />
    </LanguageProvider>
  );
}
