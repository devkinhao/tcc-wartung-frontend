export enum PreferenceName {
  LANGUAGE = "LANGUAGE",
  THEME = "THEME",
  SHOW_NOTIFICATIONS = "SHOW_NOTIFICATIONS",
}

export type UserPreference = {
  name: PreferenceName;
  value: string;
};

export type PreferenceOptionMap = Record<string, string[]>;
