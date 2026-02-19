import { useCallback, useEffect, useMemo, useState } from "react";
import { usersApi } from "../api/usersApi";
import type { UserCreateRequestDTO, UserResponseDTO, UserUpdateRequestDTO } from "../api/usersApi";

export function useUsers() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [error, setError] = useState<unknown>(null);

  // UI state (adapt to your existing UsersPage controls)
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.findAll();
      setUsers(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      return (
        u.username.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.cpf ?? "").toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  // CRUD
  const createUser = useCallback(async (dto: UserCreateRequestDTO) => {
    const created = await usersApi.create(dto);
    // backend assigns default ROLE_USER + preferences automatically
    setUsers((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateUser = useCallback(async (id: number, dto: UserUpdateRequestDTO) => {
    const updated = await usersApi.update(id, dto);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    return updated;
  }, []);

  const deleteUser = useCallback(async (id: number) => {
    await usersApi.delete(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  return {
    // data
    users: filtered,
    rawUsers: users,
    loading,
    error,

    // ui
    search,
    setSearch,

    // actions
    reload: load,
    createUser,
    updateUser,
    deleteUser,
  };
}