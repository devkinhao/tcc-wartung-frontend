import {
  MdHome,
  MdPeople,
  MdChecklist,
  MdDescription,
  MdApartment,
  MdAdminPanelSettings,
  MdSettings,
  MdHelp,
} from "react-icons/md";
import { MenuItem } from "./menu.types";

export const menuPrincipal: MenuItem[] = [
  { label: "Início", to: "/dashboard", icon: MdHome },
  { label: "Lista de Empresas", to: "/customers", icon: MdPeople },
  { label: "Inspeções", to: "/inspections", icon: MdChecklist },
  {
    label: "Relatórios",
    to: "/reports",
    icon: MdDescription,
    permissions: ["ROLE_ACCESS_REPORTS"],
  },
];

export const menuOutros: MenuItem[] = [
  {
    label: "Minha Empresa",
    to: "/company",
    icon: MdApartment,
    permissions: ["ROLE_ADMIN"],
  },
  {
    label: "Usuários",
    to: "/users",
    icon: MdAdminPanelSettings,
    permissions: ["ROLE_ADMIN"],
  },
  {
    label: "Configurações",
    to: "/configurations",
    icon: MdSettings,
    permissions: ["ROLE_ADMIN"],
  },
  { label: "Ajuda", to: "/help", icon: MdHelp },
];