import { useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { resetPassword } from "../api/auth.api";
import { useTranslation } from "react-i18next";
import { paths } from "@/routes/paths";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  Link,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { typography } from "@/styles/typography";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
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

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      <Grid
        item
        xs={12}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          p: 3,
        }}
      >
        <Paper elevation={6} sx={{ width: 360, p: 4, borderRadius: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box component="img" src="/logo.png" alt={t("common.logoAlt")} sx={{ height: 40 }} />
            <Typography variant="h6" fontWeight={typography.weight.extrabold} color="primary">
              {t("app.brandName")}
            </Typography>
          </Box>

          <Typography variant="h6" fontWeight={typography.weight.bold} gutterBottom>
            {t("resetPassword.title")}
          </Typography>

          {submitted ? (
            <>
              <Typography variant="body2" sx={{ mb: 3 }}>
                {t("resetPassword.success")}
              </Typography>
              <Button onClick={() => navigate(paths.login)} size="large" fullWidth sx={{ py: 1.3 }}>
                {t("resetPassword.actions.backToLogin")}
              </Button>
            </>
          ) : !token ? (
            <>
              <Typography variant="body2" color="error" sx={{ mb: 3 }}>
                {t("resetPassword.errors.missingToken")}
              </Typography>
              <Link component={RouterLink} to={paths.forgotPassword} variant="body2">
                {t("forgotPassword.title")}
              </Link>
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t("resetPassword.subtitle")}
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
                <TextField
                  label={t("resetPassword.fields.newPassword")}
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  autoFocus
                  fullWidth
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((p) => !p)}
                          edge="end"
                          aria-label={t("userProfile.password.actions.toggleVisibility")}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label={t("resetPassword.fields.confirmPassword")}
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  fullWidth
                  required
                  error={passwordMismatch}
                  helperText={passwordMismatch ? t("userProfile.password.errors.mismatch") : undefined}
                />

                {error && (
                  <Typography variant="body2" color="error">
                    {error}
                  </Typography>
                )}

                <Button
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword || passwordMismatch}
                  size="large"
                  sx={{ py: 1.3 }}
                >
                  {loading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={18} />
                      {t("resetPassword.actions.submitting")}
                    </Box>
                  ) : (
                    t("resetPassword.actions.submit")
                  )}
                </Button>

                <Link component={RouterLink} to={paths.login} variant="body2" sx={{ justifySelf: "center" }}>
                  {t("resetPassword.actions.backToLogin")}
                </Link>
              </Box>
            </>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
