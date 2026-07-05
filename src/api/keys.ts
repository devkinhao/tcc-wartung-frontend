// Central place for React Query keys.
// Using functions keeps keys consistent and helps with type inference.

export const qk = {
  me: () => ["me"] as const,
  preferences: () => ["preferences"] as const,
  preferenceOptions: () => ["preference-options"] as const,
  cities: () => ["cities"] as const,
  company: () => ["company"] as const,
  customers: (params: Record<string, unknown> = {}) => ["customers", params] as const,
  customerDetail: (id: number) => ["customer-detail", id] as const,
  inspectionDetail: (id: number) => ["inspection-detail", id] as const,
  inspectionDocuments: (id: number) => ["inspection-documents", id] as const,
  users: () => ["users"] as const,
  dashboard: () => ["dashboard"] as const,
  inspectionsList: (params: Record<string, unknown> = {}) => ["inspections-list", params] as const,
  configurations: () => ["configurations"] as const,
  serviceTypes: () => ["service-types"] as const,
  customerSearch: (search: string) => ["customer-search", search] as const,
  notifications: (params: Record<string, unknown> = {}) => ["notifications", params] as const,
  notificationsUnreadCount: () => ["notifications-unread-count"] as const,
};
