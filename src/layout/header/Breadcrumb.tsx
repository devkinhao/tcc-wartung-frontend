import { useNavigate } from "react-router-dom";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import type { BreadcrumbItem } from "./breadcrumbMap";

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const navigate = useNavigate();

  return (
    <Breadcrumbs aria-label="breadcrumb">
      {items.map((c, i) => {
        const last = i === items.length - 1;

        if (c.path && !last) {
          return (
            <Link
              key={`${c.label}-${i}`}
              underline="hover"
              color="inherit"
              sx={{ cursor: "pointer" }}
              onClick={() => navigate(c.path!)}
            >
              {c.label}
            </Link>
          );
        }

        return (
          <Typography key={`${c.label}-${i}`} color={last ? "text.primary" : "text.secondary"} fontWeight={last ? 700 : 500}>
            {c.label}
          </Typography>
        );
      })}
    </Breadcrumbs>
  );
}