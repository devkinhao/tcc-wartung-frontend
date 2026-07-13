import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginRequest } from "../api/auth.api";
import { useAuth } from "../useAuth";
import { useTranslation } from "react-i18next";
import { paths } from "@/routes/paths";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { token } = await loginRequest({ username, password });
      await login(token);
      navigate(paths.dashboard);
    } catch {
      setError(t("login.errors.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      {/* Left: form */}
      <Grid
        item
        xs={12}
        md={6}
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
            <Typography variant="h6" fontWeight={800} color="primary">
              {t("app.brandName")}
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
            <TextField
              label={t("login.fields.username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              fullWidth
            />

            <TextField
              label={t("login.fields.password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              fullWidth
            />

            {error && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              disabled={loading || !username || !password}
              size="large"
              sx={{ py: 1.3 }}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={18} />
                  {t("login.actions.signingIn")}
                </Box>
              ) : (
                t("login.actions.signIn")
              )}
            </Button>
          </Box>
        </Paper>
      </Grid>

      {/* Right: welcome */}
      <Grid
        item
        md={6}
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          p: 6,
          background: (theme) =>
            `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }}
      >
        <Box sx={{ textAlign: "center", maxWidth: 420 }}>
          <Typography variant="h3" fontWeight={900} gutterBottom>
            {t("login.welcome.title")}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.95 }}>
            {t("login.welcome.subtitle")}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}