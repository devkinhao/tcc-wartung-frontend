import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { qk } from "@/api/keys";
import { paths } from "@/routes/paths";
import { useAlertDays } from "@/features/configurations/hooks/useAlertDays";
import { getExpirationStatus } from "@/utils/expirationStatus";
import { daysFromToday } from "@/utils/date";
import { buildWhatsAppLink } from "@/utils/whatsapp";
import { getDashboard } from "@/features/dashboard/api/dashboard.api";
import { listAllInspections, type InspectionListItem } from "../../inspections/api/inspections.list.api";
import { RenewInspectionModal, type RenewableInspection } from "../../inspections/components/RenewInspectionModal";
import {
  DeactivateInspectionModal,
  type DeactivatableInspection,
} from "../../inspections/components/DeactivateInspectionModal";

const ATTENTION_LIMIT = 6;

type StatTone = "expired" | "near" | "ok";

function HomeStatCard({
  label,
  value,
  tone,
  icon,
  tooltip,
  onClick,
}: {
  label: string;
  value: number;
  tone: StatTone;
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
}) {
  const color =
    tone === "expired" ? "error.main" : tone === "near" ? "warning.main" : "success.main";

  return (
    <Tooltip title={tooltip}>
      <Card sx={{ flex: 1, borderTop: 4, borderTopColor: color }}>
        <CardActionArea onClick={onClick} sx={{ height: "100%" }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="subtitle1" color="text.primary">
                  {label}
                </Typography>
                <Typography variant="h3" fontWeight={800} color={color} lineHeight={1.1} sx={{ mt: 0.5 }}>
                  {value}
                </Typography>
              </Box>
              <Box sx={{ color, opacity: 0.85 }}>{icon}</Box>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    </Tooltip>
  );
}

function AttentionRow({
  row,
  onRenew,
  onDeactivate,
}: {
  row: InspectionListItem;
  onRenew: (row: InspectionListItem) => void;
  onDeactivate: (row: InspectionListItem) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuEl, setMenuEl] = useState<HTMLElement | null>(null);

  const openDetails = () => navigate(paths.inspectionDetails(row.id));

  const days = daysFromToday(row.expirationDate);
  const overdue = days < 0;
  const absDays = Math.abs(days);
  const dayUnit = t(absDays === 1 ? "common.day" : "common.days");
  const urgencyText =
    days === 0
      ? t("home.attention.dueToday")
      : overdue
        ? t("home.attention.overdue", { count: absDays, unit: dayUnit })
        : t("home.attention.dueIn", { count: absDays, unit: dayUnit });

  const whatsappLink = row.customerMobilePhone ? buildWhatsAppLink(row.customerMobilePhone) : null;

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      alignItems={{ sm: "center" }}
      justifyContent="space-between"
      onClick={openDetails}
      sx={{
        px: 2.5,
        py: 2,
        cursor: "pointer",
        "&:hover": { bgcolor: "action.hover" },
        "&:hover .home-attention-service": { textDecoration: "underline" },
      }}
    >
      <Tooltip title={t("home.attention.openTooltip")} followCursor enterDelay={500}>
        <Box
          sx={{
            minWidth: 0,
            flex: 1,
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography variant="subtitle1" color="text.primary" noWrap className="home-attention-service">
            {row.notes ? `${row.serviceTypeName} — ${row.notes}` : row.serviceTypeName}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.customerCity ? `${row.customerLegalName} · ${row.customerCity}` : row.customerLegalName}
          </Typography>
          <Typography variant="body2" fontWeight={700} color={overdue ? "error.main" : "warning.main"}>
            {urgencyText}
          </Typography>
        </Box>
      </Tooltip>

      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        sx={{ flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip title={whatsappLink ? t("home.attention.whatsappTooltip") : t("home.attention.noPhone")}>
          <span>
            <IconButton
              color="success"
              disabled={!whatsappLink}
              onClick={() => whatsappLink && window.open(whatsappLink, "_blank")}
              aria-label={t("home.attention.whatsappTooltip")}
            >
              <WhatsAppIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={t("home.attention.renewTooltip")}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AutorenewIcon />}
            onClick={() => onRenew(row)}
            sx={{ textTransform: "none" }}
          >
            {t("inspections.renewModal.actions.confirmShort")}
          </Button>
        </Tooltip>

        <Tooltip title={t("common.actions.more")}>
          <IconButton
            size="small"
            onClick={(e) => setMenuEl(e.currentTarget)}
            aria-label={t("common.actions.more")}
          >
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
        <Menu anchorEl={menuEl} open={Boolean(menuEl)} onClose={() => setMenuEl(null)}>
          <MenuItem
            onClick={() => {
              setMenuEl(null);
              onDeactivate(row);
            }}
          >
            {t("inspections.deactivate.action")}
          </MenuItem>
        </Menu>
      </Stack>
    </Stack>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const alertDays = useAlertDays();

  const [renewTarget, setRenewTarget] = useState<RenewableInspection | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<DeactivatableInspection | null>(null);

  const { data: dashboard, isLoading: loadingStatus } = useQuery({
    queryKey: qk.dashboard(),
    queryFn: getDashboard,
    staleTime: 1000 * 60 * 5,
  });

  const { data: upcoming, isLoading: loadingUpcoming } = useQuery({
    queryKey: qk.inspectionsList({ scope: "home-attention" }),
    queryFn: () => listAllInspections({ status: "", search: "" }, 1, 30, "expirationDate", "asc"),
    staleTime: 1000 * 60,
  });

  const status = dashboard?.inspectionStatus;

  // Só o que precisa de ação: inspeções ativas, vencidas ou dentro da janela de
  // alerta. A listagem agora inclui renovadas/encerradas (com data de vencimento
  // antiga), então o filtro por isActive é necessário aqui.
  const attention = (upcoming?.content ?? []).filter((i) => {
    if (!i.isActive) return false;
    const s = getExpirationStatus(i.expirationDate, alertDays);
    return s === "expired" || s === "near";
  });
  const rows = attention.slice(0, ATTENTION_LIMIT);
  // Contagem real (o dashboard sabe o total; a lista busca no máximo 30).
  const attentionTotal = status ? status.expired + status.nearExpiration : attention.length;
  const overflow = Math.max(attentionTotal - rows.length, 0);

  const openRenew = (row: InspectionListItem) =>
    setRenewTarget({
      id: row.id,
      inspectionDate: row.inspectionDate,
      expirationDate: row.expirationDate,
      customerLegalName: row.customerLegalName,
      serviceTypeName: row.serviceTypeName,
    });

  const openDeactivate = (row: InspectionListItem) =>
    setDeactivateTarget({
      id: row.id,
      serviceTypeName: row.serviceTypeName,
      customerLegalName: row.customerLegalName,
    });

  return (
    <Box sx={{ width: "100%", maxWidth: 1100 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        {t("home.title")}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t("home.subtitle")}
      </Typography>

      {/* Cartões de ação */}
      {loadingStatus || !status ? (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={128} sx={{ flex: 1 }} />
          ))}
        </Stack>
      ) : (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <HomeStatCard
            label={t("home.cards.expired")}
            value={status.expired}
            tone="expired"
            icon={<ErrorOutlineIcon fontSize="large" />}
            tooltip={t("home.cards.tooltip.expired")}
            onClick={() => navigate(paths.inspectionsByStatus("expired"))}
          />
          <HomeStatCard
            label={t("home.cards.near", { days: alertDays })}
            value={status.nearExpiration}
            tone="near"
            icon={<WarningAmberIcon fontSize="large" />}
            tooltip={t("home.cards.tooltip.near", { days: alertDays })}
            onClick={() => navigate(paths.inspectionsByStatus("near"))}
          />
          <HomeStatCard
            label={t("home.cards.onTrack")}
            value={status.onTrack}
            tone="ok"
            icon={<CheckCircleOutlineIcon fontSize="large" />}
            tooltip={t("home.cards.tooltip.onTrack")}
            onClick={() => navigate(paths.inspectionsByStatus("ok"))}
          />
        </Stack>
      )}

      {/* Inspeções que precisam de atenção */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 4, mb: 1.5 }}>
        <Typography variant="h6" fontWeight={700}>
          {t("home.attention.title")}
        </Typography>
        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate(paths.inspections)}
          sx={{ textTransform: "none" }}
        >
          {t("home.attention.seeAll")}
        </Button>
      </Stack>

      <Card>
        {loadingUpcoming ? (
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" sx={{ py: 5 }}>
            <CircularProgress size={20} />
            <Typography color="text.secondary">{t("common.loading")}</Typography>
          </Stack>
        ) : rows.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 5, textAlign: "center" }}>
            {t("home.attention.empty")}
          </Typography>
        ) : (
          <>
            {rows.map((row, index) => (
              <Box key={row.id}>
                {index > 0 && <Divider />}
                <AttentionRow row={row} onRenew={openRenew} onDeactivate={openDeactivate} />
              </Box>
            ))}

            {overflow > 0 && (
              <>
                <Divider />
                <Button
                  fullWidth
                  onClick={() => navigate(paths.inspectionsByStatus("expired"))}
                  sx={{ textTransform: "none", py: 1.5 }}
                >
                  {t("home.attention.more", { count: overflow })}
                </Button>
              </>
            )}
          </>
        )}
      </Card>

      <RenewInspectionModal
        open={renewTarget !== null}
        inspection={renewTarget}
        onClose={() => setRenewTarget(null)}
      />

      <DeactivateInspectionModal
        open={deactivateTarget !== null}
        inspection={deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
      />
    </Box>
  );
}
