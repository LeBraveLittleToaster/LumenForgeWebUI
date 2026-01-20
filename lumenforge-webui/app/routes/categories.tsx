import { Typography } from "@mui/material";
import type { Route } from "./+types/categories";
import { DashboardLayout } from "~/components/dashboard/dashboardLayout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Categories() {
  return (<Typography>Categories</Typography>)
}
