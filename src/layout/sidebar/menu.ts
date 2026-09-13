import { paths } from "@/routes/paths";
import { ROUTE_PERMISSIONS } from "@/routes/routePermissions";
import {
  BarChart as BarChartIcon,
  Checklist as ChecklistIcon,
  Groups as GroupsIcon,
  Home as HomeIcon,
  ReceiptLong as ReceiptLongIcon,
} from "@mui/icons-material";
import { MenuItem } from "./menu.types";

/** Itens de menu para a sidebar principal. */
export const mainMenu: MenuItem[] = [
  {
    label: "nav.home",
    tooltip: "nav.tooltip.home",
    to: paths.home,
    icon: HomeIcon,
  },
  {
    label: "nav.customersList",
    tooltip: "nav.tooltip.customersList",
    to: paths.customers,
    icon: GroupsIcon,
  },
  {
    label: "nav.inspections",
    tooltip: "nav.tooltip.inspections",
    to: paths.inspections,
    icon: ChecklistIcon,
  },
  {
    label: "nav.dashboard",
    tooltip: "nav.tooltip.dashboard",
    to: paths.dashboard,
    icon: BarChartIcon,
  },
  {
    label: "nav.reports",
    tooltip: "nav.tooltip.reports",
    to: paths.reports,
    icon: ReceiptLongIcon,
    permissions: ROUTE_PERMISSIONS.reports,
  },
];
