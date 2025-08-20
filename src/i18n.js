import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locals/en/translation.json";
import fr from "./locals/fr/translation.json";
import rw from "./locals/rw/translation.json";

// Get saved language or default to English
const getSavedLanguage = () => {
  try {
    return localStorage.getItem("language") || "en";
  } catch (error) {
    console.warn("localStorage not available, using default language");
    return "en";
  }
};

const savedLanguage = getSavedLanguage();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    rw: { translation: rw }
  },
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: { 
    escapeValue: false 
  },
  react: {
    useSuspense: false
  },
  // Add debug mode temporarily to see what's happening
  debug: false // Set to true if you want to see debug info
});

// Save language preference when changed
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem("language", lng);
    console.log(`Language changed to: ${lng}`);
  } catch (error) {
    console.warn("Could not save language to localStorage:", error);
  }
});

export default i18n;