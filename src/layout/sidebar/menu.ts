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
  { label: "nav.home", to: "/dashboard", icon: HomeIcon },
  { label: "nav.customersList", to: "/customers", icon: PeopleIcon },
  { label: "nav.inspections", to: "/inspections", icon: ChecklistIcon },
  {
    label: "nav.reports",
    to: "/reports",
    icon: DescriptionIcon,
    permissions: ["ROLE_ACCESS_REPORTS"],
  },
];

export const menuOutros: MenuItem[] = [
  {
    label: "nav.myCompany",
    to: "/company",
    icon: ApartmentIcon,
    permissions: ["ROLE_ADMIN"],
  },
  {
    label: "nav.users",
    to: "/users",
    icon: AdminIcon,
    permissions: ["ROLE_ADMIN"],
  },
  {
    label: "nav.configurations",
    to: "/configurations",
    icon: SettingsIcon,
    permissions: ["ROLE_ADMIN"],
  },
  { label: "nav.help", to: "/help", icon: HelpIcon },
];