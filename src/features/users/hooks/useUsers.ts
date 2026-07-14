import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/api/keys";
import { usersApi, type UserResponseDTO } from "../api/usersApi";

// --- Tipos e helpers de apresentação ---

export type UserRow = {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
};

function roleFromPermissions(perms: string[] | undefined): string {
  const p = perms ?? [];
  if (p.includes("ROLE_ADMIN")) return "ADMIN";
  return p[0]?.replace("ROLE_", "") ?? "—";
}

function toRow(u: UserResponseDTO): UserRow {
  return {
    id: u.id,
    fullName: u.fullName,
    username: u.username,
    email: u.email ?? "—",
    role: roleFromPermissions(u.permissions),
    isActive: Boolean(u.isActive),
  };
}

function matchesSearch(u: UserRow, q: string): boolean {
  return (
    u.fullName.toLowerCase().includes(q) ||
    u.username.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    u.role.toLowerCase().includes(q)
  );
}

// --- Hook ---

function compareValues(a: UserRow[keyof UserRow], b: UserRow[keyof UserRow]): number {
  if (typeof a === "boolean" && typeof b === "boolean") {
    return a === b ? 0 : a ? 1 : -1;
  }
  return String(a).localeCompare(String(b), "pt-BR", { sensitivity: "base" });
}

export function useUsers(search = "") {
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<keyof UserRow | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const { data = [], isLoading, error } = useQuery({
    queryKey: qk.users(),
    queryFn: () => usersApi.findAll(),
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const all = data.map(toRow);
    const filtered = q ? all.filter((u) => matchesSearch(u, q)) : all;

    if (!sortBy) return filtered;

    const sorted = [...filtered].sort((a, b) => compareValues(a[sortBy], b[sortBy]));
    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [data, search, sortBy, sortDir]);

  const handleSort = useCallback((column: keyof UserRow) => {
    setSortBy(column);
    setSortDir((prev) => (sortBy === column ? (prev === "asc" ? "desc" : "asc") : "asc"));
  }, [sortBy]);

  const reload = () => queryClient.invalidateQueries({ queryKey: qk.users() });

  const deleteMutation = useMutation({
    mutationFn: (user: UserRow) => usersApi.delete(user.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.users() }),
  });

  return {
    users: rows,
    isLoading,
    error,
    reload,
    deleteUser: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    sort: { by: sortBy, dir: sortDir, handle: handleSort },
  };
}
