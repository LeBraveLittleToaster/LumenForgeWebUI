import { Component } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";

@Component({
  standalone: true,
  selector: "app-devices-page",
  imports: [MatCardModule, MatChipsModule, MatIconModule],
  template: `
    <section class="page">
      <mat-card>
        <mat-card-header>
          <mat-icon aria-hidden="true">inventory_2</mat-icon>
          <div>
            <mat-card-title>Devices</mat-card-title>
            <mat-card-subtitle>Track active hardware and assignments</mat-card-subtitle>
          </div>
        </mat-card-header>
        <mat-card-content>
          <div class="chip-row">
            <mat-chip color="primary" selected>124 Active</mat-chip>
            <mat-chip color="accent" selected>12 Pending</mat-chip>
            <mat-chip color="warn" selected>5 Offline</mat-chip>
          </div>
          <p>
            Review device inventory, update assignment data, and schedule maintenance windows directly from this
            panel.
          </p>
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

      .chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;
      }

      mat-icon {
        color: #546e7a;
      }
    `,
  ],
})
export class DevicesPageComponent {}
