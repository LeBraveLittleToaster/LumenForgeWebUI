import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/homePage.tsx"),
  route("", "./routes/protectedRoutes.tsx", [
    route("app", "./routes/dashboardPage.tsx", [
      index("./routes/loginPage.tsx"),
      route("devices", "./routes/devicesPage.tsx"),
      route("device/:uuid", "./components/devices/deviceDetailpage.tsx"),
      route("categories", "./routes/categoriesPage.tsx"),
      route("maintenanceStatus", "./routes/maintenanceStatusPage.tsx"),
      route("vendors", "./routes/vendorsPage.tsx"),
    ])
  ]),

  /*
  

  route("*", "routes/notFound.tsx"),
    -*/
] satisfies RouteConfig;
