import React, { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LanguageIcon from "@mui/icons-material/Language";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import ChatIcon from "@mui/icons-material/Chat";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { canAccess } from "@/features/auth/permissions";
import { User } from "../types/User";
import { changePassword, getAvatar, getMe, removeAvatar, updateMe, uploadAvatar } from "../api/user.api";
import { useNotify } from "@/hooks/useNotify";
import { useTranslation } from "react-i18next";
import { qk } from "@/api/keys";
import { MaskedTextField } from "@/components/MaskedTextField";
import { Breadcrumb } from "@/layout/header/Breadcrumb";
import { breadcrumbMap } from "@/layout/header/breadcrumbMap";
import { paths } from "@/routes/paths";
import { typography } from "@/styles/typography";
import { usePreferences } from "@/features/preferences/usePreferences";
import { getPreferenceOptions } from "@/features/preferences/api/preferences.api";
import { PreferenceName } from "@/features/preferences/types/Preferences";
import { toCamelCase } from "@/utils/strings";

// Espelha as constraints do UserUpdateRequestDTO do backend (@Pattern cpf,
// @Email) — feedback instantâneo, sem round-trip.
const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type TabKey = "profile" | "preferences";

// ── Ícones e ordem de exibição das preferências ─────────────────────────────

const FLAG_ICON_STYLE = { fontSize: typography.size.flagIcon, lineHeight: 1 };

const PREFERENCE_OPTION_ICONS: Record<string, Record<string, React.ReactNode>> = {
  THEME: {
    light: <LightModeIcon fontSize="small" sx={{ color: "warning.main" }} />,
    dark: <DarkModeIcon fontSize="small" sx={{ color: "primary.main" }} />,
  },
  LANGUAGE: {
    pt_BR: <span style={FLAG_ICON_STYLE}>🇧🇷</span>,
    en_US: <span style={FLAG_ICON_STYLE}>🇺🇸</span>,
    de_DE: <span style={FLAG_ICON_STYLE}>🇩🇪</span>,
  },
  SHOW_NOTIFICATIONS: {
    true: <NotificationsActiveIcon fontSize="small" sx={{ color: "primary.main" }} />,
    false: <NotificationsOffIcon fontSize="small" sx={{ color: "text.disabled" }} />,
  },
  CHATBOT_ENABLED: {
    true: <ChatIcon fontSize="small" sx={{ color: "primary.main" }} />,
    false: <ChatBubbleOutlineIcon fontSize="small" sx={{ color: "text.disabled" }} />,
  },
};

const PREFERENCE_ORDER = [
  PreferenceName.LANGUAGE,
  PreferenceName.THEME,
  PreferenceName.SHOW_NOTIFICATIONS,
  PreferenceName.CHATBOT_ENABLED,
];

export default function UserProfile() {
  const { t } = useTranslation();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchParams] = useSearchParams();

  // Inicia na aba indicada pela URL (?tab=preferences), usada pelo menu do usuário/chatbot
  const initialTab = (searchParams.get("tab") as TabKey) || "profile";
  const [tab, setTab] = useState<TabKey>(initialTab);

  const [isEditing, setIsEditing] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const [showPasswords, setShowPasswords] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);

  const { data: user, isLoading } = useQuery<User>({
    queryKey: qk.me(),
    queryFn: getMe,
  });

  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [creaNumber, setCreaNumber] = useState("");

  function loadAvatarPreview(u: User) {
    if (u.id && u.avatarUrl) {
      getAvatar(u.id)
        .then(setAvatarPreview)
        .catch(() => setAvatarPreview(null));
    } else {
      setAvatarPreview(null);
    }
  }

  React.useEffect(() => {
    if (!user) return;

    setFullName(user.fullName);
    setCpf(user.cpf ?? "");
    setEmail(user.email ?? "");
    setCreaNumber(user.creaNumber ?? "");
    loadAvatarPreview(user);
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.me() });
      setIsEditing(false);
      notify.success("notify.success.saved");
    },
  });

  const avatarMutation = useMutation({
    mutationFn: uploadAvatar,

    async onMutate(file) {
      await queryClient.cancelQueries({ queryKey: qk.me() });
      const previousUser = queryClient.getQueryData<User>(["me"]);

      if (previousUser) {
        const previewUrl = URL.createObjectURL(file);
        queryClient.setQueryData<User>(["me"], { ...previousUser, avatarUrl: previewUrl });
      }

      return { previousUser };
    },

    onError(_, __, context) {
      notify.error("notify.error.saveFailed");
      if (context?.previousUser) queryClient.setQueryData(["me"], context.previousUser);
    },

    onSettled() {
      queryClient.invalidateQueries({ queryKey: qk.me() });
    },
  });

  const removeAvatarMutation = useMutation({
    mutationFn: removeAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.me() });
    },
    onError: (err) => notify.fromError(err),
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setPasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      notify.success("notify.success.passwordChanged");
    },
    onError: (err) => notify.fromError(err),
  });

  // ── Preferências ─────────────────────────────────────────────────────────

  const { preferences, setPreference, isLoading: preferencesLoading } = usePreferences();
  const { data: preferenceOptions, isLoading: loadingPreferenceOptions } = useQuery({
    queryKey: qk.preferenceOptions(),
    queryFn: getPreferenceOptions,
    staleTime: Infinity,
  });

  function optionLabel(prefName: string, value: string): string {
    return t(`preferences.options.${prefName}.${value}`, { defaultValue: value });
  }

  const preferenceCardSx = {
    p: 2.5,
    borderRadius: 2,
    bgcolor: "background.default",
    transition: (th: any) => th.transitions.create("box-shadow", { duration: th.transitions.duration.short }),
    "&:hover": { boxShadow: 4 },
  } as const;

  const sortedPreferenceEntries = preferenceOptions
    ? Object.entries(preferenceOptions).sort(([a], [b]) => {
        const ia = PREFERENCE_ORDER.indexOf(a as PreferenceName);
        const ib = PREFERENCE_ORDER.indexOf(b as PreferenceName);
        if (ia === -1 && ib === -1) return 0;
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      })
    : [];

  // ── Perfil ───────────────────────────────────────────────────────────────

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarRemoved(false);
  }

  function handleRemoveAvatar() {
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarRemoved(true);
  }

  function handleSaveProfile() {
    updateMutation.mutate({
      fullName: fullName.trim(),
      ...(cpf.trim() ? { cpf: cpf.trim() } : {}),
      ...(email.trim() ? { email: email.trim() } : {}),
      ...(creaNumber.trim() ? { creaNumber: creaNumber.trim() } : {}),
    });

    if (avatarFile) {
      avatarMutation.mutate(avatarFile);
    } else if (avatarRemoved) {
      removeAvatarMutation.mutate();
      setAvatarRemoved(false);
    }
  }

  function handleCancelEdit() {
    if (!user) return;
    setFullName(user.fullName);
    setCpf(user.cpf ?? "");
    setEmail(user.email ?? "");
    setCreaNumber(user.creaNumber ?? "");
    setAvatarFile(null);
    setAvatarRemoved(false);
    loadAvatarPreview(user);
    setIsEditing(false);
  }

  function handleChangePassword() {
    passwordMutation.mutate({ currentPassword, newPassword });
  }

  const cpfError = cpf.trim() !== "" && !CPF_REGEX.test(cpf.trim());
  const emailError = email.trim() !== "" && !EMAIL_REGEX.test(email.trim());
  const isProfileValid = fullName.trim() !== "" && !cpfError && !emailError;

  const passwordMismatch = confirmPassword !== "" && newPassword !== confirmPassword;
  const isPasswordFormValid =
    currentPassword.trim() !== "" && newPassword.trim() !== "" && newPassword === confirmPassword;

  const isActive = user?.isActive ?? true;
  const permissions = user?.permissions ?? [];
  const canChangePassword = canAccess(permissions, ["ROLE_CHANGE_OWN_PASSWORD"]);

  return (
    <>
      <Paper
        elevation={1}
        sx={{
          maxWidth: 896,
          p: 3,
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Breadcrumb items={breadcrumbMap[paths.userProfile]} size="large" />
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab value="profile" label={t("userProfile.tabs.profile")} />
          <Tab value="preferences" label={t("userProfile.tabs.preferences")} />
        </Tabs>

        {tab === "profile" &&
          (isLoading ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                {t("userProfile.loading")}
              </Typography>
            </Stack>
          ) : (
            <>
              {/* Avatar + Status */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ sm: "center" }} sx={{ mb: 3 }}>
                <Box sx={{ position: "relative", width: 112 }}>
                  {avatarPreview ? (
                    <Avatar
                      src={avatarPreview}
                      sx={{ width: 112, height: 112, fontSize: typography.size.avatarInitials }}
                      alt={t("common.avatarAlt")}
                    />
                  ) : (
                    <Avatar sx={{ width: 112, height: 112, fontSize: typography.size.avatarInitials }}>
                      {fullName?.charAt(0)}
                    </Avatar>
                  )}

                  {isEditing && (
                    <>
                      <IconButton
                        onClick={() => fileInputRef.current?.click()}
                        size="small"
                        aria-label={t("userProfile.actions.changeAvatar")}
                        sx={{
                          position: "absolute",
                          bottom: 6,
                          right: 6,
                          bgcolor: "primary.main",
                          color: "common.white",
                          "&:hover": { bgcolor: "primary.dark" },
                        }}
                      >
                        <PhotoCameraIcon fontSize="small" />
                      </IconButton>

                      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />

                      {avatarPreview && (
                        <IconButton
                          onClick={handleRemoveAvatar}
                          size="small"
                          aria-label={t("userProfile.actions.removeAvatar")}
                          sx={{
                            position: "absolute",
                            bottom: 6,
                            left: 6,
                            bgcolor: "error.main",
                            color: "common.white",
                            "&:hover": { bgcolor: "error.dark" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </>
                  )}
                </Box>

                <Box>
                  <Typography fontWeight={typography.weight.semibold} fontSize={18} color="text.primary">
                    {fullName}
                  </Typography>

                  <Chip
                    size="small"
                    label={isActive ? t("common.status.active") : t("common.status.inactive")}
                    color={isActive ? "success" : "error"}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Stack>

              {/* Form */}
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  transition: (th) => th.transitions.create("box-shadow", { duration: th.transitions.duration.short }),
                  "&:hover": { boxShadow: 4 },
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t("userProfile.fields.fullName")}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      size="small"
                      disabled={!isEditing}
                      required
                      inputProps={{ maxLength: 50 }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <MaskedTextField
                      mask="cpf"
                      fullWidth
                      label={t("userProfile.fields.cpf")}
                      value={cpf}
                      onChange={(v) => setCpf(v)}
                      size="small"
                      disabled={!isEditing}
                      error={isEditing && cpfError}
                      helperText={isEditing && cpfError ? t("validation.cpfInvalid") : undefined}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t("userProfile.fields.email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      size="small"
                      disabled={!isEditing}
                      error={isEditing && emailError}
                      helperText={isEditing && emailError ? t("validation.emailInvalid") : undefined}
                      inputProps={{ maxLength: 50 }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t("userProfile.fields.crea")}
                      placeholder="CREA-SC"
                      value={creaNumber}
                      onChange={(e) => setCreaNumber(e.target.value)}
                      size="small"
                      disabled={!isEditing}
                      inputProps={{ maxLength: 10 }}
                    />
                  </Grid>
                </Grid>
              </Card>

              {/* Actions */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
                {canChangePassword ? (
                  <Button variant="text" startIcon={<LockIcon />} onClick={() => setPasswordModalOpen(true)}>
                    {t("userProfile.actions.changePassword")}
                  </Button>
                ) : (
                  <span />
                )}

                {!isEditing ? (
                  <Button variant="contained" onClick={() => setIsEditing(true)}>
                    {t("userProfile.actions.editProfile")}
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={handleCancelEdit}>
                      {t("common.actions.cancel")}
                    </Button>

                    <Button
                      variant="contained"
                      onClick={handleSaveProfile}
                      disabled={
                        updateMutation.isPending ||
                        avatarMutation.isPending ||
                        removeAvatarMutation.isPending ||
                        !isProfileValid
                      }
                    >
                      {t("company.actions.saveChanges")}
                    </Button>
                  </Stack>
                )}
              </Stack>
            </>
          ))}

        {tab === "preferences" &&
          (preferencesLoading || loadingPreferenceOptions || !preferenceOptions ? (
            <Stack spacing={2}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} variant="rounded" height={80} />
              ))}
            </Stack>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t("preferences.description")}
              </Typography>

              <Stack spacing={2}>
                {sortedPreferenceEntries.map(([name, values]) => {
                  const currentValue = (preferences as Record<string, string>)[name] ?? "";
                  const icons = PREFERENCE_OPTION_ICONS[name] ?? {};

                  return (
                    <Card key={name} sx={preferenceCardSx}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        alignItems={{ sm: "center" }}
                        justifyContent="space-between"
                      >
                        {/* Descrição da preferência */}
                        <Box sx={{ minWidth: 0 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            {name === "THEME" && <LightModeIcon fontSize="small" color="action" />}
                            {name === "LANGUAGE" && <LanguageIcon fontSize="small" color="action" />}
                            {name === "SHOW_NOTIFICATIONS" && <NotificationsActiveIcon fontSize="small" color="action" />}
                            {name === "CHATBOT_ENABLED" && <ChatIcon fontSize="small" color="action" />}
                            <Typography variant="subtitle1" color="text.primary">
                              {t(`preferences.${toCamelCase(name)}`, { defaultValue: name })}
                            </Typography>
                          </Stack>

                          <Typography variant="body2" color="text.secondary">
                            {t(`preferences.${toCamelCase(name)}Description`, { defaultValue: "" })}
                          </Typography>
                        </Box>

                        {/* Select de opções */}
                        <FormControl size="small" sx={{ minWidth: 220, flexShrink: 0 }}>
                          <Select
                            value={currentValue}
                            onChange={(e) => setPreference(name, String(e.target.value))}
                            displayEmpty
                            renderValue={(selected) =>
                              selected ? (
                                <Stack direction="row" spacing={1} alignItems="center">
                                  {icons[selected] && (
                                    <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
                                      {icons[selected]}
                                    </Box>
                                  )}
                                  <span>{optionLabel(name, selected)}</span>
                                </Stack>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  {t("common.select", { defaultValue: "Selecionar" })}
                                </Typography>
                              )
                            }
                          >
                            {values.map((opt) => (
                              <MenuItem key={opt} value={opt} selected={opt === currentValue}>
                                {icons[opt] && (
                                  <ListItemIcon sx={{ minWidth: 32 }}>
                                    <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
                                      {icons[opt]}
                                    </Box>
                                  </ListItemIcon>
                                )}
                                <ListItemText primary={optionLabel(name, opt)} primaryTypographyProps={{ variant: "body2" }} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Stack>
                    </Card>
                  );
                })}
              </Stack>
            </>
          ))}
      </Paper>

      {/* Password Dialog */}
      <Dialog open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t("userProfile.password.title")}</DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t("userProfile.password.fields.current")}
              type={showPasswords ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              size="small"
              fullWidth
              required
              inputProps={{ maxLength: 100 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPasswords((p) => !p)}
                      edge="end"
                      aria-label={t("userProfile.password.actions.toggleVisibility")}
                    >
                      {showPasswords ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label={t("userProfile.password.fields.new")}
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              size="small"
              fullWidth
              required
              inputProps={{ maxLength: 100 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPasswords((p) => !p)}
                      edge="end"
                      aria-label={t("userProfile.password.actions.toggleVisibility")}
                    >
                      {showPasswords ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label={t("userProfile.password.fields.confirm")}
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              size="small"
              fullWidth
              required
              inputProps={{ maxLength: 100 }}
              error={passwordMismatch}
              helperText={passwordMismatch ? t("userProfile.password.errors.mismatch") : undefined}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPasswords((p) => !p)}
                      edge="end"
                      aria-label={t("userProfile.password.actions.toggleVisibility")}
                    >
                      {showPasswords ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPasswordModalOpen(false)} variant="outlined">
            {t("common.actions.cancel")}
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={passwordMutation.isPending || !isPasswordFormValid}
          >
            {t("common.actions.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
