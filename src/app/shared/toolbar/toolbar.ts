import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/api/auth/auth-service';
import { signal } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';
import { Permissions } from '../../core/api/auth/models/dtos';

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
    { label: 'Maintenance', route: '/maintenance' },
    { label: 'Rental', route: '/rental' },
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
      this.navItems.set(this.adminNavItems.filter(item =>
        !item.requiredPermission || this.auth.hasPermission(item.requiredPermission)
      ));
    } else {
      this.navItems.set(this.mainNavItems.filter(item => {
        if (item.requiredPermission) {
          return this.auth.hasPermission(item.requiredPermission);
        }

        if (item.requiredAnyPermissions?.length) {
          return this.auth.hasAnyPermission(...item.requiredAnyPermissions);
        }

        return true;
      }));
    }
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
