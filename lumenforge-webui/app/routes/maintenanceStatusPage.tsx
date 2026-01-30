import { Typography } from "@mui/material";
import type { Route } from "./+types/maintenanceStatusPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function MaintenanceStatusPage() {
  return (<Typography>Maintenance Status</Typography>)
}
