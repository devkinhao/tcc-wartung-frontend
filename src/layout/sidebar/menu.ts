import {
  Home as HomeIcon,
  People as PeopleIcon,
  Checklist as ChecklistIcon,
  Build as BuildIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { MenuItem } from "./menu.types";
import { paths } from "@/routes/paths";
import { ROUTE_PERMISSIONS } from "@/routes/routePermissions";

export const menuPrincipal: MenuItem[] = [
  { label: "nav.home", to: paths.dashboard, icon: HomeIcon },
  { label: "nav.customersList", to: paths.customers, icon: PeopleIcon },
  { label: "nav.inspections", to: paths.inspections, icon: ChecklistIcon },
  { label: "nav.serviceTypes", to: paths.serviceTypes, icon: BuildIcon },
  {
    label: "nav.reports",
    to: paths.reports,
    icon: DescriptionIcon,
    permissions: ROUTE_PERMISSIONS.reports,
  },
];
