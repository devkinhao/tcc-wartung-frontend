import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ChecklistIcon from "@mui/icons-material/Checklist";
import { IconButton, Stack, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { paths } from "@/routes/paths";
import { saveScrollPosition } from "@/hooks/useScrollRestoration";

type Props = {
  customerId: number;
};

/** Ações da linha — atalhos diretos, sem menu dropdown (Heurística Nielsen #7). */
export function CustomersRowActions({ customerId }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  function goTo(path: string) {
    saveScrollPosition("customers-list.scrollY");
    navigate(path);
  }

  return (
    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
      <Tooltip title={t("customers.rowMenu.view")}>
        <IconButton
          size="small"
          onClick={() => goTo(paths.customerDetails(customerId))}
          aria-label={t("customers.rowMenu.view")}
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("customers.rowMenu.address")}>
        <IconButton
          size="small"
          onClick={() => goTo(paths.customerAddressTab(customerId))}
          aria-label={t("customers.rowMenu.address")}
        >
          <LocationOnIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("customers.rowMenu.inspections")}>
        <IconButton
          size="small"
          onClick={() => goTo(paths.customerInspectionsTab(customerId))}
          aria-label={t("customers.rowMenu.inspections")}
        >
          <ChecklistIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
