// Resposta paginada padrão do Spring Data (Page<T>) — o mesmo formato em
// /customers, /inspections e /notifications. Antes cada módulo redefinia esta
// estrutura (às vezes só com `page.totalElements`); aqui ela fica num lugar só.
export type SpringPage<T> = {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

/**
 * Converte paginação/ordenação da UI para os parâmetros do backend:
 * a UI conta páginas a partir de 1, o Spring a partir de 0. `sort` já vem
 * pronto no formato "campo,direcao"; vazio vira `undefined` (sem ordenação).
 */
export function toSpringPageParams(params: { page: number; size: number; sort?: string | null }) {
  return {
    page: params.page - 1,
    size: params.size,
    sort: params.sort || undefined,
  };
}
