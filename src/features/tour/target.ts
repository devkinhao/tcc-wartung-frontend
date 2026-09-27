/**
 * Convenção de ancoragem dos tutoriais: o elemento a ser destacado carrega
 * `data-tour="<id>"` e o passo referencia esse mesmo id. Manter a marcação como
 * atributo (em vez de ref/contexto) evita que as telas precisem conhecer o
 * motor de tours — elas só declaram "este é o campo de CNPJ".
 */
export function tourSelector(id: string): string {
  return `[data-tour="${id}"]`;
}

/**
 * Id do item da sidebar que aponta para `path`. Os tutoriais começam pelo menu
 * para ensinar o caminho, então referenciam o item pela rota de destino em vez
 * de um id solto que poderia divergir do menu.
 */
export function sidebarTarget(path: string): string {
  return `sidebar:${path}`;
}
