// Central place for React Query keys.
// Using functions keeps keys consistent and helps with type inference.

export const qk = {
  me: () => ["me"] as const,
  preferences: () => ["preferences"] as const,
  preferenceOptions: () => ["preference-options"] as const,
  customers: (params?: Record<string, unknown>) =>
    params ? (["customers", params] as const) : (["customers"] as const),
};
