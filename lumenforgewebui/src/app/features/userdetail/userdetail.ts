import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, debounceTime, distinctUntilChanged, EMPTY, filter, finalize, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { AuthApiClient } from '../../core/api/auth/auth-api.client';
import { UserView, GroupView } from '../../core/api/auth/models/views';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UserDetailGroupsDataSource } from './userdetail-groups.data-source';
import { Permissions } from '../../core/api/auth/models/dtos';

interface UserState {
  loading: boolean;
  user: UserView | null;
  groups: GroupView[] | null;
  error: string | null;
}

@Component({
  selector: 'app-assign-to-group-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatListModule, MatProgressSpinnerModule, ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>Assign to Group</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search groups</mat-label>
        <input matInput [formControl]="searchCtrl" placeholder="Type to filter...">
      </mat-form-field>
      @if (loading) {
        <div class="dialog-spinner">
          <mat-progress-spinner diameter="32" mode="indeterminate"></mat-progress-spinner>
        </div>
      } @else if (groups.length === 0) {
        <p class="dialog-empty">No groups found.</p>
      } @else {
        <mat-selection-list [multiple]="false" (selectionChange)="onSelectionChange($event)">
          @for (g of groups; track g.guid) {
            <mat-list-option [value]="g">
              <span matListItemTitle>{{ g.name }}</span>
              <span matListItemLine class="group-desc">{{ g.description }}</span>
            </mat-list-option>
          }
        </mat-selection-list>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button [disabled]="!selectedGroup" (click)="assign()">Assign</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .search-field { width: 100%; margin-bottom: 8px; }
    .dialog-spinner { display: flex; justify-content: center; padding: 16px; }
    .dialog-empty { text-align: center; color: var(--mat-sys-on-surface-variant); padding: 16px; margin: 0; }
    mat-selection-list { max-height: 300px; overflow-y: auto; display: block; }
    .group-desc { font-size: 0.8rem; color: var(--mat-sys-on-surface-variant); }
  `]
})
export class AssignToGroupDialogComponent implements OnInit {
  searchCtrl = new FormControl('');
  groups: GroupView[] = [];
  selectedGroup: GroupView | null = null;
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { userKcId: string },
    private dialogRef: MatDialogRef<AssignToGroupDialogComponent>,
    private authClient: AuthApiClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadGroups('');
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(val => this.loadGroups(val ?? ''));
  }

  private loadGroups(search: string) {
    this.loading = true;
    this.authClient.listGroups({ search }).pipe(
      catchError(() => of({ list: [], total: 0 })),
      tap(result => {
        this.groups = result.list;
        this.selectedGroup = null;
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe();
  }

  onSelectionChange(event: MatSelectionListChange) {
    this.selectedGroup = event.options[0]?.value ?? null;
  }

  assign() {
    if (!this.selectedGroup) return;
    this.authClient.assignUserToGroup(this.selectedGroup.guid, { userKcId: this.data.userKcId }).pipe(
      catchError(() => EMPTY)
    ).subscribe(() => this.dialogRef.close(true));
  }
}

@Component({
  selector: 'app-remove-from-group-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Remove from Group</h2>
    <mat-dialog-content>
      <p>Remove user from group "{{ data.groupName }}"?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>No</button>
      <button mat-flat-button color="warn" (click)="confirm()">Yes, Remove</button>
    </mat-dialog-actions>
  `,
})
export class RemoveFromGroupDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { groupName: string },
    private dialogRef: MatDialogRef<RemoveFromGroupDialogComponent>
  ) { }

  confirm() {
    this.dialogRef.close(true);
  }
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
    ref.afterClosed().subscribe(ok => {
      if (ok) this.refreshTrigger$.next();
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