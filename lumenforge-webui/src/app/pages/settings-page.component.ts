import { Component } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";

@Component({
  standalone: true,
  selector: "app-settings-page",
  imports: [MatCardModule, MatIconModule, MatSlideToggleModule],
  template: `
    <section class="page">
      <mat-card>
        <mat-card-header>
          <mat-icon aria-hidden="true">settings</mat-icon>
          <div>
            <mat-card-title>Settings</mat-card-title>
            <mat-card-subtitle>Adjust workspace preferences</mat-card-subtitle>
          </div>
        </mat-card-header>
        <mat-card-content>
          <div class="toggle-row">
            <span>Enable maintenance notifications</span>
            <mat-slide-toggle color="primary" checked></mat-slide-toggle>
          </div>
          <div class="toggle-row">
            <span>Auto-assign new devices</span>
            <mat-slide-toggle color="primary"></mat-slide-toggle>
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

      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
      }

      mat-icon {
        color: #7e57c2;
      }
    `,
  ],
})
export class SettingsPageComponent {}
