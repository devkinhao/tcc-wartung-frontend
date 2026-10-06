/** I18Next. */
import i18n from "i18next";
/** React. */
import { initReactI18next } from "react-i18next";
/** Traduções. */
import enUS from "./locales/en_US.json";
import ptBR from "./locales/pt_BR.json";

const SUPPORTED_LANGUAGES = ["pt_BR", "en_US"] as const;
type Language = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_STORAGE_KEY = "language";

export function isSupportedLanguage(value: string | null | undefined): value is Language {
  return SUPPORTED_LANGUAGES.includes(value as Language);
}

/**
 * Idioma da última sessão neste navegador. Permite que telas sem usuário
 * autenticado (login) já abram no idioma certo, antes de a preferência chegar
 * do backend.
 */
export function rememberLanguage(language: string) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    /** localStorage indisponível (modo privado, quota excedida) — ignora. */
  }
}

/** Idioma inicial: o último usado neste navegador; na primeira visita, o do navegador. */
function detectInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLanguage(stored)) return stored;
  } catch {
    /** localStorage indisponível — segue para o idioma do navegador. */
  }
  return navigator.language.toLowerCase().startsWith("en") ? "en_US" : "pt_BR";
}

/** Inicialização do I18Next. */
i18n.use(initReactI18next).init({
  resources: {
    pt_BR: { translation: ptBR },
    en_US: { translation: enUS },
  },
  lng: detectInitialLanguage(),
  fallbackLng: "pt_BR",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
