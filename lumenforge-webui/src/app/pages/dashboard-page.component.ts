import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";

@Component({
  standalone: true,
  selector: "app-dashboard-page",
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <section class="page">
      <mat-card>
        <mat-card-header>
          <mat-icon aria-hidden="true">space_dashboard</mat-icon>
          <div>
            <mat-card-title>Dashboard Overview</mat-card-title>
            <mat-card-subtitle>Quick status and system snapshots</mat-card-subtitle>
          </div>
        </mat-card-header>
        <mat-card-content>
          <p>
            Monitor devices, maintenance queues, and vendor activity from a single place. Use the navigation
            panel to jump between each workspace.
          </p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-flat-button color="primary">Review alerts</button>
          <button mat-button>Generate report</button>
        </mat-card-actions>
      </mat-card>
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 16px;
      }

      mat-card-header {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      mat-icon {
        color: #3f51b5;
      }
    `,
  ],
})
export class DashboardPageComponent {}
