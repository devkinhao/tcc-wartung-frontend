import { ConfirmModal } from "@/components/ConfirmModal";
import { paths } from "@/routes/paths";
import { Close, People } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

type CompanyCreatedModalProps = {
  open: boolean;
  /** Empresa recém-cadastrada, usada nos atalhos de navegação. */
  companyId: number | null;
  companyName: string;
  onClose: () => void;
};

/** Modal exibida após o cadastro de uma empresa, para escolher o próximo passo. */
export function CompanyCreatedModal({
  open,
  companyId,
  companyName,
  onClose,
}: CompanyCreatedModalProps) {
  /** Hooks. */
  const { t } = useTranslation();
  const navigate = useNavigate();

  /** Navega para a rota da empresa criada ou para a lista se ela não estiver disponível. */
  const goTo = (path: string | null) => {
    navigate(path ?? paths.customers);
    onClose();
  };

  return (
    <ConfirmModal
      open={open}
      title={t("customers.createdModal.title")}
      message={t("customers.createdModal.message", { name: companyName })}
      actions={[
        {
          label: t("customers.createdModal.actions.close"),
          tooltip: t("customers.createdModal.actions.tooltip.close"),
          onClick: onClose,
          startIcon: Close,
        },
        {
          label: t("customers.createdModal.actions.openRecord"),
          tooltip: t("customers.createdModal.actions.tooltip.openRecord"),
          onClick: () =>
            goTo(companyId ? paths.customerDetails(companyId) : null),
          startIcon: People,
        },
      ]}
    />
  );
}
