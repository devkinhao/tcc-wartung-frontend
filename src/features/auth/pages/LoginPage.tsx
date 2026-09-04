/** Componentes. */
import { FormField } from "@/components/form/FormField";
import { PasswordVisibilityToggle } from "@/components/PasswordVisibilityToggle";
import { Tooltip } from "@/components/Tooltip";
/** Rotas. */
import { paths } from "@/routes/paths";
/** Estilização. */
import { typography } from "@/styles/typography";
/** MUI Ícones. */
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
/** MUI Material. */
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  Link,
  Typography,
} from "@mui/material";
/** Axios. */
import { isAxiosError } from "axios";
/** React. */
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useNavigate } from "react-router-dom";
/** Domínio. */
import { login as loginRequest } from "../api/auth.api";
import { useAuth } from "../useAuth";

/** Valor padrão para o tempo de espera. */
const FALLBACK_RATE_LIMIT_COOLDOWN_SECONDS = 15;

export default function LoginPage() {
  /** Hooks. */
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  /** Estados. */
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  /** Atualiza o tempo de espera. */
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  /** Manipula o envio do formulário. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError(t("login.errors.mandatoryCredentials"));
      return;
    }

    setLoading(true);

    try {
      const { token } = await loginRequest({ username, password });
      await login(token);
      navigate(paths.home);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 429) {
        const retryAfter = Number(err.response.headers?.["retry-after"]);
        const cooldownSeconds =
          Number.isFinite(retryAfter) && retryAfter > 0
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
    <Grid container sx={{ height: "100vh", width: "100vw" }}>
      {/** Container do formulário. */}
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
        }}
      >
        {/** Logo do sistema. */}
        <Box
          sx={{
            position: "absolute",
            top: 30,
            left: 20,
            display: "flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt={t("common.alt.logo")}
            sx={{
              height: 45,
              borderRadius: 1,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color: "primary.main",
              fontWeight: typography.weight.bold,
            }}
          >
            {t("app.brandName")}
          </Typography>
        </Box>
        {/** Formulário de login. */}
        <Box display="flex" flexDirection="column" gap={5} width={415}>
          {/** Título e subtítulo. */}
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6" color="primary">
              {t("login.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("login.subtitle")}
            </Typography>
          </Box>
          {/** Campos do formulário. */}
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            display="flex"
            flexDirection="column"
            gap={2}
          >
            {/** Nome de usuário. */}
            <FormField
              required
              autoComplete="username"
              label={t("login.fields.username")}
              placeholder={t("login.fields.placeholder.username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              startIcon={
                <PersonOutlineOutlinedIcon
                  fontSize="small"
                  sx={{ p: 0.2, mr: 0.5, color: "action.disabled" }}
                />
              }
            />
            {/** Senha. */}
            <FormField
              required
              label={t("login.fields.password")}
              placeholder={t("login.fields.placeholder.password")}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              startIcon={
                <LockOutlinedIcon
                  fontSize="small"
                  sx={{ p: 0.2, mr: 0.5, color: "action.disabled" }}
                />
              }
              endIcon={
                <PasswordVisibilityToggle
                  visible={showPassword}
                  onToggle={() => setShowPassword((p) => !p)}
                />
              }
            />
            {/** Ações do formulário. */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              ml={0.6}
              mb={1}
            >
              {/** Lembrar o usuário. */}
              <Tooltip title={t("login.actions.tooltip.rememberMe")}>
                <FormControlLabel
                  control={<Checkbox size="small" sx={{ p: 0.6 }} />}
                  label={
                    <Typography variant="body2">
                      {t("login.actions.rememberMe")}
                    </Typography>
                  }
                />
              </Tooltip>
              {/** Esquecimento de senha. */}
              <Tooltip title={t("login.actions.tooltip.forgotPassword")}>
                <Link
                  component={RouterLink}
                  to={paths.forgotPassword}
                  variant="body2"
                >
                  {t("login.actions.forgotPassword")}
                </Link>
              </Tooltip>
            </Box>
            {/** Mensagem de erro. */}
            {error && <Alert severity="error">{error}</Alert>}
            {/** Botão de envio. */}
            <Tooltip title={t("login.actions.tooltip.signIn")}>
              <Button
                variant="contained"
                type="submit"
                endIcon={!loading && <ArrowForwardOutlinedIcon />}
                disabled={loading || cooldown > 0}
                sx={{ mt: 1 }}
              >
                {loading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="subtitle1">
                      {t("login.actions.signingIn")}
                    </Typography>
                    <CircularProgress size={20} />
                  </Box>
                ) : cooldown > 0 ? (
                  <Typography variant="subtitle1">
                    {t("login.actions.waitSeconds", { seconds: cooldown })}
                  </Typography>
                ) : (
                  <Typography variant="subtitle1">
                    {t("login.actions.signIn")}
                  </Typography>
                )}
              </Button>
            </Tooltip>
          </Box>
          {/** Rodapé. */}
          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
          >
            &copy; {new Date().getFullYear()} {t("app.brandName")}
          </Typography>
        </Box>
      </Grid>
      {/** Container de boas-vindas. */}
      <Grid
        size={{ md: 6 }}
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "flex-end",
          color: "text.contrast",
          p: 6,
          background: (theme) =>
            `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }}
      >
        <Box sx={{ textAlign: "right" }}>
          <Typography
            variant="h5"
            fontWeight={typography.weight.bold}
            gutterBottom
          >
            {t("login.welcome.title")}
          </Typography>
          <Typography
            variant="body1"
            fontWeight={typography.weight.regular}
            color="text.contrast"
          >
            {t("login.welcome.subtitle")}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}
