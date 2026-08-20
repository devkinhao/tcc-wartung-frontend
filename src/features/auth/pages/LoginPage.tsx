import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { login as loginRequest } from "../api/auth.api";
import { useAuth } from "../useAuth";
import { useTranslation } from "react-i18next";
import { paths } from "@/routes/paths";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { typography } from "@/styles/typography";

// O backend (LoginRateLimitFilter) manda o tempo real de espera no header
// Retry-After a cada 429. Esse valor só entra em cena se, por algum motivo,
// o header não vier (proxy removendo, deploy de frontend mais novo que o
// backend etc.) — nesses casos assumimos o pior caso da janela (1 min / 5
// tentativas = renova 1 a cada 12s) com uma margem de segurança.
const FALLBACK_RATE_LIMIT_COOLDOWN_SECONDS = 15;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { token } = await loginRequest({ username, password });
      await login(token);
      navigate(paths.dashboard);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 429) {
        const retryAfter = Number(err.response.headers?.["retry-after"]);
        const cooldownSeconds = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter
          : FALLBACK_RATE_LIMIT_COOLDOWN_SECONDS;

        setError(t("login.errors.tooManyAttempts"));
        setCooldown(cooldownSeconds);
      } else {
        setError(t("login.errors.invalidCredentials"));
      }
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
            <Typography variant="h6" fontWeight={typography.weight.extrabold} color="primary">
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
              required
            />

            <TextField
              label={t("login.fields.password")}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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

            <Link component={RouterLink} to={paths.forgotPassword} variant="body2" sx={{ justifySelf: "end" }}>
              {t("login.actions.forgotPassword")}
            </Link>

            {error && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              disabled={loading || !username || !password || cooldown > 0}
              size="large"
              sx={{ py: 1.3 }}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={18} />
                  {t("login.actions.signingIn")}
                </Box>
              ) : cooldown > 0 ? (
                t("login.actions.waitSeconds", { seconds: cooldown })
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
          <Typography variant="h3" fontWeight={typography.weight.black} gutterBottom>
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