import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { ExpandMore, Logout, Person, Tune } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/features/auth/useAuth";
import { useMe } from "@/hooks/useMe";
import { getAvatar } from "@/features/users/api/user.api";
import { getFirstName } from "@/utils/getFirstName";

export function UserMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: user } = useMe();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  const firstName = useMemo(() => (user ? getFirstName(user.fullName) : ""), [user]);

  // O endpoint de avatar exige autenticação — um <img src> direto não envia o
  // Bearer token, então precisa ser buscado via axios (blob) como no perfil.
  useEffect(() => {
    if (!user?.id || !user.avatarUrl) {
      setAvatarSrc(null);
      return;
    }

    let objectUrl: string | null = null;
    getAvatar(user.id)
      .then((url) => {
        objectUrl = url;
        setAvatarSrc(url);
      })
      .catch(() => setAvatarSrc(null));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [user?.id, user?.avatarUrl]);

  if (!user) return null;

  const close = () => setAnchorEl(null);

  const go = (path: string) => {
    close();
    navigate(path);
  };

  const handleLogout = () => {
    close();
    logout();
    navigate("/login");
  };

  return (
    <>
      <Button
        color="inherit"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        startIcon={
          avatarSrc ? (
            <Avatar
              src={avatarSrc}
              sx={{ width: 32, height: 32 }}
              alt={t("common.avatarAlt")}
            />
          ) : (
            <Avatar sx={{ width: 32, height: 32 }} aria-label={t("common.userAvatar")}>
              {firstName?.[0] ?? "U"}
            </Avatar>
          )
        }
        endIcon={<ExpandMore />}
        sx={{ textTransform: "none" }}
      >
        <Typography variant="body2">{firstName}</Typography>
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={close} PaperProps={{ sx: { width: 220 } }}>
        <MenuItem onClick={() => go("/users/me")}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          {t("userMenu.myProfile")}
        </MenuItem>

        <MenuItem onClick={() => go("/users/me/preferences")}>
          <ListItemIcon>
            <Tune fontSize="small" />
          </ListItemIcon>
          {t("userMenu.preferences")}
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          <ListItemIcon sx={{ color: "error.main" }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          {t("userMenu.logout")}
        </MenuItem>
      </Menu>
    </>
  );
}