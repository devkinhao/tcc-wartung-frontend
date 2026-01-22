import { useNavigate } from "react-router-dom";
import { BreadcrumbItem } from "./breadcrumbMap";

type Props = {
  items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: Props) {
  const navigate = useNavigate();

  return (
    <nav className="text-sm flex items-center gap-1 text-text-secondary">
      {items.map((crumb, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && <span className="mx-1">/</span>}

            {crumb.path && !isLast ? (
              <button
                onClick={() => crumb.path && navigate(crumb.path)}
                className="hover:text-principal-blue hover:underline"
              >
                {crumb.label}
              </button>
            ) : (
              <span
                className={`font-medium ${
                  isLast ? "text-principal-blue" : ""
                }`}
              >
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}