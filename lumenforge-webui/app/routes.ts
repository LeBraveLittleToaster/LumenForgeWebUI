import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Dashboard layout wraps the sidebar + main content (<Outlet />)
  route("/", "routes/dashboard.tsx", [
    index("routes/home.tsx"),
    route("devices", "routes/devices.tsx"),
    route("categories", "routes/categories.tsx"),
    route("maintenanceStatus", "routes/maintenanceStatus.tsx"),
    route("vendors", "routes/vendors.tsx"),
  ]),

  /*
  route("login", "routes/login.tsx"), // "/login"

  route("*", "routes/notFound.tsx"),
    -*/
] satisfies RouteConfig;
