import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { AuthService, AuthApiClient, UserView, GroupView, Permissions } from '@lumenforge/api-client';
import { catchError, map, Observable, of, startWith } from 'rxjs';

interface ProfileState {
  loading: boolean;
  user: UserView | null;
  error: string | null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTableModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  state$!: Observable<ProfileState>;
  displayedColumns = ['guid', 'name', 'description', 'created_at'];
  selectedPermission: string | null = null;

  private readonly permissionClusters = new Map<number, string>([
    [10, 'Device'],
    [20, 'Vendor'],
    [30, 'Category'],
    [40, 'Stock'],
    [50, 'Backlog'],
    [60, 'Order'],
    [70, 'Order Status'],
    [80, 'Invoice'],
    [90, 'Invoice Status'],
    [100, 'Role'],
    [200, 'Group'],
    [300, 'User'],
  ]);

  constructor(
    @Inject(AuthService) public auth: AuthService,
    @Inject(AuthApiClient) private authClient: AuthApiClient,
    private location: Location
  ) {}

  ngOnInit() {
    const userId = this.auth.user()?.id;
    
    if (!userId) {
      this.state$ = of({
        loading: false,
        user: null,
        error: 'No user ID found. Please log in again.'
      });
      return;
    }

    this.state$ = this.authClient.getUser(userId, true).pipe(
      map((user) => {
        console.log(user);
        return ({
        loading: false,
        user,
        error: null
      })}),
      catchError(() => of({
        loading: false,
        user: null,
        error: 'Failed to load profile data.'
      })),
      startWith({ loading: true, user: null, error: null })
    );
  }

  getAllPermissions(user: UserView): string[] {
    const permissions = new Set<string>();
    for (const group of user.groups ?? []) {
      for (const permission of group.permissions ?? []) {
        permissions.add(permission);
      }
    }
    return Array.from(permissions).sort();
  }

  getPermissionsByCluster(user: UserView): Map<string, string[]> {
    const permissions = this.getAllPermissions(user);
    const clustered = new Map<string, string[]>();

    for (const perm of permissions) {
      const val = (Permissions as any)[perm];
      if (typeof val === 'number') {
        const cluster = Math.floor(val / 10) * 10;
        const clusterName = this.permissionClusters.get(cluster) || `Group ${cluster}`;
        if (!clustered.has(clusterName)) {
          clustered.set(clusterName, []);
        }
        clustered.get(clusterName)!.push(perm);
      }
    }

    return new Map([...clustered.entries()].sort());
  }

  getGroupsProvidingPermission(user: UserView, permission: string): GroupView[] {
    return (user.groups ?? []).filter(group =>
      (group.permissions ?? []).includes(permission)
    );
  }

  togglePermissionSelection(permission: string): void {
    this.selectedPermission = this.selectedPermission === permission ? null : permission;
  }

  isGroupHighlighted(group: GroupView): boolean {
    return this.selectedPermission !== null && !!group.permissions?.includes(this.selectedPermission);
  }

  goBack() {
    this.location.back();
  }
}
