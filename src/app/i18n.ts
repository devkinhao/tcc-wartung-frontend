import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ptBR from "./locales/pt_BR.json";
import enUS from "./locales/en_US.json";
import deDE from "./locales/de_DE.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt_BR: { translation: ptBR },
      en_US: { translation: enUS },
      de_DE: { translation: deDE },
    },
    fallbackLng: "pt_BR",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;