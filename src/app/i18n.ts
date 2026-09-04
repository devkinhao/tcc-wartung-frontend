/** I18Next. */
import i18n from "i18next";
/** React. */
import { initReactI18next } from "react-i18next";
/** Traduções. */
import enUS from "./locales/en_US.json";
import ptBR from "./locales/pt_BR.json";

/** Inicialização do I18Next. */
i18n.use(initReactI18next).init({
  resources: {
    pt_BR: { translation: ptBR },
    en_US: { translation: enUS },
  },
  fallbackLng: "pt_BR",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
