import {
  Home as HomeIcon,
  People as PeopleIcon,
  Checklist as ChecklistIcon,
  Description as DescriptionIcon,
  Apartment as ApartmentIcon,
  AdminPanelSettings as AdminIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
} from "@mui/icons-material";
import { MenuItem } from "./menu.types";

export const menuPrincipal: MenuItem[] = [
  { label: "Início", to: "/dashboard", icon: HomeIcon },
  { label: "Lista de Empresas", to: "/customers", icon: PeopleIcon },
  { label: "Inspeções", to: "/inspections", icon: ChecklistIcon },
  {
    label: "Relatórios",
    to: "/reports",
    icon: DescriptionIcon,
    permissions: ["ROLE_ACCESS_REPORTS"],
  },
];

export const menuOutros: MenuItem[] = [
  {
    label: "Minha Empresa",
    to: "/company",
    icon: ApartmentIcon,
    permissions: ["ROLE_ADMIN"],
  },
  {
    label: "Usuários",
    to: "/users",
    icon: AdminIcon,
    permissions: ["ROLE_ADMIN"],
  },
  {
    label: "Configurações",
    to: "/configurations",
    icon: SettingsIcon,
    permissions: ["ROLE_ADMIN"],
  },
  { label: "Ajuda", to: "/help", icon: HelpIcon },
];