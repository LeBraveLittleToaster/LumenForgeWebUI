import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Permissions } from '@lumenforge/api-client';

interface PermissionCluster {
  name: string;
  permissions: string[];
}

@Component({
  selector: 'app-permission-overview',
  imports: [CommonModule],
  templateUrl: './permission-overview.html',
  styleUrl: './permission-overview.css',
})
export class PermissionOverviewComponent {
  private readonly permissionClusters = new Map<number, string>([
    [10, 'Device'],
    [20, 'Vendor'],
    [30, 'Category'],
    [40, 'Stock'],
    [50, 'Maintenance'],
    [60, 'Rental'],
    [70, 'Rental Status'],
    [80, 'Invoice'],
    [90, 'Invoice Status'],
    [100, 'Role'],
    [200, 'Group'],
    [300, 'User'],
  ]);

  assignedPermissions = input<string[]>([]);
  selectedPermission = input<string | null>(null);
  selectable = input<boolean>(false);
  selectedPermissionChange = output<string | null>();

  private readonly assignedPermissionSet = computed(() => new Set(this.assignedPermissions()));

  private readonly allPermissions = computed(() =>
    Object.keys(Permissions)
      .filter(key => Number.isNaN(Number(key)))
      .sort((a, b) => Permissions[a as keyof typeof Permissions] - Permissions[b as keyof typeof Permissions])
  );

  readonly clusteredPermissions = computed<PermissionCluster[]>(() => {
    const clusters = new Map<string, string[]>();

    for (const permission of this.allPermissions()) {
      const value = Permissions[permission as keyof typeof Permissions];
      if (typeof value !== 'number') {
        continue;
      }

      const cluster = Math.floor(value / 10) * 10;
      const clusterName = this.permissionClusters.get(cluster) || `Group ${cluster}`;
      if (!clusters.has(clusterName)) {
        clusters.set(clusterName, []);
      }
      clusters.get(clusterName)!.push(permission);
    }

    return Array.from(clusters.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, permissions]) => ({ name, permissions }));
  });

  isPermissionAssigned(permission: string): boolean {
    return this.assignedPermissionSet().has(permission);
  }

  onPermissionClick(permission: string): void {
    if (!this.selectable() || !this.isPermissionAssigned(permission)) {
      return;
    }

    const next = this.selectedPermission() === permission ? null : permission;
    this.selectedPermissionChange.emit(next);
  }
}
