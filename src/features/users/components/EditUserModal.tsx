import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useTranslation } from "react-i18next";

import { usersApi, type UserResponseDTO, type UserUpdateRequestDTO } from "../api/users.api";
import { permissionsApi, type PermissionResponseDTO } from "../api/permissions.api";
import { useNotify } from "@/hooks/useNotify";
import { MaskedTextField } from "@/components/MaskedTextField";

type Props = {
  open: boolean;
  userId: number | null;
  onClose: () => void;
  onChanged?: () => void;
};

// Espelha as constraints do UserUpdateRequestDTO do backend (@Pattern cpf,
// @Email) — feedback instantâneo, sem round-trip.
const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function TabPanel(props: { value: number; index: number; children: React.ReactNode }) {
  const { value, index, children } = props;
  if (value !== index) return null;
  return <Box sx={{ pt: 2 }}>{children}</Box>;
}

export function EditUserModal({ open, userId, onClose, onChanged }: Props) {
  const { t } = useTranslation();
  const notify = useNotify();

  const [tab, setTab] = useState(0);

  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPerms, setSavingPerms] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);


  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [allPermissions, setAllPermissions] = useState<PermissionResponseDTO[]>([]);

  // profile
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [creaNumber, setCreaNumber] = useState("");

  // permissions (store name, show description)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // reset password
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const load = useCallback(async () => {
    if (!open || userId == null) return;

    setTab(0);
    setLoading(true);

    try {
      const [u, perms] = await Promise.all([usersApi.findById(userId), permissionsApi.findAll()]);

      setUser(u);
      setAllPermissions(perms);

      setFullName(u.fullName ?? "");
      setCpf(u.cpf ?? "");
      setEmail(u.email ?? "");
      setCreaNumber(u.creaNumber ?? "");
      setSelectedPermissions(Array.isArray(u.permissions) ? u.permissions : []);

      setNewPassword("");
      setShowNewPassword(false);
    } catch (e) {
      notify.fromError(e);
      setUser(null);
      setAllPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [open, userId, notify]);

  useEffect(() => {
    void load();
  }, [load]);

  function togglePermission(name: string, checked: boolean) {
    setSelectedPermissions((prev) => {
      if (checked) return prev.includes(name) ? prev : [...prev, name];
      return prev.filter((p) => p !== name);
    });
  }

  async function saveProfile() {
    if (userId == null) return;

    setSavingProfile(true);
    try {
      const dto: UserUpdateRequestDTO = {
        fullName: fullName.trim(),
        ...(cpf.trim() ? { cpf: cpf.trim() } : {}),
        ...(email.trim() ? { email: email.trim() } : {}),
        ...(creaNumber.trim() ? { creaNumber: creaNumber.trim() } : {}),
      };

      const updated = await usersApi.update(userId, dto);
      setUser(updated);

      setFullName(updated.fullName ?? "");
      setCpf(updated.cpf ?? "");
      setEmail(updated.email ?? "");
      setCreaNumber(updated.creaNumber ?? "");

      onChanged?.();
      notify.success("notify.success.saved");
      onClose();
    } catch (e) {
      notify.fromError(e);
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePermissions() {
    if (userId == null) return;

    setSavingPerms(true);
    try {
      await usersApi.updatePermissions(userId, { permissions: selectedPermissions });

      // refresh user to reflect backend truth
      const refreshed = await usersApi.findById(userId);
      setUser(refreshed);
      setSelectedPermissions(refreshed.permissions ?? []);

      onChanged?.();
      notify.success("notify.success.saved");
      onClose();
    } catch (e) {
      notify.fromError(e);
    } finally {
      setSavingPerms(false);
    }
  }

  async function resetPassword() {
    if (userId == null) return;

    setSavingPwd(true);
    try {
      await usersApi.resetPassword(userId, { newPassword: newPassword.trim() });
      setNewPassword("");
      setShowNewPassword(false);
      notify.success("notify.success.passwordChanged");
    } catch (e) {
      notify.fromError(e);
    } finally {
      setSavingPwd(false);
    }
  }

  const title = user ? `${user.fullName} (@${user.username})` : (t("users.edit.title") || "Edit user");

  const cpfTrimmed = cpf.trim();
  const emailTrimmed = email.trim();
  const cpfError = cpfTrimmed !== "" && !CPF_REGEX.test(cpfTrimmed);
  const emailError = emailTrimmed !== "" && !EMAIL_REGEX.test(emailTrimmed);

  const saveDisabled =
    loading ||
    (tab === 0 && (!fullName.trim() || cpfError || emailError || savingProfile)) ||
    (tab === 1 && savingPerms) ||
    tab === 2; // no "Save" on security tab

  const resetDisabled = loading || tab !== 2 || !newPassword.trim() || savingPwd;

  async function handlePrimaryAction() {
    if (tab === 0) await saveProfile();
    if (tab === 1) await savePermissions();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        {title}
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 1 }}>

        {loading ? (
          <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : !user ? (
          <Typography variant="body2" color="warning.main" sx={{ py: 2 }}>
            {t("users.edit.notFound") || "User not found."}
          </Typography>
        ) : (
          <>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tab label={t("users.edit.tabs.profile") || "Perfil"} />
              <Tab label={t("users.edit.tabs.permissions") || "Permissões"} />
              <Tab label={t("users.edit.tabs.security") || "Segurança"} />
            </Tabs>

            {/* Perfil */}
            <TabPanel value={tab} index={0}>
              <Stack spacing={2}>
                <TextField
                  size="small"
                  label={t("users.fields.fullName") || "Nome completo"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={savingProfile}
                  required
                  inputProps={{ maxLength: 50 }}
                />
                <MaskedTextField
                  mask="cpf"
                  size="small"
                  label={t("users.fields.cpf") || "CPF"}
                  value={cpf}
                  onChange={(v) => setCpf(v)}
                  disabled={savingProfile}
                  error={cpfError}
                  helperText={cpfError ? t("validation.cpfInvalid") : undefined}
                />
                <TextField
                  size="small"
                  label={t("users.fields.email") || "Email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={savingProfile}
                  error={emailError}
                  helperText={emailError ? t("validation.emailInvalid") : undefined}
                  inputProps={{ maxLength: 50 }}
                />
                <TextField
                  size="small"
                  label={t("users.fields.creaNumber") || "CREA"}
                  placeholder="CREA-SC"
                  value={creaNumber}
                  onChange={(e) => setCreaNumber(e.target.value)}
                  disabled={savingProfile}
                  inputProps={{ maxLength: 10 }}
                />
              </Stack>
            </TabPanel>

            {/* Permissões */}
            <TabPanel value={tab} index={1}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {t("users.edit.permissionsHint") || "Marque/desmarque as permissões (exibir apenas a descrição)."}
              </Typography>

              <FormGroup>
                {allPermissions.map((perm) => {
                  const checked = selectedPermissions.includes(perm.name);
                  const label = perm.description || perm.name; // show ONLY description to the admin UI
                  return (
                    <FormControlLabel
                      key={perm.id}
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={(e) => togglePermission(perm.name, e.target.checked)}
                          disabled={savingPerms}
                        />
                      }
                      label={label}
                    />
                  );
                })}
              </FormGroup>
            </TabPanel>

            {/* Segurança (Password only) */}
            <TabPanel value={tab} index={2}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {t("users.edit.resetPasswordHint") || "Defina uma nova senha para o usuário e clique em Resetar senha."}
              </Typography>

              <TextField
                size="small"
                label={t("users.edit.newPassword") || "Nova senha"}
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={savingPwd}
                fullWidth
                required
                inputProps={{ maxLength: 100 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword((p) => !p)}
                        edge="end"
                        aria-label={t("userProfile.password.actions.toggleVisibility")}
                      >
                        {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </TabPanel>
          </>
        )}
      </DialogContent>

      {/* Footer: Reset (left) + Save (right). No Cancel button. */}
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        {tab === 2 ? (
          <Button
            variant="outlined"
            color="warning"
            onClick={resetPassword}
            disabled={resetDisabled}
          >
            {t("users.edit.resetPassword") || "Resetar senha"}
          </Button>
        ) : (
          <Box />
        )}

        {tab !== 2 ? (
          <Button variant="contained" onClick={handlePrimaryAction} disabled={saveDisabled}>
            {t("common.actions.save")}
          </Button>
        ) : (
          <Box /> // keeps layout stable when Save hidden
        )}
      </DialogActions>
    </Dialog>
  );
}