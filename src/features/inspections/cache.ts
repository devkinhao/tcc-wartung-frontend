import type { QueryClient } from "@tanstack/react-query";
import { qk } from "@/api/keys";

type Options = {
  /** Invalida também o detalhe desta inspeção. */
  inspectionId?: number;
  /** Invalida a ficha da empresa (quando a ação partiu dela). */
  customerId?: number | null;
};

/**
 * Revalida os caches afetados por criar / editar / renovar / encerrar / excluir
 * uma inspeção. Antes cada modal repetia (e divergia n)este conjunto de
 * `invalidateQueries`; centralizar evita que um fluxo esqueça de atualizar
 * alguma tela.
 *
 * Sempre afetados:
 *  - lista de inspeções;
 *  - dashboard (contagem por status de vencimento);
 *  - lista de empresas — ela exibe `activeInspections` e `nextExpirationDate`
 *    (e ordena por essa data por padrão), então qualquer mudança em inspeção a
 *    desatualiza, inclusive a ordem das linhas.
 *
 * O detalhe da inspeção e a ficha da empresa são opcionais, conforme o fluxo.
 */
export function invalidateInspectionCaches(qc: QueryClient, options: Options = {}) {
  qc.invalidateQueries({ queryKey: qk.inspectionsListAll });
  qc.invalidateQueries({ queryKey: qk.dashboard() });
  qc.invalidateQueries({ queryKey: qk.customersAll });

  if (options.inspectionId) {
    qc.invalidateQueries({ queryKey: qk.inspectionDetail(options.inspectionId) });
  }
  if (options.customerId) {
    qc.invalidateQueries({ queryKey: qk.customerDetail(options.customerId) });
  }
}
