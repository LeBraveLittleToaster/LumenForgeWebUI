import { Component } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";

@Component({
  standalone: true,
  selector: "app-maintenance-status-page",
  imports: [MatCardModule, MatIconModule, MatProgressBarModule],
  template: `
    <section class="page">
      <mat-card>
        <mat-card-header>
          <mat-icon aria-hidden="true">build_circle</mat-icon>
          <div>
            <mat-card-title>Maintenance Status</mat-card-title>
            <mat-card-subtitle>Track preventative and active repairs</mat-card-subtitle>
          </div>
        </mat-card-header>
        <mat-card-content>
          <div class="progress-block">
            <div class="progress-label">Preventative maintenance coverage</div>
            <mat-progress-bar color="primary" mode="determinate" value="78"></mat-progress-bar>
          </div>
          <div class="progress-block">
            <div class="progress-label">Active repair completion</div>
            <mat-progress-bar color="accent" mode="determinate" value="42"></mat-progress-bar>
          </div>
        </mat-card-content>
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

      .progress-block {
        margin-bottom: 16px;
      }

      .progress-label {
        margin-bottom: 8px;
        font-weight: 500;
      }

      mat-icon {
        color: #ef6c00;
      }
    `,
  ],
})
export class MaintenanceStatusPageComponent {}
