const DIACRITICS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g");

export function normalize(text: string): string {
  return text.normalize("NFD").replace(DIACRITICS_PATTERN, "").toLowerCase().trim();
}
