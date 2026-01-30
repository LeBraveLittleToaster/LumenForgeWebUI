import { Component } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";

@Component({
  standalone: true,
  selector: "app-categories-page",
  imports: [MatCardModule, MatIconModule, MatListModule],
  template: `
    <section class="page">
      <mat-card>
        <mat-card-header>
          <mat-icon aria-hidden="true">category</mat-icon>
          <div>
            <mat-card-title>Categories</mat-card-title>
            <mat-card-subtitle>Organize devices by type and capability</mat-card-subtitle>
          </div>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item>
              <mat-icon matListItemIcon>print</mat-icon>
              <div matListItemTitle>Laser Cutters</div>
              <div matListItemLine>38 devices</div>
            </mat-list-item>
            <mat-list-item>
              <mat-icon matListItemIcon>memory</mat-icon>
              <div matListItemTitle>CNC Mills</div>
              <div matListItemLine>24 devices</div>
            </mat-list-item>
            <mat-list-item>
              <mat-icon matListItemIcon>hardware</mat-icon>
              <div matListItemTitle>Assembly Stations</div>
              <div matListItemLine>62 devices</div>
            </mat-list-item>
          </mat-list>
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

      mat-icon {
        color: #5c6bc0;
      }
    `,
  ],
})
export class CategoriesPageComponent {}
