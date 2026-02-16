import { Box, Card, CardContent, Grid, Typography } from "@mui/material";

export default function Dashboard() {
  return (
    <Box sx={{ maxWidth: 1152, width: "100%" }}>
      <Typography variant="h6" fontWeight={600} color="primary.main" sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              transition: (t) => t.transitions.create("box-shadow"),
              "&:hover": { boxShadow: 4 },
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
                Serviços mais solicitados
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nenhum dado disponível no momento
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              transition: (t) => t.transitions.create("box-shadow"),
              "&:hover": { boxShadow: 4 },
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
                Clientes por cidade
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nenhum dado disponível no momento
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              transition: (t) => t.transitions.create("box-shadow"),
              "&:hover": { boxShadow: 4 },
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
                Inspeções
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nenhum dado disponível no momento
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}