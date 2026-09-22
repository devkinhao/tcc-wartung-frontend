// O backend devolve o download sempre como "application/octet-stream" —
// deduzimos o tipo real pela extensão pra saber o que dá pra pré-visualizar
// inline no navegador (imagem/PDF) e o que só dá pra baixar (docx, xlsx, etc).
export function guessMimeType(name: string): string | null {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf": return "application/pdf";
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "gif": return "image/gif";
    case "bmp": return "image/bmp";
    case "webp": return "image/webp";
    case "svg": return "image/svg+xml";
    default: return null;
  }
}

export function isDocx(name: string): boolean {
  return name.toLowerCase().endsWith(".docx");
}
