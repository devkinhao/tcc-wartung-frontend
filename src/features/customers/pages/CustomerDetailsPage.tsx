import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ArrowBackIcon      from "@mui/icons-material/ArrowBack";
import WhatsAppIcon       from "@mui/icons-material/WhatsApp";
import MoreVertIcon       from "@mui/icons-material/MoreVert";
import { useTranslation } from "react-i18next";

import { useCustomerDetail }       from "../hooks/useCustomerDetail";
import { useCities }               from "../hooks/useCities";
import { CustomerGeneralTab }      from "../components/tabs/CustomerGeneralTab";
import { CustomerAddressTab }      from "../components/tabs/CustomerAddressTab";
import { CustomerInspectionsTab }  from "../components/tabs/CustomerInspectionsTab";
import { CustomerMovementsTab }    from "../components/tabs/CustomerMovementsTab";
import type {
  CustomerUpdateGeneralRequestDTO,
  CustomerUpdateContactsRequestDTO,
  CustomerUpdateAddressRequestDTO,
} from "../api/customers.detail.api";
import { paths } from "@/routes/paths";
import { buildWhatsAppLink } from "@/utils/whatsapp";

type TabKey = "general" | "address" | "inspections" | "movements";

export default function CustomerDetailsPage() {
  const { t }        = useTranslation();
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [searchParams] = useSearchParams();
  const cities       = useCities();

  const {
    view, isLoading,
    willDeactivateInspections,
    editingGeneral,  setEditingGeneral,
    editingContacts, setEditingContacts,
    editingAddress,  setEditingAddress,
    updateField, updateAddress, resetDraft, handleCepFound,
    mutations,
  } = useCustomerDetail(Number(id));

  // Inicia na aba indicada pela URL (?tab=inspections)
  const initialTab = (searchParams.get("tab") as TabKey) || "general";
  const [tab,    setTab]    = useState<TabKey>(initialTab);
  const [menuEl, setMenuEl] = useState<HTMLElement | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false);

  if (isLoading || !view) {
    return (
      <Stack direction="row" spacing={2} alignItems="center">
        <CircularProgress size={18} />
        <Typography variant="body2" color="text.secondary">
          {t("customerDetails.loading")}
        </Typography>
      </Stack>
    );
  }

  const saveGeneral = () => {
    mutations.general.mutate({
      fantasyName: view.fantasyName,
      legalName:   view.legalName,
      isCustomer:  view.isCustomer,
      abvtexSeal:  view.abvtexSeal,
    } satisfies CustomerUpdateGeneralRequestDTO);
  };

  const handleSaveGeneral = () => {
    if (willDeactivateInspections) {
      setConfirmDeactivateOpen(true);
      return;
    }
    saveGeneral();
  };

  return (
    <Box sx={{ maxWidth: 1200 }}>

      {/* Aviso: desativar o cliente desativa automaticamente as inspeções ativas dele */}
      <Dialog open={confirmDeactivateOpen} onClose={() => setConfirmDeactivateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t("customerDetails.confirmDeactivate.title")}</DialogTitle>
        <DialogContent>
          <Typography>{t("customerDetails.confirmDeactivate.message")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeactivateOpen(false)}>{t("common.actions.cancel")}</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              setConfirmDeactivateOpen(false);
              saveGeneral();
            }}
          >
            {t("common.actions.confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmação de exclusão — substitui window.confirm */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t("customerDetails.confirmDelete.title")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t("customerDetails.confirmDelete.message", { name: view.legalName })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>{t("common.actions.cancel")}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setConfirmDeleteOpen(false);
              mutations.delete.mutate();
            }}
          >
            {t("common.actions.confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Cabeçalho ──────────────────────────────────────────────────── */}
      <Paper elevation={1} sx={{ borderRadius: 2, mb: 2 }}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                <IconButton size="small" onClick={() => navigate(paths.customers)}
                  aria-label={t("customerDetails.actions.back")}>
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Typography fontWeight={700} color="text.primary" noWrap>
                  {view.legalName}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5, flexWrap: "wrap" }}>
                <Typography variant="body2" color="text.secondary">
                  {t("customerDetails.summary.cnpj")} {view.cnpj}
                </Typography>
                <Chip
                  size="small"
                  label={view.isCustomer ? t("customerDetails.status.active") : t("customerDetails.status.inactive")}
                  color={view.isCustomer ? "success" : "default"}
                />
                <Typography variant="body2" color="text.secondary">
                  {t("customerDetails.summary.phone")}: {view.phone || "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("customerDetails.summary.mobile")}: {view.mobilePhone || "—"}
                </Typography>
                <IconButton
                  size="small"
                  aria-label={t("customerDetails.actions.whatsapp")}
                  onClick={() => window.open(buildWhatsAppLink(view.mobilePhone), "_blank")}
                  disabled={!view.mobilePhone}
                >
                  <WhatsAppIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>

            <Box>
              <IconButton
                aria-label={t("customerDetails.actions.actions")}
                onClick={(e) => setMenuEl(e.currentTarget)}
                disabled={mutations.delete.isPending}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu open={Boolean(menuEl)} anchorEl={menuEl} onClose={() => setMenuEl(null)}>
                <MenuItem onClick={() => { setMenuEl(null); setConfirmDeleteOpen(true); }}>
                  {t("customerDetails.actions.delete")}
                </MenuItem>
              </Menu>
            </Box>
          </Stack>
        </Box>

        <Divider />

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}
          textColor="primary" indicatorColor="primary">
          <Tab value="general"     label={t("customerDetails.tabs.general")} />
          <Tab value="address"     label={t("customerDetails.tabs.address")} />
          <Tab value="inspections" label={t("customerDetails.tabs.inspections")} />
          <Tab value="movements"   label={t("customerDetails.tabs.movements")} />
        </Tabs>
      </Paper>

      {/* ── Abas ───────────────────────────────────────────────────────── */}
      {tab === "general" && (
        <CustomerGeneralTab
          view={view}
          updateField={updateField}
          editingGeneral={editingGeneral}
          savingGeneral={mutations.general.isPending}
          onEditGeneral={() => setEditingGeneral(true)}
          onCancelGeneral={() => { resetDraft(); setEditingGeneral(false); }}
          onSaveGeneral={handleSaveGeneral}
          editingContacts={editingContacts}
          savingContacts={mutations.contacts.isPending}
          onEditContacts={() => setEditingContacts(true)}
          onCancelContacts={() => { resetDraft(); setEditingContacts(false); }}
          onSaveContacts={() =>
            mutations.contacts.mutate({
              phone:       view.phone || null,
              mobilePhone: view.mobilePhone || null,
              email:       view.email || null,
            } satisfies CustomerUpdateContactsRequestDTO)
          }
        />
      )}

      {tab === "address" && (
        <CustomerAddressTab
          view={view}
          editing={editingAddress}
          saving={mutations.address.isPending}
          cities={cities}
          updateAddress={updateAddress}
          onCepFound={handleCepFound}
          onEdit={() => setEditingAddress(true)}
          onCancel={() => { resetDraft(); setEditingAddress(false); }}
          onSave={() =>
            mutations.address.mutate({
              zipCode:      view.address.zipCode,
              street:       view.address.street,
              number:       view.address.number,
              complement:   view.address.complement,
              neighborhood: view.address.neighborhood,
              cityId:       view.address.city.id,
            } satisfies CustomerUpdateAddressRequestDTO)
          }
        />
      )}

      {tab === "inspections" && (
        <CustomerInspectionsTab
          customerId={Number(id)}
          customerLegalName={view.legalName}
          customerCnpj={view.cnpj}
          inspections={view.inspections}
        />
      )}
      {tab === "movements"   && <CustomerMovementsTab   view={view} />}

    </Box>
  );
}
