import { route } from "@react-router/dev/routes";
import type { Route } from "./+types/devicePage";
import { useParams } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

type DevicePageParams = {
  uuid:string
}

export default function DevicePage() {
  const { uuid } = useParams<DevicePageParams>();
  console.log(uuid)
  return <a>Device page {uuid}</a>
}
