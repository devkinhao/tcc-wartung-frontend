export enum PreferenceName {
  LANGUAGE = "LANGUAGE",
  THEME = "THEME",
}

export type UserPreference = {
  name: PreferenceName;
  value: string;
};

export type PreferenceOptionMap = Record<string, string[]>;