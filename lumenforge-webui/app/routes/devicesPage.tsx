import { DevicePage } from "~/components/devices/devicePage";
import type { Route } from "./+types/devices";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function DevicesPage() {
  return <DevicePage />;
}
