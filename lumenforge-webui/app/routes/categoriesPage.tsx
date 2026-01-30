import { Box, TextField, Typography } from "@mui/material";
import type { Route } from "./+types/categoriesPage";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function CategoriesPage() {
  return (<Box sx={{ p: 2 }}>
    <TextField id="outlined-basic" label="Outlined" variant="outlined" />
  </Box>);
}
