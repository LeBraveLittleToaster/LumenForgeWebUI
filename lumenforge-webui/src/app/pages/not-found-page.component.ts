import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";

@Component({
  standalone: true,
  selector: "app-not-found-page",
  imports: [MatButtonModule, MatCardModule, MatIconModule, RouterLink],
  template: `
    <section class="page">
      <mat-card>
        <mat-card-header>
          <mat-icon aria-hidden="true">search_off</mat-icon>
          <div>
            <mat-card-title>Page not found</mat-card-title>
            <mat-card-subtitle>The page you requested could not be located.</mat-card-subtitle>
          </div>
        </mat-card-header>
        <mat-card-actions>
          <a mat-flat-button color="primary" routerLink="/">Return to dashboard</a>
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
        color: #ef5350;
      }
    `,
  ],
})
export class NotFoundPageComponent {}
