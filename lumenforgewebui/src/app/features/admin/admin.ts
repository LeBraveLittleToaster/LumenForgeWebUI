import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/api/auth/auth-service';
import { RouterLink, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Permissions } from '../../core/api/auth/models/dtos';

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

  get hasAuthSection() { return this.canViewUsers || this.canViewGroups; }
  get hasInventorySection() { return this.canViewCategories || this.canViewVendors; }

  logout() {
    this.auth.logout();
  }
}
