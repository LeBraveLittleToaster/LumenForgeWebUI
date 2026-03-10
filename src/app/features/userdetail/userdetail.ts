import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, distinctUntilChanged, EMPTY, filter, finalize, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { AuthApiClient } from '../../core/api/auth/auth-api.client';
import { UserView, GroupView } from '../../core/api/auth/models/views';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { UserDetailGroupsDataSource } from './userdetail-groups.data-source';
import { Permissions } from '../../core/api/auth/models/dtos';
import { AssignToGroupDialogComponent } from './assign-to-group-dialog.component';
import { RemoveFromGroupDialogComponent } from './remove-from-group-dialog.component';

interface UserState {
  loading: boolean;
  user: UserView | null;
  groups: GroupView[] | null;
  error: string | null;
}

@Component({
  selector: 'app-userdetail',
  imports: [
    MatDividerModule, MatIconModule, MatProgressSpinnerModule, MatTableModule,
    MatButtonModule, CommonModule
  ],
  templateUrl: './userdetail.html',
  styleUrl: './userdetail.scss',
})
export class UserDetail implements OnInit {
  displayedColumns = ['guid', 'name', 'description', 'created_at', 'actions'];
  state$!: Observable<UserState>;
  groupsDataSource = new UserDetailGroupsDataSource();
  groupsCount$ = this.groupsDataSource.total$;
  removingGroupGuid: string | null = null;
  selectedPermission: string | null = null;
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
  ngOnInit() {
    const paramId$ = this.route.paramMap.pipe(
      map(params => params.get('userKcId')),
      filter((id): id is string => !!id),
      distinctUntilChanged()
    );

    this.state$ = combineLatest([paramId$, this.refreshTrigger$]).pipe(
      switchMap(([id]) =>
        this.authClient.getUser(id, true).pipe(
          tap((user) => this.groupsDataSource.setGroups(user.groups)),
          map((user) => {
            console.log("Loaded user and groups:", { user, groups: user.groups });
            return ({ loading: false, user, groups: user.groups, error: null })
          }),
          catchError(() => {
            this.groupsDataSource.setGroups(null);
            return of({
              loading: false,
              user: null,
              groups: null,
              error: "Failed to load user profile."
            });
          }),
          startWith({ loading: true, user: null, groups: null, error: null })
        )
      )
    );
  }

  openAssignDialog(userKcId: string) {
    const ref = this.dialog.open(AssignToGroupDialogComponent, {
      width: '500px',
      data: { userKcId }
    });
    ref.afterClosed().subscribe((assignedGroup: GroupView | undefined) => {
      if (!assignedGroup) return;
      this.groupsDataSource.upsertGroup(assignedGroup);
    });
  }

  confirmRemoveFromGroup(group: GroupView, userKcId: string) {
    const ref = this.dialog.open(RemoveFromGroupDialogComponent, {
      width: '420px',
      data: { groupName: group.name }
    });

    ref.afterClosed().pipe(
      filter((ok): ok is true => !!ok),
      tap(() => { queueMicrotask(() => { this.removingGroupGuid = group.guid; }); }),
      switchMap(() =>
        this.authClient.removeUserFromGroup(group.guid, userKcId).pipe(
          catchError(() => EMPTY),
          finalize(() => { queueMicrotask(() => { this.removingGroupGuid = null; }); })
        )
      )
    ).subscribe(() => {
      queueMicrotask(() => { this.groupsDataSource.removeGroupByGuid(group.guid); });
    });
  }
}