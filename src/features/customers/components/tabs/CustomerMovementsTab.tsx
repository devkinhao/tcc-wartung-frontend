import { Grid, Paper, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { formatDateBR, formatTimeBR } from "@/utils/date";
import type { CustomerDetailResponseDTO } from "../../types/customerDetail";

type Props = {
  view: CustomerDetailResponseDTO;
};

export function CustomerMovementsTab({ view }: Props) {
  const { t } = useTranslation();

  const dateTime = (iso?: string | null) =>
    iso
      ? t("customerDetails.movements.format.dateTime", {
          date: formatDateBR(iso),
          time: formatTimeBR(iso),
        })
      : "—";

  return (
    <Paper elevation={1} sx={{ borderRadius: 2, p: 2, maxWidth: 720 }}>
      <Typography fontWeight={700} sx={{ mb: 2 }}>
        {t("customerDetails.movements.title")}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            label={t("customerDetails.movements.fields.createdAt")}
            size="small"
            fullWidth
            value={dateTime(view.createdAt)}
            disabled
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label={t("customerDetails.movements.fields.createdBy")}
            size="small"
            fullWidth
            value={view.createdByUsername ?? "—"}
            disabled
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label={t("customerDetails.movements.fields.updatedAt")}
            size="small"
            fullWidth
            value={dateTime(view.updatedAt)}
            disabled
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label={t("customerDetails.movements.fields.updatedBy")}
            size="small"
            fullWidth
            value={view.updatedByUsername ?? "—"}
            disabled
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
