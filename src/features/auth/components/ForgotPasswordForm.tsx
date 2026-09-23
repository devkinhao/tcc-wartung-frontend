import { Button } from "@/components/Button";
import { FormField } from "@/components/form/FormField";
import { Modal } from "@/components/Modal";
import {
  ArrowBackOutlined,
  ArrowForwardOutlined,
  MailOutlineOutlined,
} from "@mui/icons-material";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { forgotPassword } from "../api/auth.api";
import { forgotPasswordSchema } from "../schemas";

type ForgotPasswordFormProps = {
  /** Retorna para a tela de login sem depender de navegação de rota. */
  onBack: () => void;
};

/** Formulário de recuperação de senha, reutilizado na página dedicada e embutido no login. */
export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  /** Hooks. */
  const { t } = useTranslation();

  /** Estados. */
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Indica se o e-mail preenchido tem um formato válido. */
  const emailValid = forgotPasswordSchema.safeParse({ email }).success;

  /** Valida o e-mail e solicita o envio do link de redefinição de senha. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError(t("forgotPassword.errors.requiredEmail"));
      return;
    }

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
    <>
      {/** Retorna para o login sem enviar o formulário. */}
      <Button
        tooltip={t("forgotPassword.actions.tooltip.backToLogin")}
        variant="text"
        onClick={onBack}
        startIcon={<ArrowBackOutlined fontSize="small" />}
        sx={{ alignSelf: "flex-start" }}
      >
        {t("forgotPassword.actions.backToLogin")}
      </Button>
      {/** Cabeçalho da tela com título e instrução de recuperação. */}
      <Box display="flex" flexDirection="column" gap={1.5}>
        <Typography variant="h2" sx={{ color: "primary.main" }}>
          {t("forgotPassword.title")}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
        {/** Campo de e-mail para envio do link de redefinição de senha. */}
        <FormField
          autoFocus
          required
          disabled={loading}
          autoComplete="email"
          label={t("forgotPassword.fields.email")}
          placeholder={t("forgotPassword.fields.placeholder.email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          startIcon={MailOutlineOutlined}
        />
        {/** Exibe a mensagem de erro de validação ou de falha no envio. */}
        {error && <Alert severity="error">{error}</Alert>}
        {/** Botão principal para solicitar o envio do link de redefinição. */}
        <Button
          tooltip={t("forgotPassword.actions.tooltip.send")}
          type="submit"
          endIcon={!loading && <ArrowForwardOutlined />}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {t("forgotPassword.actions.sending")}
              <CircularProgress size={18} />
            </Box>
          ) : (
            t("forgotPassword.actions.send")
          )}
        </Button>
      </Box>
      {/** Confirmação exibida em modal após o envio bem-sucedido do link de redefinição. */}
      <Modal
        open={submitted}
        title={t("forgotPassword.sent")}
        actions={
          <Button
            tooltip={t("forgotPassword.actions.tooltip.backToLogin")}
            onClick={onBack}
            startIcon={<ArrowBackOutlined fontSize="small" />}
          >
            {t("forgotPassword.actions.backToLogin")}
          </Button>
        }
      >
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {t("forgotPassword.success")}
        </Typography>
      </Modal>
    </>
  );
}
