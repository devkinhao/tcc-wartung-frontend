import { useLocation } from "react-router-dom";
import { Breadcrumb } from "./Breadcrumb";
import { UserMenu } from "./UserMenu";
import { NotificationsMenu } from "./NotificationsMenu";
import { breadcrumbMap } from "./breadcrumbMap";

export default function Header() {
  const location = useLocation();

  const crumbs =
    breadcrumbMap[location.pathname] ??
    [{ label: "Início", path: "/dashboard" }];

  return (
    <header className="h-14 bg-screen border-b flex items-center justify-between px-6">
      <Breadcrumb items={crumbs} />

      <div className="flex items-center gap-2">
        <NotificationsMenu />
        <UserMenu />
      </div>
    </header>
  );
}