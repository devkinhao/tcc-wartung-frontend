import { usePreferences } from "@/features/preferences/PreferencesContext";
import { getPreferenceOptions } from "@/features/preferences/api/preferences.api";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Card,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export default function UserPreferences() {
  const { t } = useTranslation();
  const { preferences, setPreference, isLoading } = usePreferences();

  const labels: Record<string, { title: string; description: string }> = {
    LANGUAGE: {
      title: t("preferences.language"),
      description: t("preferences.languageDescription"),
    },
    THEME: {
      title: t("preferences.theme"),
      description: t("preferences.themeDescription"),
    },
  };

  const { data: options, isLoading: loadingOptions } = useQuery({
    queryKey: ["preference-options"],
    queryFn: getPreferenceOptions,
    staleTime: Infinity,
  });

  if (isLoading || loadingOptions || !options) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t("preferences.loading")}
      </Typography>
    );
  }

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
        {t("preferences.title")}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("preferences.description")}
      </Typography>

      <Stack spacing={2}>
        {Object.entries(options).map(([name, values]) => {
          const label = labels[name];

          return (
            <Card
              key={name}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "background.default",
                transition: (t) =>
                  t.transitions.create("box-shadow", {
                    duration: t.transitions.duration.short,
                  }),
                "&:hover": { boxShadow: 4 },
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography fontWeight={600} color="text.primary">
                    {label?.title ?? name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {label?.description ?? ""}
                  </Typography>
                </Box>

                <FormControl size="small" sx={{ minWidth: 220 }}>
                  <Select
                    value={(preferences as Record<string, string>)[name] ?? ""}
                    onChange={(e) => setPreference(name, String(e.target.value))}
                  >
                    {values.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Card>
          );
        })}
      </Stack>
    </Paper>
  );
}