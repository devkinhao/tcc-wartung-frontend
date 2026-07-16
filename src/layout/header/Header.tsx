import { useLocation } from "react-router-dom";
import { AppBar, Box, Toolbar } from "@mui/material";
import { Breadcrumb } from "./Breadcrumb";
import { UserMenu } from "./UserMenu";
import { NotificationsMenu } from "./NotificationsMenu";
import { breadcrumbMap, PAGES_WITH_OWN_BREADCRUMB } from "./breadcrumbMap";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/keys";
import { getCustomerDetail } from "@/features/customers/api/customers.detail.api";
import { getInspectionDetail } from "@/features/inspections/api/inspections.detail.api";
import { usePreferences } from "@/features/preferences/usePreferences";
import { paths } from "@/routes/paths";

export default function Header({ drawerWidth }: { drawerWidth: number }) {
  const { t }      = useTranslation();
  const location   = useLocation();
  const pathname   = location.pathname;
  const { preferences } = usePreferences();
  const showNotifications = preferences.SHOW_NOTIFICATIONS !== "false";

  // Parse dynamic route params from pathname
  const inspMatch     = pathname.match(/^\/customers\/(\d+)\/inspections\/(\d+)/);
  const custMatch     = pathname.match(/^\/customers\/(\d+)/);
  const stdInspMatch  = pathname.match(/^\/inspections\/(\d+)/);

  const customerId    = inspMatch ? Number(inspMatch[1]) : custMatch ? Number(custMatch[1]) : null;
  const inspectionId  = inspMatch ? Number(inspMatch[2]) : stdInspMatch ? Number(stdInspMatch[1]) : null;

  const { data: customer } = useQuery({
    queryKey: qk.customerDetail(customerId!),
    queryFn:  () => getCustomerDetail(customerId!),
    enabled:  !!customerId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: inspection } = useQuery({
    queryKey: qk.inspectionDetail(inspectionId!),
    queryFn:  () => getInspectionDetail(inspectionId!),
    enabled:  !!inspectionId,
    staleTime: 1000 * 60 * 5,
  });

  // Build crumbs for dynamic routes
  let crumbs = breadcrumbMap[pathname];

  if (!crumbs) {
    const customerName = customer?.legalName ?? t("nav.customerDetails");

    if (inspMatch && customerId) {
      // /customers/:customerId/inspections/:id
      crumbs = [
        { label: "nav.home",          path: paths.dashboard },
        { label: "nav.customersList", path: paths.customers },
        { label: customerName,        path: paths.customerInspectionsTab(customerId) },
        { label: inspection ? `${t("nav.inspectionDetails")} #${inspectionId}` : t("nav.inspectionDetails") },
      ];
    } else if (custMatch && customerId) {
      // /customers/:id
      crumbs = [
        { label: "nav.home",          path: paths.dashboard },
        { label: "nav.customersList", path: paths.customers },
        { label: customerName },
      ];
    } else if (stdInspMatch) {
      // /inspections/:id
      crumbs = [
        { label: "nav.home",            path: paths.dashboard },
        { label: "nav.inspectionsList", path: paths.inspections },
        { label: inspection ? `${t("nav.inspectionDetails")} #${inspectionId}` : t("nav.inspectionDetails") },
      ];
    } else {
      crumbs = [{ label: "nav.home", path: paths.dashboard }];
    }
  }

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        ml: `${drawerWidth}px`,
        width: `calc(100% - ${drawerWidth}px)`,
        zIndex: (th) => th.zIndex.drawer + 1,
        transition: (th) =>
          th.transitions.create(["margin-left", "width"], {
            duration: th.transitions.duration.standard,
          }),
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Box>{!PAGES_WITH_OWN_BREADCRUMB.has(pathname) && <Breadcrumb items={crumbs} />}</Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {showNotifications && <NotificationsMenu />}
          <UserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
