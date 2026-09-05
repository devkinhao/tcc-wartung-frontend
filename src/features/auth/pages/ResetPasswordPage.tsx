import { useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { resetPassword } from "../api/auth.api";
import { useTranslation } from "react-i18next";
import { paths } from "@/routes/paths";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  Link,
} from "@mui/material";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { FormField } from "@/components/form/FormField";
import { typography } from "@/styles/typography";
import { PasswordVisibilityToggle } from "@/components/PasswordVisibilityToggle";
import { resetPasswordSchema } from "../schemas";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordMismatch = confirmPassword !== "" && newPassword !== confirmPassword;
  const formValid = resetPasswordSchema.safeParse({ newPassword, confirmPassword }).success;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formValid) {
      setError(t("userProfile.password.errors.mismatch"));
      return;
    }

    if (!token) {
      setError(t("resetPassword.errors.missingToken"));
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, newPassword });
      setSubmitted(true);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        setError(t("resetPassword.errors.invalidToken"));
      } else {
        setError(t("resetPassword.errors.generic"));
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordIcon = (
    <LockOutlinedIcon fontSize="small" sx={{ p: 0.2, mr: 0.5, color: "action.disabled" }} />
  );

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      <Grid
        size={{ xs: 12 }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          p: 3,
        }}
      >
        <Paper elevation={6} sx={{ width: 360, p: 4, borderRadius: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <Box component="img" src="/logo.png" alt={t("common.alt.logo")} sx={{ height: 45, borderRadius: 1 }} />
            <Typography variant="h6" fontWeight={typography.weight.bold} color="primary">
              {t("app.brandName")}
            </Typography>
          </Box>

          {submitted ? (
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6" color="primary">
                {t("resetPassword.title")}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {t("resetPassword.success")}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate(paths.login)}
                endIcon={<ArrowForwardOutlinedIcon />}
              >
                <Typography variant="subtitle1">
                  {t("resetPassword.actions.backToLogin")}
                </Typography>
              </Button>
            </Box>
          ) : !token ? (
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="h6" color="primary">
                {t("resetPassword.title")}
              </Typography>
              <Alert severity="error">{t("resetPassword.errors.missingToken")}</Alert>
              <Link component={RouterLink} to={paths.forgotPassword} variant="body2">
                {t("forgotPassword.title")}
              </Link>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={3}>
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="h6" color="primary">
                  {t("resetPassword.title")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("resetPassword.subtitle")}
                </Typography>
              </Box>

              <Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                display="flex"
                flexDirection="column"
                gap={2}
              >
                <FormField
                  required
                  label={t("resetPassword.fields.newPassword")}
                  placeholder={t("resetPassword.fields.placeholder.newPassword")}
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  autoFocus
                  startIcon={passwordIcon}
                  endIcon={
                    <PasswordVisibilityToggle
                      visible={showPassword}
                      onToggle={() => setShowPassword((p) => !p)}
                    />
                  }
                />

                <FormField
                  required
                  label={t("resetPassword.fields.confirmPassword")}
                  placeholder={t("resetPassword.fields.placeholder.confirmPassword")}
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  error={passwordMismatch}
                  helperText={passwordMismatch ? t("userProfile.password.errors.mismatch") : undefined}
                  startIcon={passwordIcon}
                />

                {error && <Alert severity="error">{error}</Alert>}

                <Button
                  variant="contained"
                  type="submit"
                  endIcon={!loading && <ArrowForwardOutlinedIcon />}
                  disabled={loading || !formValid}
                  sx={{ mt: 1 }}
                >
                  {loading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="subtitle1">
                        {t("resetPassword.actions.submitting")}
                      </Typography>
                      <CircularProgress size={20} />
                    </Box>
                  ) : (
                    <Typography variant="subtitle1">
                      {t("resetPassword.actions.submit")}
                    </Typography>
                  )}
                </Button>

                <Link
                  component={RouterLink}
                  to={paths.login}
                  variant="body2"
                  sx={{ alignSelf: "center" }}
                >
                  {t("resetPassword.actions.backToLogin")}
                </Link>
              </Box>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
