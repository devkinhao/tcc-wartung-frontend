import {
  Home as HomeIcon,
  Insights as InsightsIcon,
  People as PeopleIcon,
  Checklist as ChecklistIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { MenuItem } from "./menu.types";
import { paths } from "@/routes/paths";
import { ROUTE_PERMISSIONS } from "@/routes/routePermissions";

export const menuPrincipal: MenuItem[] = [
  { label: "nav.home", to: paths.home, icon: HomeIcon },
  { label: "nav.inspections", to: paths.inspections, icon: ChecklistIcon },
  { label: "nav.customersList", to: paths.customers, icon: PeopleIcon },
  { label: "nav.analytics", to: paths.dashboard, icon: InsightsIcon },
  {
    label: "nav.reports",
    to: paths.reports,
    icon: DescriptionIcon,
    permissions: ROUTE_PERMISSIONS.reports,
  },
];
