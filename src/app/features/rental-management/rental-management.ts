import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-rental-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container rental-management-page">
      <h1>Rental Management</h1>
      <p>Here will be rental management later</p>
    </div>
  `,
  styles: [`
    .rental-management-page {
      padding: 32px;
      max-width: 960px;
      margin: 0 auto;
    }

    .rental-management-page h1 {
      margin: 0 0 12px;
    }

    .rental-management-page p {
      margin: 0;
      color: var(--mat-sys-on-surface-variant);
    }
  `],
})
export class RentalManagement {}
