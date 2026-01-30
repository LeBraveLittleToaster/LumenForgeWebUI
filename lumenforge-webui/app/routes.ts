import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/homePage.tsx"),
  
  route("login", "routes/loginPage.tsx"),
  
  // Authenticated routes
  route("", "routes/protectedRoutes.tsx", [
    route("app", "routes/dashboardPage.tsx", [
      route("devices", "routes/devicesPage.tsx"),
      route("categories", "routes/categoriesPage.tsx"),
      route("maintenanceStatus", "routes/maintenanceStatusPage.tsx"),
      route("vendors", "routes/vendorsPage.tsx"),
    ])
  ]),

  /*
  route("*", "routes/notFound.tsx"),
    -*/
] satisfies RouteConfig;
