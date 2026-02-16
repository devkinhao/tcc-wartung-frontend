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

import { useAuth } from "@/features/auth/useAuth";
import { useMe } from "@/hooks/useMe";
import { getFirstName } from "@/utils/getFirstName";

export function UserMenu() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: user } = useMe();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [avatarError, setAvatarError] = useState(false);

  const firstName = useMemo(() => (user ? getFirstName(user.fullName) : ""), [user]);

  const avatarSrc = user?.avatarUrl
    ? `${import.meta.env.VITE_API_URL}${user.avatarUrl}`
    : null;

  useEffect(() => setAvatarError(false), [avatarSrc]);

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
          avatarSrc && !avatarError ? (
            <Avatar
              src={avatarSrc}
              imgProps={{ onError: () => setAvatarError(true) }}
              sx={{ width: 32, height: 32 }}
            />
          ) : (
            <Avatar sx={{ width: 32, height: 32 }}>
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
          Meu perfil
        </MenuItem>

        <MenuItem onClick={() => go("/users/me/preferences")}>
          <ListItemIcon>
            <Tune fontSize="small" />
          </ListItemIcon>
          Preferências
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          <ListItemIcon sx={{ color: "error.main" }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          Sair
        </MenuItem>
      </Menu>
    </>
  );
}