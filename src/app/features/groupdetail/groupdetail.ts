import { Component, OnInit, Inject } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, distinctUntilChanged, filter, forkJoin, map, Observable, of, startWith, switchMap } from 'rxjs';

import { AuthApiClient, GroupView, UserView, Permissions } from '@lumenforge/api-client';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { RoleManagementDialogComponent } from './groupdetail-role-management-dialog';
import { PermissionOverviewComponent } from '../../shared/permission-overview/permission-overview';

interface GroupState {
  loading: boolean;
  group: GroupView | null;
  members: UserView[];
  error: string | null;
}

@Component({
  selector: 'app-groupdetail',
  imports: [CommonModule, MatDividerModule, MatIconModule, MatProgressSpinnerModule, MatTableModule, MatButtonModule, PermissionOverviewComponent],
  templateUrl: './groupdetail.html',
  styleUrl: './groupdetail.css',
})
export class Groupdetail implements OnInit {
  memberColumns = ['username', 'email', 'firstName', 'lastName'];
  state$!: Observable<GroupState>;
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  constructor(
    private route: ActivatedRoute,
    @Inject(AuthApiClient) private authClient: AuthApiClient,
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
          map(({ group, members }) => { 
            console.log('Fetched group details:', { group, members });
            console.log('Group permissions:', group.permissions);
            return({ loading: false, group, members: Array.isArray(members) ? members : [], error: null } as GroupState); 
          }),
          catchError(() => of({ loading: false, group: null, members: [], error: 'Failed to load group details.' } as GroupState)),
          startWith({ loading: true, group: null, members: [], error: null } as GroupState)
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
