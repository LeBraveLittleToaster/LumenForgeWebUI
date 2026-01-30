import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/mainPage.tsx"),
  route("login", "routes/login.tsx"),
  route("", "./routes/protectedRoutes.tsx", [
    route("/home", "routes/dashboard.tsx", [
      index("routes/home.tsx"),
      route("devices", "routes/devices.tsx"),
      route("categories", "routes/categories.tsx"),
      route("maintenanceStatus", "routes/maintenanceStatus.tsx"),
      route("vendors", "routes/vendors.tsx"),
    ])
  ]),

  /*
  

  route("*", "routes/notFound.tsx"),
    -*/
] satisfies RouteConfig;
