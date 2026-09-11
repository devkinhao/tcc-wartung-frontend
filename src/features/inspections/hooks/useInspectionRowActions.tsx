import { useState } from "react";

import { RenewInspectionModal, type RenewableInspection } from "../components/RenewInspectionModal";
import { DeactivateInspectionModal, type DeactivatableInspection } from "../components/DeactivateInspectionModal";
import { DeleteInspectionDialog, type DeletableInspection } from "../components/DeleteInspectionDialog";

type Options = {
  /** Chamado com o id da nova inspeção após renovar (para abrir o detalhe). */
  onOpenDetail?: (id: number) => void;
};

/**
 * Estado + modais das ações de linha de uma inspeção (renovar / encerrar /
 * excluir). A lista de inspeções, a aba de inspeções do cliente e a home
 * repetiam exatamente esta fiação; aqui ela fica num lugar só.
 *
 * O objeto-alvo já vem montado pela tela (cada lista tem um formato de linha
 * diferente), então o hook só guarda o alvo e renderiza o modal.
 */
export function useInspectionRowActions({ onOpenDetail }: Options = {}) {
  const [renewTarget, setRenewTarget] = useState<RenewableInspection | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<DeactivatableInspection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeletableInspection | null>(null);

  const actionModals = (
    <>
      <RenewInspectionModal
        open={renewTarget !== null}
        inspection={renewTarget}
        onClose={() => setRenewTarget(null)}
        onOpenDetail={onOpenDetail}
      />
      <DeactivateInspectionModal
        open={deactivateTarget !== null}
        inspection={deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
      />
      <DeleteInspectionDialog
        open={deleteTarget !== null}
        inspection={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );

  return {
    openRenew: setRenewTarget,
    openDeactivate: setDeactivateTarget,
    openDelete: setDeleteTarget,
    actionModals,
  };
}
