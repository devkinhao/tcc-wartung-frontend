import { Button } from "@/components/Button";
import { Tooltip } from "@/components/Tooltip";
import { canAccess } from "@/features/auth/permissions";
import { useAuth } from "@/features/auth/useAuth";
import { getAvatar } from "@/features/users/api/user.api";
import { useMe } from "@/hooks/useMe";
import { paths } from "@/routes/paths";
import { ROUTE_PERMISSIONS } from "@/routes/routePermissions";
import { getFirstName } from "@/utils/getFirstName";
import {
  AdminPanelSettings,
  Apartment,
  Article,
  ExpandLess,
  ExpandMore,
  Logout,
  Person,
  Settings,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

/** Menu do usuário no cabeçalho, com atalhos de navegação e encerramento de sessão. */
export function UserMenu() {
  /** Hooks. */
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: user } = useMe();

  /** Estados. */
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  /** Indica se o menu está aberto. */
  const open = Boolean(anchorEl);

  /** Primeiro nome do usuário para exibição compacta no botão do menu. */
  const firstName = useMemo(
    () => (user ? getFirstName(user.fullName) : ""),
    [user],
  );

  /** Verifica se o usuário tem acesso ao painel administrativo. */
  const isAdmin = useMemo(
    () => canAccess(user?.permissions ?? [], ROUTE_PERMISSIONS.admin),
    [user],
  );

  /** Avatar obtido via API autenticada. */
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

  /** Fecha o menu do usuário e centraliza o fluxo de navegação. */
  const close = () => setAnchorEl(null);

  /** Navega para a rota escolhida e fecha o menu antes da transição. */
  const go = (path: string) => {
    close();
    navigate(path);
  };

  /** Finaliza a sessão do usuário e o redireciona para a tela de login. */
  const handleLogout = () => {
    close();
    logout();
    navigate(paths.login);
  };

  return (
    <>
      {/** Botão principal do usuário no cabeçalho. */}
      <Button
        tooltip={t("userMenu.tooltip.title")}
        variant="text"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        startIcon={
          avatarSrc ? (
            <Avatar
              src={avatarSrc}
              sx={{ width: 32, height: 32 }}
              alt={t("common.alt.avatar")}
            />
          ) : (
            <Avatar
              sx={{ width: 32, height: 32 }}
              aria-label={t("common.userAvatar")}
            >
              {firstName?.[0] ?? "U"}
            </Avatar>
          )
        }
        endIcon={
          open ? <ExpandLess color="action" /> : <ExpandMore color="action" />
        }
      >
        <Typography sx={{ color: "text.primary" }}>{firstName}</Typography>
      </Button>
      {/** Menu contextual com dados do usuário e ações de navegação. */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        slotProps={{ paper: { sx: { width: 260 } } }}
      >
        {/** Informações do usuário autenticado. */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Stack direction="column">
            {user.profession && (
              <Typography variant="subtitle1" noWrap>
                {user.profession}
              </Typography>
            )}
            {user.email && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {user.email}
              </Typography>
            )}
          </Stack>
        </Box>
        <Divider sx={{ my: 1 }} />
        {/** Acesso ao perfil do usuário. */}
        <Tooltip title={t("userMenu.tooltip.myProfile")} placement="left">
          <MenuItem onClick={() => go(paths.userProfile)}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            {t("userMenu.myProfile")}
          </MenuItem>
        </Tooltip>
        {/** Acesso aos dados da empresa vinculada ao usuário. */}
        <Tooltip title={t("userMenu.tooltip.myCompany")} placement="left">
          <MenuItem onClick={() => go(paths.company)}>
            <ListItemIcon>
              <Apartment fontSize="small" />
            </ListItemIcon>
            {t("userMenu.myCompany")}
          </MenuItem>
        </Tooltip>
        {/** Seção de documentos ou anexos do usuário. */}
        <Tooltip title={t("userMenu.tooltip.documents")} placement="left">
          <MenuItem onClick={() => go(paths.documents)}>
            <ListItemIcon>
              <Article fontSize="small" />
            </ListItemIcon>
            {t("userMenu.documents")}
          </MenuItem>
        </Tooltip>
        {/** Ajustes pessoais e preferências da aplicação. */}
        <Tooltip title={t("userMenu.tooltip.settings")} placement="left">
          <MenuItem onClick={() => go(paths.preferences)}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            {t("userMenu.settings")}
          </MenuItem>
        </Tooltip>
        {/** Área administrativa exclusiva para usuários com permissão. */}
        {isAdmin && (
          <Tooltip title={t("userMenu.tooltip.admin")} placement="left">
            <MenuItem
              onClick={() => go(paths.adminPanel)}
              sx={{ color: "secondary.main" }}
            >
              <ListItemIcon sx={{ color: "secondary.main" }}>
                <AdminPanelSettings fontSize="small" />
              </ListItemIcon>
              {t("userMenu.admin")}
            </MenuItem>
          </Tooltip>
        )}
        <Divider />
        {/** Encerramento da sessão ativa do usuário. */}
        <Tooltip title={t("userMenu.tooltip.logout")} placement="left">
          <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
            <ListItemIcon sx={{ color: "error.main" }}>
              <Logout fontSize="small" />
            </ListItemIcon>
            {t("userMenu.logout")}
          </MenuItem>
        </Tooltip>
      </Menu>
    </>
  );
}
