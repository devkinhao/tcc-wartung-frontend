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
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/layout/header/Breadcrumb";
import { breadcrumbMap } from "@/layout/header/breadcrumbMap";
import { paths } from "@/routes/paths";

export default function HelpPage() {
  const { t } = useTranslation();

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
      <Box sx={{ mb: 3 }}>
        <Breadcrumb items={breadcrumbMap[paths.help]} size="large" />
        <Typography variant="body2" color="text.secondary">
          {t("help.description")}
        </Typography>
      </Box>

      <Stack spacing={2}>
        <Card
          sx={{
            borderRadius: 2,
            transition: (t) =>
              t.transitions.create("box-shadow", { duration: t.transitions.duration.short }),
            "&:hover": { boxShadow: 4 },
          }}
        >
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="text.primary" gutterBottom>
              {t("help.faq.title")}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.25}>
              <Box>
                <Typography fontWeight={600} variant="body2" color="text.primary">
                  {t("help.faq.q1.question")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("help.faq.q1.answer")}
                </Typography>
              </Box>

              <Box>
                <Typography fontWeight={600} variant="body2" color="text.primary">
                  {t("help.faq.q2.question")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("help.faq.q2.answer")}
                </Typography>
              </Box>

              <Box>
                <Typography fontWeight={600} variant="body2" color="text.primary">
                  {t("help.faq.q3.question")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("help.faq.q3.answer")}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 2,
            transition: (t) =>
              t.transitions.create("box-shadow", { duration: t.transitions.duration.short }),
            "&:hover": { boxShadow: 4 },
          }}
        >
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="text.primary" gutterBottom>
              {t("help.support.title")}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="body2" color="text.secondary">
              {t("help.support.description")}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t("help.support.emailLabel")}{" "}
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