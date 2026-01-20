import type { Route } from "./+types/dashboard";
import { DashboardLayout } from "~/components/dashboard/dashboardLayout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Dashboard() {
  return (<DashboardLayout/>)
}
