import { Component } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";

@Component({
  standalone: true,
  selector: "app-vendors-page",
  imports: [MatCardModule, MatIconModule, MatTableModule],
  template: `
    <section class="page">
      <mat-card>
        <mat-card-header>
          <mat-icon aria-hidden="true">storefront</mat-icon>
          <div>
            <mat-card-title>Vendors</mat-card-title>
            <mat-card-subtitle>Preferred suppliers and service partners</mat-card-subtitle>
          </div>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="vendors" class="vendor-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Vendor</th>
              <td mat-cell *matCellDef="let vendor">{{ vendor.name }}</td>
            </ng-container>
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let vendor">{{ vendor.category }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let vendor">{{ vendor.status }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
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

      .vendor-table {
        width: 100%;
      }

      mat-icon {
        color: #26a69a;
      }
    `,
  ],
})
export class VendorsPageComponent {
  displayedColumns = ["name", "category", "status"];
  vendors = [
    { name: "Vertex Supply Co.", category: "Parts", status: "Preferred" },
    { name: "Axis Service Group", category: "Maintenance", status: "Active" },
    { name: "Nova Logistics", category: "Logistics", status: "Onboarding" },
  ];
}
