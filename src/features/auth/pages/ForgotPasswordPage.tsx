import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { forgotPassword } from "../api/auth.api";
import { useTranslation } from "react-i18next";
import { paths } from "@/routes/paths";
import { Box, Button, CircularProgress, Grid, Paper, TextField, Typography, Link } from "@mui/material";
import { typography } from "@/styles/typography";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailInvalid = email !== "" && !EMAIL_PATTERN.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!EMAIL_PATTERN.test(email)) {
      setError(t("forgotPassword.errors.invalidEmail"));
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({ email });
      setSubmitted(true);
    } catch {
      setError(t("forgotPassword.errors.generic"));
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
            {t("forgotPassword.title")}
          </Typography>

          {submitted ? (
            <>
              <Typography variant="body2" sx={{ mb: 3 }}>
                {t("forgotPassword.success")}
              </Typography>
              <Link component={RouterLink} to={paths.login} variant="body2">
                {t("forgotPassword.actions.backToLogin")}
              </Link>
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t("forgotPassword.subtitle")}
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
                <TextField
                  label={t("forgotPassword.fields.email")}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  fullWidth
                  error={emailInvalid}
                  helperText={emailInvalid ? t("forgotPassword.errors.invalidEmail") : undefined}
                />

                {error && (
                  <Typography variant="body2" color="error">
                    {error}
                  </Typography>
                )}

                <Button type="submit" disabled={loading || !email} size="large" sx={{ py: 1.3 }}>
                  {loading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={18} />
                      {t("forgotPassword.actions.sending")}
                    </Box>
                  ) : (
                    t("forgotPassword.actions.send")
                  )}
                </Button>

                <Link component={RouterLink} to={paths.login} variant="body2" sx={{ justifySelf: "center" }}>
                  {t("forgotPassword.actions.backToLogin")}
                </Link>
              </Box>
            </>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
