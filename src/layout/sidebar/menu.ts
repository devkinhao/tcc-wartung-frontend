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
import { paths } from "@/routes/paths";
import { ROUTE_PERMISSIONS } from "@/routes/routePermissions";

export const menuPrincipal: MenuItem[] = [
  { label: "nav.home", to: paths.dashboard, icon: HomeIcon },
  { label: "nav.customersList", to: paths.customers, icon: PeopleIcon },
  { label: "nav.inspections", to: paths.inspections, icon: ChecklistIcon },
  {
    label: "nav.reports",
    to: paths.reports,
    icon: DescriptionIcon,
    permissions: ROUTE_PERMISSIONS.reports,
  },
];

export const menuOutros: MenuItem[] = [
  {
    label: "nav.myCompany",
    to: paths.company,
    icon: ApartmentIcon,
    permissions: ROUTE_PERMISSIONS.admin,
  },
  {
    label: "nav.users",
    to: paths.users,
    icon: AdminIcon,
    permissions: ROUTE_PERMISSIONS.admin,
  },
  {
    label: "nav.configurations",
    to: paths.configurations,
    icon: SettingsIcon,
    permissions: ROUTE_PERMISSIONS.admin,
  },
  { label: "nav.help", to: paths.help, icon: HelpIcon },
];
