import React from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  FormControl,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LanguageIcon from "@mui/icons-material/Language";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import ChatIcon from "@mui/icons-material/Chat";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { qk } from "@/api/keys";
import { Breadcrumb } from "@/layout/header/Breadcrumb";
import { breadcrumbMap } from "@/layout/header/breadcrumbMap";
import { paths } from "@/routes/paths";
import { typography } from "@/styles/typography";
import { toCamelCase } from "@/utils/strings";
import { usePreferences } from "../usePreferences";
import { getPreferenceOptions } from "../api/preferences.api";
import { PreferenceName } from "../types/Preferences";

const FLAG_ICON_STYLE = { fontSize: typography.size.flagIcon, lineHeight: 1 };

const PREFERENCE_OPTION_ICONS: Record<string, Record<string, React.ReactNode>> = {
  THEME: {
    light: <LightModeIcon fontSize="small" sx={{ color: "warning.main" }} />,
    dark: <DarkModeIcon fontSize="small" sx={{ color: "primary.main" }} />,
  },
  LANGUAGE: {
    pt_BR: <span style={FLAG_ICON_STYLE}>🇧🇷</span>,
    en_US: <span style={FLAG_ICON_STYLE}>🇺🇸</span>,
    de_DE: <span style={FLAG_ICON_STYLE}>🇩🇪</span>,
  },
  SHOW_NOTIFICATIONS: {
    true: <NotificationsActiveIcon fontSize="small" sx={{ color: "primary.main" }} />,
    false: <NotificationsOffIcon fontSize="small" sx={{ color: "text.disabled" }} />,
  },
  CHATBOT_ENABLED: {
    true: <ChatIcon fontSize="small" sx={{ color: "primary.main" }} />,
    false: <ChatBubbleOutlineIcon fontSize="small" sx={{ color: "text.disabled" }} />,
  },
};

const PREFERENCE_ORDER = [
  PreferenceName.LANGUAGE,
  PreferenceName.THEME,
  PreferenceName.SHOW_NOTIFICATIONS,
  PreferenceName.CHATBOT_ENABLED,
];

/**
 * Controle de uma preferência: interruptor para as opções de liga/desliga
 * (notificações, chatbot) e para o tema (claro/escuro); um Select para as
 * demais (idioma).
 */
function PreferenceControl({
  name,
  values,
  currentValue,
  onChange,
  label,
}: {
  name: string;
  values: string[];
  currentValue: string;
  onChange: (value: string) => void;
  label: (value: string) => string;
}) {
  const icons = PREFERENCE_OPTION_ICONS[name] ?? {};
  const isBoolean = values.length === 2 && values.includes("true") && values.includes("false");

  if (isBoolean) {
    return (
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
        <Switch
          checked={currentValue === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
          inputProps={{ "aria-label": label(currentValue) }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 78 }}>
          {label(currentValue)}
        </Typography>
      </Stack>
    );
  }

  if (name === "THEME") {
    const dark = currentValue === "dark";
    return (
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
        <LightModeIcon fontSize="small" sx={{ color: dark ? "text.disabled" : "warning.main" }} />
        <Switch
          checked={dark}
          onChange={(e) => onChange(e.target.checked ? "dark" : "light")}
          inputProps={{ "aria-label": label(currentValue) }}
        />
        <DarkModeIcon fontSize="small" sx={{ color: dark ? "primary.main" : "text.disabled" }} />
      </Stack>
    );
  }

  return (
    <FormControl size="small" sx={{ minWidth: 220, flexShrink: 0 }}>
      <Select
        value={currentValue}
        onChange={(e) => onChange(String(e.target.value))}
        renderValue={(selected) => (
          <Stack direction="row" spacing={1} alignItems="center">
            {icons[selected] && (
              <Box component="span" sx={{ display: "flex", alignItems: "center" }}>{icons[selected]}</Box>
            )}
            <span>{label(selected)}</span>
          </Stack>
        )}
      >
        {values.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {icons[opt] && (
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Box component="span" sx={{ display: "flex", alignItems: "center" }}>{icons[opt]}</Box>
              </ListItemIcon>
            )}
            <ListItemText primary={label(opt)} primaryTypographyProps={{ variant: "body2" }} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function PreferencesPage() {
  const { t } = useTranslation();
  const { preferences, setPreference, isLoading } = usePreferences();
  const { data: options, isLoading: loadingOptions } = useQuery({
    queryKey: qk.preferenceOptions(),
    queryFn: getPreferenceOptions,
    staleTime: Infinity,
  });

  const optionLabel = (prefName: string, value: string) =>
    t(`preferences.options.${prefName}.${value}`, { defaultValue: value });

  const sortedEntries = options
    ? Object.entries(options).sort(([a], [b]) => {
        const ia = PREFERENCE_ORDER.indexOf(a as PreferenceName);
        const ib = PREFERENCE_ORDER.indexOf(b as PreferenceName);
        if (ia === -1 && ib === -1) return 0;
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      })
    : [];

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumb items={breadcrumbMap[paths.preferences]} size="large" />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          {t("preferences.description")}
        </Typography>
      </Box>

      {isLoading || loadingOptions || !options ? (
        <Skeleton variant="rounded" height={280} />
      ) : (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack divider={<Divider />} spacing={2.5}>
              {sortedEntries.map(([name, values]) => {
                const currentValue = (preferences as Record<string, string>)[name] ?? "";

                return (
                  <Stack
                    key={name}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ sm: "center" }}
                    justifyContent="space-between"
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        {name === "THEME" && <LightModeIcon fontSize="small" color="action" />}
                        {name === "LANGUAGE" && <LanguageIcon fontSize="small" color="action" />}
                        {name === "SHOW_NOTIFICATIONS" && <NotificationsActiveIcon fontSize="small" color="action" />}
                        {name === "CHATBOT_ENABLED" && <ChatIcon fontSize="small" color="action" />}
                        <Typography variant="subtitle1" color="text.primary">
                          {t(`preferences.${toCamelCase(name)}`, { defaultValue: name })}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {t(`preferences.${toCamelCase(name)}Description`, { defaultValue: "" })}
                      </Typography>
                    </Box>

                    <PreferenceControl
                      name={name}
                      values={values}
                      currentValue={currentValue}
                      onChange={(value) => setPreference(name, value)}
                      label={(value) => optionLabel(name, value)}
                    />
                  </Stack>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
