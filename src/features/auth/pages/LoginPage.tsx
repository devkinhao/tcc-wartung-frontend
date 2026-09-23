import { Button } from "@/components/Button";
import { FormField } from "@/components/form/FormField";
import { PasswordVisibilityToggle } from "@/components/PasswordVisibilityToggle";
import { SystemLogo } from "@/components/SystemLogo";
import { Tooltip } from "@/components/Tooltip";
import { paths } from "@/routes/paths";
import {
  ArrowForwardOutlined,
  LockOutlined,
  PersonOutlineOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  Link,
  Typography,
} from "@mui/material";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { login as loginRequest } from "../api/auth.api";
import { ForgotPasswordForm } from "../components/ForgotPasswordForm";
import { useAuth } from "../useAuth";

/** Valor padrão para o tempo de espera. */
const FALLBACK_RATE_LIMIT_COOLDOWN_SECONDS = 15;

/** Nome de usuário lembrado no dispositivo. */
const REMEMBERED_USERNAME_KEY = "login:username";

/** Recupera o nome de usuário salvo no armazenamento local. */
function readRememberedUsername(): string | null {
  try {
    return localStorage.getItem(REMEMBERED_USERNAME_KEY);
  } catch {
    return null;
  }
}

/** Salva/remove o nome de usuário lembrado. */
function persistRememberedUsername(username: string | null) {
  try {
    if (username) localStorage.setItem(REMEMBERED_USERNAME_KEY, username);
    else localStorage.removeItem(REMEMBERED_USERNAME_KEY);
  } catch {
    /** Ignora quando o localStorage está indisponível, como em aba anônima etc. */
  }
}

export default function LoginPage() {
  /** Hooks. */
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  /** Estados. */
  const [username, setUsername] = useState(
    () => readRememberedUsername() ?? "",
  );
  const [rememberMe, setRememberMe] = useState(
    () => readRememberedUsername() !== null,
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  /** Alterna entre o formulário de login e o de recuperação de senha, sem navegar de rota. */
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  /** Reduz o cooldown do login enquanto a conta está temporariamente bloqueada por excesso de tentativas. */
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  /** Valida as credenciais, envia o login e define o estado de erro ou cooldown conforme a resposta da API. */
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
      persistRememberedUsername(rememberMe ? username.trim() : null);
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
    <Grid
      container
      sx={{
        height: "100dvh",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      {/** Bloco principal do formulário de autenticação. */}
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
          overflowY: "auto",
        }}
      >
        {/** Logo do sistema exibida no topo do painel de login. */}
        <SystemLogo />
        {/** Área central do formulário. */}
        <Box
          display="flex"
          flexDirection="column"
          gap={5}
          sx={{
            maxWidth: 365,
            alignSelf: "center",
            my: "auto",
            mx: 3,
            py: 3,
          }}
        >
          {showForgotPassword ? (
            /** Substitui o login pela recuperação de senha no lugar, sem navegar de rota. */
            <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
          ) : (
            <>
              {/** Cabeçalho da tela com a mensagem inicial do sistema. */}
              <Box display="flex" flexDirection="column" gap={1.5}>
                <Typography variant="h2" sx={{ color: "primary.main" }}>
                  {t("login.title")}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {t("login.subtitle")}
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
                {/** Campo de usuário, com memória do último login salvo localmente. */}
                <FormField
                  autoFocus
                  required
                  autoComplete="username"
                  label={t("login.fields.username")}
                  placeholder={t("login.fields.placeholder.username")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  startIcon={PersonOutlineOutlined}
                />
                {/** Campo de senha com alternância de visibilidade. */}
                <FormField
                  required
                  autoComplete="current-password"
                  label={t("login.fields.password")}
                  placeholder={t("login.fields.placeholder.password")}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  startIcon={LockOutlined}
                  endIcon={
                    <PasswordVisibilityToggle
                      visible={showPassword}
                      onToggle={() => setShowPassword((p) => !p)}
                    />
                  }
                />
                {/** Opções de acesso e links auxiliares do formulário. */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  ml={0.6}
                  mb={1}
                >
                  {/** Permite recordar o nome de usuário no navegador. */}
                  <Tooltip title={t("login.actions.tooltip.rememberMe")}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          sx={{ p: 0.6 }}
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                      }
                      label={
                        <Typography variant="body2">
                          {t("login.actions.rememberMe")}
                        </Typography>
                      }
                    />
                  </Tooltip>
                  {/** Substitui o login pela recuperação de senha, sem navegar de rota. */}
                  <Tooltip title={t("login.actions.tooltip.forgotPassword")}>
                    <Link
                      variant="body2"
                      component="button"
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      {t("login.actions.forgotPassword")}
                    </Link>
                  </Tooltip>
                </Box>
                {/** Exibe a mensagem de erro da autenticação ou do rate limit. */}
                {error && <Alert severity="error">{error}</Alert>}
                {/** Botão principal para autenticar o usuário. */}
                <Button
                  tooltip={t("login.actions.tooltip.signIn")}
                  type="submit"
                  endIcon={!loading && <ArrowForwardOutlined />}
                  disabled={loading || cooldown > 0}
                  sx={{ mt: 1 }}
                >
                  {loading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {t("login.actions.signingIn")}
                      <CircularProgress size={18} />
                    </Box>
                  ) : cooldown > 0 ? (
                    t("login.actions.waitSeconds", { seconds: cooldown })
                  ) : (
                    t("login.actions.signIn")
                  )}
                </Button>
              </Box>
            </>
          )}
          {/** Rodapé da tela com a marca e ano atual. */}
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", textAlign: "center", mt: -1.5 }}
          >
            &copy; {new Date().getFullYear()} {t("app.brandName")}
          </Typography>
        </Box>
      </Grid>
      {/** Painel visual de boas-vindas. */}
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
          <Typography variant="h2" gutterBottom>
            {t("login.welcome.title")}
          </Typography>
          <Typography variant="body1" color="text.contrast">
            {t("login.welcome.subtitle")}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}
