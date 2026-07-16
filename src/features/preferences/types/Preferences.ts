export enum PreferenceName {
  LANGUAGE = "LANGUAGE",
  THEME = "THEME",
  SHOW_NOTIFICATIONS = "SHOW_NOTIFICATIONS",
  CHATBOT_ENABLED = "CHATBOT_ENABLED",
}

export type UserPreference = {
  name: PreferenceName;
  value: string;
};

export type PreferenceOptionMap = Record<string, string[]>;
