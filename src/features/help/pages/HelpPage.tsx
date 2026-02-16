import {
  Box,
  Card,
  CardContent,
  Divider,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

export default function HelpPage() {
  return (
    <Paper
      elevation={1}
      sx={{
        maxWidth: 896,
        p: 3,
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
        Ajuda
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Encontre orientações rápidas sobre como usar o sistema.
      </Typography>

      <Stack spacing={2}>
        <Card
          sx={{
            borderRadius: 2,
            transition: (t) => t.transitions.create("box-shadow", { duration: t.transitions.duration.short }),
            "&:hover": { boxShadow: 4 },
          }}
        >
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="text.primary" gutterBottom>
              Perguntas frequentes
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.25}>
              <Box>
                <Typography fontWeight={600} variant="body2" color="text.primary">
                  Como cadastrar um cliente?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Acesse <b>Clientes</b> e clique em <b>Novo</b>. Preencha os dados e confirme.
                </Typography>
              </Box>

              <Box>
                <Typography fontWeight={600} variant="body2" color="text.primary">
                  Como alterar minhas preferências?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vá em <b>Preferências</b> e selecione o idioma/tema desejados.
                </Typography>
              </Box>

              <Box>
                <Typography fontWeight={600} variant="body2" color="text.primary">
                  Como gerar relatórios?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Em <b>Relatórios</b>, escolha um tipo e clique em <b>Gerar relatório</b>.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 2,
            transition: (t) => t.transitions.create("box-shadow", { duration: t.transitions.duration.short }),
            "&:hover": { boxShadow: 4 },
          }}
        >
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="text.primary" gutterBottom>
              Suporte
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="body2" color="text.secondary">
              Se precisar de ajuda, entre em contato com o suporte.
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              E-mail:{" "}
              <Link href="mailto:suporte@empresa.com" underline="hover">
                suporte@empresa.com
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Paper>
  );
}