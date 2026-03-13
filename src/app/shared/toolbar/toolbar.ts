import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { AuthService, Permissions } from '@lumenforge/api-client';
import { signal } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';

interface NavItem {
  label: string;
  route: string;
  requiredPermission?: Permissions;
  requiredAnyPermissions?: Permissions[];
}

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatTooltipModule,
    RouterModule
  ]
})
export class Toolbar implements OnInit, OnDestroy {

  private router = inject(Router);
  public auth = inject(AuthService);
  public theme = inject(ThemeService);

  navItems = signal<NavItem[]>([]);
  isMobileMenuOpen = signal(false);

  mainNavItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    {
      label: 'Inventory',
      route: '/inventory',
      requiredAnyPermissions: [
        Permissions.DeviceRead,
        Permissions.DeviceCreate,
        Permissions.DeviceUpdate,
        Permissions.DeviceDelete
      ]
    },
    {
      label: 'Maintenance',
      route: '/maintenance',
      requiredAnyPermissions: [
        Permissions.MaintenanceRead,
        Permissions.MaintenanceCreate,
        Permissions.MaintenanceUpdate,
        Permissions.MaintenanceDelete,
      ]
    },
    { label: 'Rental', route: '/rental/management' },
    { label: 'Billing', route: '/billing' },
    { label: 'Reports', route: '/reports' }
  ];

  adminNavItems: NavItem[] = [
    { label: 'Users', route: '/admin/users', requiredPermission: Permissions.UserRead },
    { label: 'Groups', route: '/admin/groups', requiredPermission: Permissions.GroupRead },
    { label: 'Categories', route: '/admin/categories', requiredPermission: Permissions.CategoryRead },
    { label: 'Vendors', route: '/admin/vendor', requiredPermission: Permissions.VendorRead }
  ];

  ngOnInit() {
    this.updateNavItems();
    this.router.events.subscribe(() => {
      this.updateNavItems();
    });
  }

  ngOnDestroy() {
    
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event) {
    if (window.innerWidth >= 960) {
      this.closeMobileMenu();
    }
  }

  private updateNavItems() {
    const currentUrl = this.router.url;
    if (currentUrl.startsWith('/admin')) {
      this.navItems.set(this.adminNavItems);
    } else {
      this.navItems.set(this.mainNavItems);
    }
  }

  canAccess(item: NavItem): boolean {
    if (item.requiredPermission !== undefined) {
      return this.auth.hasPermission(item.requiredPermission);
    }

    if (item.requiredAnyPermissions?.length) {
      return this.auth.hasAnyPermission(...item.requiredAnyPermissions);
    }

    return true;
  }

  getPermissionHint(item: NavItem): string {
    if (this.canAccess(item)) {
      return '';
    }

    if (item.requiredPermission !== undefined) {
      return `Requires permission: ${this.formatPermissionName(item.requiredPermission)}`;
    }

    if (item.requiredAnyPermissions?.length) {
      const names = item.requiredAnyPermissions.map(p => this.formatPermissionName(p)).join(', ');
      return `Requires one of: ${names}`;
    }

    return 'Missing required permission.';
  }

  onNavItemClick(event: Event, item: NavItem): void {
    if (!this.canAccess(item)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.router.navigateByUrl(item.route);
    this.closeMobileMenu();
  }

  private formatPermissionName(permission: Permissions): string {
    const raw = Permissions[permission] ?? 'UnknownPermission';
    return raw.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(state => !state);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  get isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }
}
