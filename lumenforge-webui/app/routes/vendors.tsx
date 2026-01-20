import { Typography } from "@mui/material";
import type { Route } from "./+types/vendors";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Vendors() {
  return (<Typography>Vendors</Typography>)
}
