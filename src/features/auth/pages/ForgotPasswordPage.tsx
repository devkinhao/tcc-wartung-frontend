import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { forgotPassword } from "../api/auth.api";
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
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import { FormField } from "@/components/form/FormField";
import { typography } from "@/styles/typography";
import { forgotPasswordSchema } from "../schemas";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = forgotPasswordSchema.safeParse({ email }).success;
  const emailInvalid = email !== "" && !emailValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!emailValid) {
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
                {t("forgotPassword.title")}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {t("forgotPassword.success")}
              </Typography>
              <Link component={RouterLink} to={paths.login} variant="body2">
                {t("forgotPassword.actions.backToLogin")}
              </Link>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={3}>
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="h6" color="primary">
                  {t("forgotPassword.title")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("forgotPassword.subtitle")}
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
                  label={t("forgotPassword.fields.email")}
                  placeholder={t("forgotPassword.fields.placeholder.email")}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  error={emailInvalid}
                  helperText={emailInvalid ? t("forgotPassword.errors.invalidEmail") : undefined}
                  startIcon={
                    <MailOutlineOutlinedIcon
                      fontSize="small"
                      sx={{ p: 0.2, mr: 0.5, color: "action.disabled" }}
                    />
                  }
                />

                {error && <Alert severity="error">{error}</Alert>}

                <Button
                  variant="contained"
                  type="submit"
                  endIcon={!loading && <ArrowForwardOutlinedIcon />}
                  disabled={loading || !email}
                  sx={{ mt: 1 }}
                >
                  {loading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="subtitle1">
                        {t("forgotPassword.actions.sending")}
                      </Typography>
                      <CircularProgress size={20} />
                    </Box>
                  ) : (
                    <Typography variant="subtitle1">
                      {t("forgotPassword.actions.send")}
                    </Typography>
                  )}
                </Button>

                <Link
                  component={RouterLink}
                  to={paths.login}
                  variant="body2"
                  sx={{ alignSelf: "center" }}
                >
                  {t("forgotPassword.actions.backToLogin")}
                </Link>
              </Box>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
