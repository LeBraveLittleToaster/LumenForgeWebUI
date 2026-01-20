import { DevicePage } from "~/components/devices/devicePage";
import type { Route } from "./+types/settings";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

// app/routes/_app.stage.editor.tsx
export default function Route() {
  return <DevicePage />;
}
