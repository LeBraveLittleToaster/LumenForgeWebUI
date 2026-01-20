import type { Route } from "./+types/home";
import { Console } from "../components/dashboard/dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function NotFound() {
  return <a>Not Found</a>
}
