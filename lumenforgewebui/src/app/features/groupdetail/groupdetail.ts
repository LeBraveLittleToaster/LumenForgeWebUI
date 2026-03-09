import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, distinctUntilChanged, filter, forkJoin, map, Observable, of, startWith, switchMap } from 'rxjs';

import { AuthApiClient } from '../../core/api/auth/auth-api.client';
import { GroupView, UserView } from '../../core/api/auth/models/views';
import { Permissions } from '../../core/api/auth/models/dtos';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { RoleManagementDialogComponent } from './groupdetail-role-management-dialog';

interface GroupState {
  loading: boolean;
  group: GroupView | null;
  members: UserView[];
  error: string | null;
}

@Component({
  selector: 'app-groupdetail',
  imports: [CommonModule, MatDividerModule, MatIconModule, MatProgressSpinnerModule, MatTableModule, MatButtonModule],
  templateUrl: './groupdetail.html',
  styleUrl: './groupdetail.css',
})
export class Groupdetail implements OnInit {
  memberColumns = ['username', 'email', 'firstName', 'lastName'];
  state$!: Observable<GroupState>;
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

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
    private route: ActivatedRoute,
    private authClient: AuthApiClient,
    private dialog: MatDialog,
    private location: Location
  ) { }

  goBack() { this.location.back(); }

  ngOnInit() {
    const paramId$ = this.route.paramMap.pipe(
      map(params => params.get('groupGuid')),
      filter((id): id is string => !!id),
      distinctUntilChanged()
    );

    this.state$ = combineLatest([paramId$, this.refreshTrigger$]).pipe(
      switchMap(([id]) =>
        forkJoin({
          group: this.authClient.getGroup(id, 'Permissions'),
          members: this.authClient.getGroupUsers(id),
        }).pipe(
          map(({ group, members }) => ({ loading: false, group, members: Array.isArray(members) ? members : [], error: null } as GroupState)),
          catchError(() => of({ loading: false, group: null, members: [], error: 'Failed to load group details.' } as GroupState)),
          startWith({ loading: true, group: null, members: [], error: null } as GroupState)
        )
      )
    );
  }

  getPermissionsByCluster(permissions: string[]): Map<string, string[]> {
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

  openRolesDialog(groupGuid: string, currentPermissions: string[]) {
    const currentRoles = currentPermissions
      .map(p => (Permissions as any)[p] as number)
      .filter((v): v is Permissions => typeof v === 'number');
    const ref = this.dialog.open(RoleManagementDialogComponent, {
      width: '600px',
      data: { groupGuid, currentRoles }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.refreshTrigger$.next();
    });
  }
}
