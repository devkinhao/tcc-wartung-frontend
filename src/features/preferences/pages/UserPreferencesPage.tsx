import { usePreferences } from "@/features/preferences/PreferencesContext";
import { getPreferenceOptions } from "@/features/preferences/api/preferences.api";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Card,
  Chip,
  FormControl,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LanguageIcon from "@mui/icons-material/Language";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import { useTranslation } from "react-i18next";
import { qk } from "@/api/keys";
import { PreferenceName } from "@/types/Preferences";
import { toCamelCase } from "@/utils/strings";

// ── Ícones por opção ────────────────────────────────────────────────────────

const OPTION_ICONS: Record<string, Record<string, React.ReactNode>> = {
  THEME: {
    light: <LightModeIcon fontSize="small" sx={{ color: "warning.main" }} />,
    dark: <DarkModeIcon fontSize="small" sx={{ color: "primary.main" }} />,
  },
  LANGUAGE: {
    pt_BR: <span style={{ fontSize: 16, lineHeight: 1 }}>🇧🇷</span>,
    en_US: <span style={{ fontSize: 16, lineHeight: 1 }}>🇺🇸</span>,
    de_DE: <span style={{ fontSize: 16, lineHeight: 1 }}>🇩🇪</span>,
  },
  SHOW_NOTIFICATIONS: {
    true: <NotificationsActiveIcon fontSize="small" sx={{ color: "primary.main" }} />,
    false: <NotificationsOffIcon fontSize="small" sx={{ color: "text.disabled" }} />,
  },
};

// ── Ordem de exibição das preferências ─────────────────────────────────────

const PREFERENCE_ORDER = [
  PreferenceName.LANGUAGE,
  PreferenceName.THEME,
  PreferenceName.SHOW_NOTIFICATIONS,
];

// ── Componente ───────────────────────────────────────────────────────────────

export default function UserPreferencesPage() {
  const { t } = useTranslation();
  const { preferences, setPreference, isLoading } = usePreferences();

  const { data: options, isLoading: loadingOptions } = useQuery({
    queryKey: qk.preferenceOptions(),
    queryFn: getPreferenceOptions,
    staleTime: Infinity,
  });

  /** Traduz o valor bruto de uma preferência: t("preferences.options.THEME.dark") → "Escuro" */
  function optionLabel(prefName: string, value: string): string {
    return t(`preferences.options.${prefName}.${value}`, { defaultValue: value });
  }

  const cardSx = {
    p: 2.5,
    borderRadius: 2,
    bgcolor: "background.default",
    transition: (th: any) =>
      th.transitions.create("box-shadow", { duration: th.transitions.duration.short }),
    "&:hover": { boxShadow: 4 },
  } as const;

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading || loadingOptions) {
    return (
      <Paper elevation={1} sx={{ maxWidth: 896, p: 3, borderRadius: 2, bgcolor: "background.paper" }}>
        <Skeleton variant="text" width={180} height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={320} height={20} sx={{ mb: 3 }} />
        <Stack spacing={2}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={80} />
          ))}
        </Stack>
      </Paper>
    );
  }

  if (!options) return null;

  // Ordena conforme PREFERENCE_ORDER; itens desconhecidos vão ao final
  const sortedEntries = Object.entries(options).sort(([a], [b]) => {
    const ia = PREFERENCE_ORDER.indexOf(a as PreferenceName);
    const ib = PREFERENCE_ORDER.indexOf(b as PreferenceName);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return (
    <Paper elevation={1} sx={{ maxWidth: 896, p: 3, borderRadius: 2, bgcolor: "background.paper" }}>
      <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
        {t("preferences.title")}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("preferences.description")}
      </Typography>

      <Stack spacing={2}>
        {sortedEntries.map(([name, values]) => {
          const currentValue = (preferences as Record<string, string>)[name] ?? "";
          const icons = OPTION_ICONS[name] ?? {};

          return (
            <Card key={name} sx={cardSx}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
              >
                {/* Descrição da preferência */}
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    {name === "THEME" && <LightModeIcon fontSize="small" color="action" />}
                    {name === "LANGUAGE" && <LanguageIcon fontSize="small" color="action" />}
                    {name === "SHOW_NOTIFICATIONS" && <NotificationsActiveIcon fontSize="small" color="action" />}
                    <Typography fontWeight={600} color="text.primary">
                      {t(`preferences.${toCamelCase(name)}`, { defaultValue: name })}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    {t(`preferences.${toCamelCase(name)}Description`, { defaultValue: "" })}
                  </Typography>
                </Box>

                {/* Select de opções */}
                <FormControl size="small" sx={{ minWidth: 220, flexShrink: 0 }}>
                  <Select
                    value={currentValue}
                    onChange={(e) => setPreference(name, String(e.target.value))}
                    displayEmpty
                    // Exibe label traduzida (não o valor bruto) no campo fechado
                    renderValue={(selected) =>
                      selected ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          {icons[selected] && (
                            <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
                              {icons[selected]}
                            </Box>
                          )}
                          <span>{optionLabel(name, selected)}</span>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {t("common.select", { defaultValue: "Selecionar" })}
                        </Typography>
                      )
                    }
                  >
                    {values.map((opt) => (
                      <MenuItem key={opt} value={opt} selected={opt === currentValue}>
                        {icons[opt] && (
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
                              {icons[opt]}
                            </Box>
                          </ListItemIcon>
                        )}
                        <ListItemText
                          primary={optionLabel(name, opt)}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
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
