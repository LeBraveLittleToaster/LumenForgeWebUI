import { Component, OnInit, Inject } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, distinctUntilChanged, filter, map, Observable, of, startWith, switchMap } from 'rxjs';

import { AuthApiClient, GroupView, Permissions } from '@lumenforge/api-client';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { RoleManagementDialogComponent } from './groupdetail-role-management-dialog';
import { PermissionOverviewComponent } from '../../shared/permission-overview/permission-overview';
import { DataTableComponent, ColumnDef } from '../../shared/data-table/data-table';
import { GroupdetailMembersDataSource, GroupMemberDataItem } from './groupdetail-members.data-source';

interface GroupState {
  loading: boolean;
  group: GroupView | null;
  error: string | null;
}

@Component({
  selector: 'app-groupdetail',
  imports: [CommonModule, MatDividerModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule, PermissionOverviewComponent, DataTableComponent],
  templateUrl: './groupdetail.html',
  styleUrl: './groupdetail.css',
})
export class Groupdetail implements OnInit {
  memberColumns: ColumnDef<GroupMemberDataItem>[] = [
    { key: 'username', header: 'Username', cell: r => r.user.username || '---' },
    { key: 'email', header: 'Email', cell: r => r.user.email || '---' },
    { key: 'firstName', header: 'First Name', cell: r => r.user.firstName || '---' },
    { key: 'lastName', header: 'Last Name', cell: r => r.user.lastName || '---' },
    { key: 'userKcId', header: 'User KC ID', cell: r => r.user.user_kc_id || '---' },
  ];

  state$!: Observable<GroupState>;
  membersDataSource?: GroupdetailMembersDataSource;
  private membersFilter = '';
  private membersGroupGuid: string | null = null;
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  constructor(
    private route: ActivatedRoute,
    @Inject(AuthApiClient) private authClient: AuthApiClient,
    private dialog: MatDialog,
    private location: Location
  ) { }

  goBack() { this.location.back(); }

  onMembersPage(event: PageEvent): void {
    this.membersDataSource?.loadMembers(this.membersFilter, 'asc', event.pageIndex, event.pageSize);
  }

  private ensureMembersDataSource(groupGuid: string): void {
    if (!this.membersDataSource || this.membersGroupGuid !== groupGuid) {
      this.membersDataSource = new GroupdetailMembersDataSource(this.authClient, groupGuid);
      this.membersGroupGuid = groupGuid;
    }
  }

  ngOnInit() {
    const paramId$ = this.route.paramMap.pipe(
      map(params => params.get('groupGuid')),
      filter((id): id is string => !!id),
      distinctUntilChanged()
    );

    this.state$ = combineLatest([paramId$, this.refreshTrigger$]).pipe(
      switchMap(([id]) =>
        this.authClient.getGroup(id, 'Permissions').pipe(
          map((group) => {
            this.ensureMembersDataSource(group.guid);
            this.membersDataSource?.loadMembers(this.membersFilter, 'asc', 0, 10);
            return ({ loading: false, group, error: null } as GroupState);
          }),
          catchError(() => of({ loading: false, group: null, error: 'Failed to load group details.' } as GroupState)),
          startWith({ loading: true, group: null, error: null } as GroupState)
        )
      )
    );
  }

  getAssignedPermissions(group: GroupView): string[] {
    return Array.from(new Set(group.permissions ?? [])).sort();
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
