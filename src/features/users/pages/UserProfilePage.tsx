import React, { useRef, useState } from "react";
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
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { canAccess } from "@/features/auth/permissions";
import { User } from "../types/User";
import { changePassword, getAvatar, getMe, updateMe, uploadAvatar } from "../api/user.api";
import { useNotify } from "@/hooks/useNotify";
import { useTranslation } from "react-i18next";
import { qk } from "@/api/keys";
import { MaskedTextField } from "@/components/MaskedTextField";
import { Breadcrumb } from "@/layout/header/Breadcrumb";
import { breadcrumbMap } from "@/layout/header/breadcrumbMap";
import { paths } from "@/routes/paths";
import { typography } from "@/styles/typography";

// Espelha as constraints do UserUpdateRequestDTO do backend (@Pattern cpf,
// @Email) — feedback instantâneo, sem round-trip.
const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UserProfile() {
  const { t } = useTranslation();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const [showPasswords, setShowPasswords] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const { data: user, isLoading } = useQuery<User>({
    queryKey: qk.me(),
    queryFn: getMe,
  });

  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [creaNumber, setCreaNumber] = useState("");

  React.useEffect(() => {
    if (!user) return;

    setFullName(user.fullName);
    setCpf(user.cpf);
    setEmail(user.email);
    setCreaNumber(user.creaNumber ?? "");

    if (user.id) {
      getAvatar(user.id)
        .then(setAvatarPreview)
        .catch(() => {});
    }
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

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleSaveProfile() {
    updateMutation.mutate({
      fullName: fullName.trim(),
      ...(cpf.trim() ? { cpf: cpf.trim() } : {}),
      ...(email.trim() ? { email: email.trim() } : {}),
      ...(creaNumber.trim() ? { creaNumber: creaNumber.trim() } : {}),
    });
    if (avatarFile) avatarMutation.mutate(avatarFile);
  }

  function handleCancelEdit() {
    if (!user) return;
    setFullName(user.fullName);
    setCpf(user.cpf);
    setEmail(user.email);
    setCreaNumber(user.creaNumber ?? "");
    setAvatarFile(null);
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

  if (isLoading) {
    return (
      <Stack direction="row" spacing={2} alignItems="center">
        <CircularProgress size={18} />
        <Typography variant="body2" color="text.secondary">
          {t("userProfile.loading")}
        </Typography>
      </Stack>
    );
  }

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

        {/* Avatar + Status */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ sm: "center" }} sx={{ mb: 3 }}>
          <Box sx={{ position: "relative", width: 112 }}>
            <Avatar
              sx={{ width: 112, height: 112, fontSize: typography.size.avatarInitials, bgcolor: "background.default" }}
              src={avatarPreview ?? undefined}
              alt={t("common.avatarAlt")}
            >
              {fullName?.charAt(0)}
            </Avatar>

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
            transition: (t) => t.transitions.create("box-shadow", { duration: t.transitions.duration.short }),
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
                disabled={updateMutation.isPending || avatarMutation.isPending || !isProfileValid}
              >
                {t("company.actions.saveChanges")}
              </Button>
            </Stack>
          )}
        </Stack>
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