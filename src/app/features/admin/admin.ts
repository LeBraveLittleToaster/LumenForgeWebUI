import { Component, inject } from '@angular/core';
import { AuthService } from '@lumenforge/api-client';
import { RouterLink, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Permissions } from '@lumenforge/api-client';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, RouterModule, MatCardModule, MatIconModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {
  private auth = inject(AuthService);

  get canViewUsers() { return this.auth.hasPermission(Permissions.UserRead); }
  get canViewGroups() { return this.auth.hasPermission(Permissions.GroupRead); }
  get canViewCategories() { return this.auth.hasPermission(Permissions.CategoryRead); }
  get canViewVendors() { return this.auth.hasPermission(Permissions.VendorRead); }
  get canViewInventory() { return this.auth.hasPermission(Permissions.DeviceRead); }
  get canViewMaintenance() { return this.auth.hasPermission(Permissions.MaintenanceRead); }
  get canViewRental() { return this.auth.hasPermission(Permissions.RentalRead); }

  get hasAuthSection() { return this.canViewUsers || this.canViewGroups; }
  get hasInventorySection() { return this.canViewCategories || this.canViewVendors || this.canViewInventory || this.canViewMaintenance || this.canViewRental; }

  logout() {
    this.auth.logout();
  }
}
