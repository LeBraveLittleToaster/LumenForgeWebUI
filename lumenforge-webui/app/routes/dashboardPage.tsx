import type { Route } from "./+types/dashboardPage";
import { DashboardLayout } from "~/components/dashboard/dashboardLayout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function DashboardPage() {
  return (<DashboardLayout/>)
}
