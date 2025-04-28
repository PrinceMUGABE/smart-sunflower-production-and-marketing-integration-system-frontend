import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locals/en/translation.json";
import fr from "./locals/fr/translation.json";
import rw from "./locals/rw/translation.json";

// Get saved language or default to English
const savedLanguage = localStorage.getItem("language") || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    rw: { translation: rw }
  },
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
