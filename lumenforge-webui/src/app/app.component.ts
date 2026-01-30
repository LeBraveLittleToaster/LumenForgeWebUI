import { Component } from "@angular/core";
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { NgIf } from "@angular/common";
import { filter } from "rxjs/operators";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  standalone: true,
  selector: "app-root",
  imports: [
    NgIf,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  mini = false;
  devicesExpanded = false;
  currentPath = "/";

  constructor(private router: Router) {
    this.syncFromUrl(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => this.syncFromUrl((event as NavigationEnd).urlAfterRedirects));
  }

  toggleMini(): void {
    this.mini = !this.mini;
    this.devicesExpanded = !this.mini && this.isDevicesActive(this.currentPath);
  }

  onLogout(): void {
    console.log("logout");
  }

  private syncFromUrl(url: string): void {
    this.currentPath = url;
    this.devicesExpanded = !this.mini && this.isDevicesActive(url);
  }

  private isDevicesActive(url: string): boolean {
    return ["/devices", "/categories", "/maintenanceStatus", "/vendors"].some((path) =>
      url.startsWith(path),
    );
  }
}
