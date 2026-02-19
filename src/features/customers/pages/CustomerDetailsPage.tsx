import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DescriptionIcon from "@mui/icons-material/Description";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AbvtexChip } from "../components/AbvtexChip";
import { useCities } from "../hooks/useCities";
import type { CustomerDetailResponseDTO } from "../types/customerDetail";
import {
  deactivateCustomer,
  getCustomerDetail,
  updateCustomerAddress,
  updateCustomerContacts,
  updateCustomerGeneral,
} from "../api/customers.detail.api";
import { useTranslation } from "react-i18next";

function formatDateBR(iso?: string | null) {
  if (!iso) return "—";
  const date = iso.split("T")[0];
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function formatDateTimeBR(iso?: string | null) {
  if (!iso) return "—";
  const [date, time] = iso.split("T");
  // "às" should be translated
  return `${formatDateBR(date)}${time ? ` ${time.slice(0, 5)}` : ""}`;
}

type TabKey = "general" | "address" | "inspections" | "movements";

export default function CustomerDetailsPage() {
  const { t } = useTranslation();

  const { id } = useParams();
  const customerId = Number(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const cities = useCities();

  const [tab, setTab] = useState<TabKey>("general");

  const [menuEl, setMenuEl] = useState<HTMLElement | null>(null);

  const [editingGeneral, setEditingGeneral] = useState(false);
  const [editingContacts, setEditingContacts] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["customer-detail", customerId],
    queryFn: () => getCustomerDetail(customerId),
    enabled: Number.isFinite(customerId) && customerId > 0,
  });

  const [draft, setDraft] = useState<CustomerDetailResponseDTO | null>(null);

  useMemo(() => {
    if (data && !draft) setDraft(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const generalMutation = useMutation({
    mutationFn: (payload: any) => updateCustomerGeneral(customerId, payload),
    onSuccess: (updated) => {
      qc.setQueryData(["customer-detail", customerId], updated);
      setDraft(updated);
      setEditingGeneral(false);
    },
    onError: () => setError(t("customerDetails.errors.updateGeneral")),
  });

  const contactsMutation = useMutation({
    mutationFn: (payload: any) => updateCustomerContacts(customerId, payload),
    onSuccess: (updated) => {
      qc.setQueryData(["customer-detail", customerId], updated);
      setDraft(updated);
      setEditingContacts(false);
    },
    onError: () => setError(t("customerDetails.errors.updateContacts")),
  });

  const addressMutation = useMutation({
    mutationFn: (payload: any) => updateCustomerAddress(customerId, payload),
    onSuccess: (updated) => {
      qc.setQueryData(["customer-detail", customerId], updated);
      setDraft(updated);
      setEditingAddress(false);
    },
    onError: () => setError(t("customerDetails.errors.updateAddress")),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateCustomer(customerId),
    onSuccess: () => {
      navigate("/customers");
    },
    onError: () => setError(t("customerDetails.errors.deactivate")),
  });

  const view = draft ?? data;

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

  const headerActionsDisabled = deactivateMutation.isPending;

  const addressString = `${view.address.street}, ${view.address.number} - ${view.address.neighborhood}, ${view.address.zipCode}`;
  const mapQuery = encodeURIComponent(addressString);

  const handleResetDraftFromQuery = () => {
    if (data) setDraft(data);
  };

  const statusLabel = view.isCustomer
    ? t("customerDetails.status.active")
    : t("customerDetails.status.inactive");

  return (
    <Box sx={{ maxWidth: 1200 }}>
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Paper elevation={1} sx={{ borderRadius: 2, mb: 2 }}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                <IconButton
                  size="small"
                  onClick={() => navigate("/customers")}
                  aria-label={t("customerDetails.actions.back")}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>

                <Typography fontWeight={700} color="text.primary" noWrap sx={{ minWidth: 0 }}>
                  {view.legalName}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5, flexWrap: "wrap" }}>
                <Typography variant="body2" color="text.secondary">
                  {t("customerDetails.summary.cnpj")} {view.cnpj}
                </Typography>

                <Chip size="small" label={statusLabel} color={view.isCustomer ? "success" : "default"} />

                <Typography variant="body2" color="text.secondary">
                  {t("customerDetails.summary.phone")}: {view.phone || "—"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {t("customerDetails.summary.mobile")}: {view.mobilePhone || "—"}
                </Typography>

                <IconButton
                  size="small"
                  aria-label={t("customerDetails.actions.whatsapp")}
                  onClick={() =>
                    window.open(`https://wa.me/${view.mobilePhone?.replace(/\D/g, "")}`, "_blank")
                  }
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
                disabled={headerActionsDisabled}
              >
                <MoreVertIcon />
              </IconButton>

              <Menu open={Boolean(menuEl)} anchorEl={menuEl} onClose={() => setMenuEl(null)}>
                <MenuItem
                  onClick={() => {
                    setMenuEl(null);
                    deactivateMutation.mutate();
                  }}
                >
                  {t("customerDetails.actions.deactivate")}
                </MenuItem>
              </Menu>
            </Box>
          </Stack>
        </Box>

        <Divider />

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ px: 2 }}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab value="general" label={t("customerDetails.tabs.general")} />
          <Tab value="address" label={t("customerDetails.tabs.address")} />
          <Tab value="inspections" label={t("customerDetails.tabs.inspections")} />
          <Tab value="movements" label={t("customerDetails.tabs.movements")} />
        </Tabs>
      </Paper>

      {tab === "general" ? (
        <Stack spacing={2}>
          <Card
            sx={{
              borderRadius: 2,
              transition: (t) => t.transitions.create("box-shadow", { duration: t.transitions.duration.short }),
              "&:hover": { boxShadow: 4 },
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography fontWeight={700} color="text.primary">
                  {t("customerDetails.general.title")}
                </Typography>

                {!editingGeneral ? (
                  <Button startIcon={<EditIcon />} onClick={() => setEditingGeneral(true)}>
                    {t("common.actions.edit")}
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        handleResetDraftFromQuery();
                        setEditingGeneral(false);
                      }}
                    >
                      {t("common.actions.cancel")}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() =>
                        generalMutation.mutate({
                          fantasyName: view.fantasyName,
                          legalName: view.legalName,
                          cnpj: view.cnpj,
                          isCustomer: view.isCustomer,
                          abvtexSeal: view.abvtexSeal,
                        })
                      }
                      disabled={generalMutation.isPending}
                    >
                      {t("common.actions.save")}
                    </Button>
                  </Stack>
                )}
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} md={2}>
                  <TextField label={t("customerDetails.general.fields.code")} value={view.id} size="small" fullWidth disabled />
                </Grid>

                <Grid item xs={12} md={7}>
                  <TextField
                    label={t("customerDetails.general.fields.legalName")}
                    value={view.legalName}
                    size="small"
                    fullWidth
                    disabled={!editingGeneral}
                    onChange={(e) => setDraft((p) => (p ? { ...p, legalName: e.target.value } : p))}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small" disabled={!editingGeneral}>
                    <InputLabel id="abvtex-label">{t("customerDetails.general.fields.abvtexSeal")}</InputLabel>
                    <Select
                      labelId="abvtex-label"
                      label={t("customerDetails.general.fields.abvtexSeal")}
                      value={view.abvtexSeal}
                      onChange={(e) =>
                        setDraft((p) =>
                          p ? { ...p, abvtexSeal: e.target.value as CustomerDetailResponseDTO["abvtexSeal"] } : p
                        )
                      }
                    >
                      <MenuItem value="NAO_POSSUI">{t("abvtex.none")}</MenuItem>
                      <MenuItem value="COBRE">{t("abvtex.copper")}</MenuItem>
                      <MenuItem value="BRONZE">{t("abvtex.bronze")}</MenuItem>
                      <MenuItem value="PRATA">{t("abvtex.silver")}</MenuItem>
                      <MenuItem value="OURO">{t("abvtex.gold")}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={2}>
                  <TextField
                    label={t("customerDetails.general.fields.cnpj")}
                    value={view.cnpj}
                    size="small"
                    fullWidth
                    disabled={!editingGeneral}
                    onChange={(e) => setDraft((p) => (p ? { ...p, cnpj: e.target.value } : p))}
                  />
                </Grid>

                <Grid item xs={12} md={7}>
                  <TextField
                    label={t("customerDetails.general.fields.fantasyName")}
                    value={view.fantasyName}
                    size="small"
                    fullWidth
                    disabled={!editingGeneral}
                    onChange={(e) => setDraft((p) => (p ? { ...p, fantasyName: e.target.value } : p))}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      {t("customerDetails.general.fields.customerActive")}
                    </Typography>
                    <Chip
                      label={view.isCustomer ? t("common.yes") : t("common.no")}
                      color={view.isCustomer ? "success" : "default"}
                      variant={view.isCustomer ? "filled" : "outlined"}
                      sx={{ width: "fit-content" }}
                      onClick={
                        editingGeneral
                          ? () => setDraft((p) => (p ? { ...p, isCustomer: !p.isCustomer } : p))
                          : undefined
                      }
                    />
                    <Box sx={{ mt: 1 }}>
                      <AbvtexChip seal={view.abvtexSeal} />
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card
            sx={{
              borderRadius: 2,
              transition: (t) => t.transitions.create("box-shadow", { duration: t.transitions.duration.short }),
              "&:hover": { boxShadow: 4 },
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography fontWeight={700} color="text.primary">
                  {t("customerDetails.contacts.title")}
                </Typography>

                {!editingContacts ? (
                  <Button startIcon={<EditIcon />} onClick={() => setEditingContacts(true)}>
                    {t("common.actions.edit")}
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        handleResetDraftFromQuery();
                        setEditingContacts(false);
                      }}
                    >
                      {t("common.actions.cancel")}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() =>
                        contactsMutation.mutate({
                          phone: view.phone,
                          mobilePhone: view.mobilePhone,
                          email: view.email,
                        })
                      }
                      disabled={contactsMutation.isPending}
                    >
                      {t("common.actions.save")}
                    </Button>
                  </Stack>
                )}
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label={t("customerDetails.contacts.fields.phone")}
                    value={view.phone ?? ""}
                    size="small"
                    fullWidth
                    disabled={!editingContacts}
                    onChange={(e) => setDraft((p) => (p ? { ...p, phone: e.target.value } : p))}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label={t("customerDetails.contacts.fields.mobile")}
                    value={view.mobilePhone ?? ""}
                    size="small"
                    fullWidth
                    disabled={!editingContacts}
                    onChange={(e) => setDraft((p) => (p ? { ...p, mobilePhone: e.target.value } : p))}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          size="small"
                          aria-label={t("customerDetails.actions.whatsapp")}
                          onClick={() =>
                            window.open(`https://wa.me/${view.mobilePhone?.replace(/\D/g, "")}`, "_blank")
                          }
                          disabled={!view.mobilePhone}
                        >
                          <WhatsAppIcon fontSize="small" />
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label={t("customerDetails.contacts.fields.email")}
                    value={view.email ?? ""}
                    size="small"
                    fullWidth
                    disabled={!editingContacts}
                    onChange={(e) => setDraft((p) => (p ? { ...p, email: e.target.value } : p))}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          size="small"
                          aria-label={t("customerDetails.actions.email")}
                          onClick={() => window.open(`mailto:${view.email}`, "_blank")}
                          disabled={!view.email}
                        >
                          <EmailIcon fontSize="small" />
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Stack>
      ) : null}

      {tab === "address" ? (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 2,
                height: 360,
                transition: (t) => t.transitions.create("box-shadow", { duration: t.transitions.duration.short }),
                "&:hover": { boxShadow: 4 },
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography fontWeight={700}>{t("customerDetails.address.title")}</Typography>

                  {!editingAddress ? (
                    <Button startIcon={<EditIcon />} onClick={() => setEditingAddress(true)}>
                      {t("common.actions.edit")}
                    </Button>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          handleResetDraftFromQuery();
                          setEditingAddress(false);
                        }}
                      >
                        {t("common.actions.cancel")}
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() =>
                          addressMutation.mutate({
                            zipCode: view.address.zipCode,
                            street: view.address.street,
                            number: view.address.number,
                            complement: view.address.complement,
                            neighborhood: view.address.neighborhood,
                            cityId: view.address.city.id,
                          })
                        }
                        disabled={addressMutation.isPending}
                      >
                        {t("common.actions.save")}
                      </Button>
                    </Stack>
                  )}
                </Stack>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label={t("customerDetails.address.fields.zipCode")}
                      size="small"
                      fullWidth
                      disabled={!editingAddress}
                      value={view.address.zipCode ?? ""}
                      onChange={(e) =>
                        setDraft((p) => (p ? { ...p, address: { ...p.address, zipCode: e.target.value } } : p))
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <FormControl fullWidth size="small" disabled={!editingAddress}>
                      <InputLabel id="city-label">{t("customerDetails.address.fields.city")}</InputLabel>
                      <Select
                        labelId="city-label"
                        label={t("customerDetails.address.fields.city")}
                        value={view.address.city?.id ?? ""}
                        onChange={(e) =>
                          setDraft((p) =>
                            p
                              ? {
                                  ...p,
                                  address: {
                                    ...p.address,
                                    city: {
                                      ...(p.address.city ?? { id: 0, name: "" }),
                                      id: Number(e.target.value),
                                      name:
                                        cities.find((c) => c.id === Number(e.target.value))?.name ??
                                        p.address.city?.name ??
                                        "",
                                    },
                                  },
                                }
                              : p
                          )
                        }
                      >
                        {cities.map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label={t("customerDetails.address.fields.street")}
                      size="small"
                      fullWidth
                      disabled={!editingAddress}
                      value={view.address.street ?? ""}
                      onChange={(e) =>
                        setDraft((p) => (p ? { ...p, address: { ...p.address, street: e.target.value } } : p))
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <TextField
                      label={t("customerDetails.address.fields.complement")}
                      size="small"
                      fullWidth
                      disabled={!editingAddress}
                      value={view.address.complement ?? ""}
                      onChange={(e) =>
                        setDraft((p) => (p ? { ...p, address: { ...p.address, complement: e.target.value } } : p))
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label={t("customerDetails.address.fields.number")}
                      size="small"
                      fullWidth
                      disabled={!editingAddress}
                      value={view.address.number ?? ""}
                      onChange={(e) =>
                        setDraft((p) => (p ? { ...p, address: { ...p.address, number: e.target.value } } : p))
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label={t("customerDetails.address.fields.neighborhood")}
                      size="small"
                      fullWidth
                      disabled={!editingAddress}
                      value={view.address.neighborhood ?? ""}
                      onChange={(e) =>
                        setDraft((p) =>
                          p ? { ...p, address: { ...p.address, neighborhood: e.target.value } } : p
                        )
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                height: 360,
                transition: (t) => t.transitions.create("box-shadow", { duration: t.transitions.duration.short }),
                "&:hover": { boxShadow: 4 },
              }}
            >
              <Box
                component="iframe"
                title={t("customerDetails.address.mapTitle")}
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                sx={{ border: 0, width: "100%", height: "100%", display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Card>
          </Grid>
        </Grid>
      ) : null}

      {tab === "inspections" ? (
        <Paper elevation={1} sx={{ borderRadius: 2, p: 2 }}>
          <Typography fontWeight={700} sx={{ mb: 2 }}>
            {t("customerDetails.inspections.title")}
          </Typography>

          <Box sx={{ border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 2, overflow: "hidden" }}>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
              <Box component="thead" sx={{ bgcolor: "background.default" }}>
                <Box component="tr">
                  {[
                    t("customerDetails.inspections.table.inspectionDate"),
                    t("customerDetails.inspections.table.service"),
                    t("customerDetails.inspections.table.notes"),
                    t("customerDetails.inspections.table.expiration"),
                    t("customerDetails.inspections.table.documents"),
                  ].map((h) => (
                    <Box
                      key={h}
                      component="th"
                      sx={{
                        textAlign: "left",
                        fontWeight: 700,
                        fontSize: 13,
                        px: 2,
                        py: 1,
                        borderBottom: (t) => `1px solid ${t.palette.divider}`,
                      }}
                    >
                      {h}
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box component="tbody">
                {view.inspections?.length ? (
                  view.inspections.map((i) => (
                    <Box key={i.id} component="tr" sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                      <Box component="td" sx={{ px: 2, py: 1, borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
                        {formatDateBR(i.inspectionDate)}
                      </Box>

                      <Box component="td" sx={{ px: 2, py: 1, borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="body2">{i.serviceType?.name ?? "—"}</Typography>

                          {!i.isActive && (
                            <Chip size="small" label={t("customerDetails.inspections.status.inactive")} color="default" variant="outlined" />
                          )}

                          {i.isRenewed && <Chip size="small" label={t("customerDetails.inspections.status.renewed")} color="info" />}
                        </Stack>
                      </Box>

                      <Box
                        component="td"
                        sx={{
                          px: 2,
                          py: 1,
                          borderBottom: (t) => `1px solid ${t.palette.divider}`,
                          color: "text.secondary",
                        }}
                      >
                        {i.notes || "—"}
                      </Box>

                      <Box component="td" sx={{ px: 2, py: 1, borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
                        {formatDateBR(i.expirationDate)}
                      </Box>

                      <Box
                        component="td"
                        sx={{
                          px: 2,
                          py: 1,
                          borderBottom: (t) => `1px solid ${t.palette.divider}`,
                          textAlign: "center",
                        }}
                      >
                        {i.documents?.length ? (
                          <IconButton
                            size="small"
                            aria-label={t("customerDetails.inspections.actions.openDocuments")}
                            /* onClick={() => handleOpenDocuments(i.documents)} */
                          >
                            <Badge badgeContent={i.documents.length} color="primary">
                              <DescriptionIcon fontSize="small" />
                            </Badge>
                          </IconButton>
                        ) : (
                          "—"
                        )}
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box component="tr">
                    <Box component="td" colSpan={5} sx={{ px: 2, py: 2, color: "text.secondary" }}>
                      {t("customerDetails.inspections.empty")}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>
      ) : null}

      {tab === "movements" ? (
        <Paper elevation={1} sx={{ borderRadius: 2, p: 2, maxWidth: 720 }}>
          <Typography fontWeight={700} sx={{ mb: 2 }}>
            {t("customerDetails.movements.title")}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label={t("customerDetails.movements.fields.createdAt")}
                size="small"
                fullWidth
                value={
                  view.createdAt
                    ? t("customerDetails.movements.format.dateTime", { date: formatDateBR(view.createdAt), time: formatDateTimeBR(view.createdAt).split(" ").slice(-1)[0] })
                    : "—"
                }
                disabled
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label={t("customerDetails.movements.fields.createdBy")}
                size="small"
                fullWidth
                value={view.createdByUsername ?? "—"}
                disabled
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label={t("customerDetails.movements.fields.updatedAt")}
                size="small"
                fullWidth
                value={
                  view.updatedAt
                    ? t("customerDetails.movements.format.dateTime", { date: formatDateBR(view.updatedAt), time: formatDateTimeBR(view.updatedAt).split(" ").slice(-1)[0] })
                    : "—"
                }
                disabled
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label={t("customerDetails.movements.fields.updatedBy")}
                size="small"
                fullWidth
                value={view.updatedByUsername ?? "—"}
                disabled
              />
            </Grid>
          </Grid>
        </Paper>
      ) : null}
    </Box>
  );
}