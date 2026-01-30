import { Routes } from "@angular/router";

import { CategoriesPageComponent } from "./pages/categories-page.component";
import { DashboardPageComponent } from "./pages/dashboard-page.component";
import { DevicesPageComponent } from "./pages/devices-page.component";
import { LoginPageComponent } from "./pages/login-page.component";
import { MaintenanceStatusPageComponent } from "./pages/maintenance-status-page.component";
import { NotFoundPageComponent } from "./pages/not-found-page.component";
import { SettingsPageComponent } from "./pages/settings-page.component";
import { VendorsPageComponent } from "./pages/vendors-page.component";

export const appRoutes: Routes = [
  { path: "", component: DashboardPageComponent, pathMatch: "full" },
  { path: "devices", component: DevicesPageComponent },
  { path: "categories", component: CategoriesPageComponent },
  { path: "maintenanceStatus", component: MaintenanceStatusPageComponent },
  { path: "vendors", component: VendorsPageComponent },
  { path: "settings", component: SettingsPageComponent },
  { path: "login", component: LoginPageComponent },
  { path: "**", component: NotFoundPageComponent },
];
