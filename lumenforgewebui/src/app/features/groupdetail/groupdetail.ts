import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, distinctUntilChanged, EMPTY, filter, finalize, forkJoin, map, Observable, of, startWith, switchMap } from 'rxjs';
import { AuthApiClient } from '../../core/api/auth/auth-api.client';
import { GroupView, UserView } from '../../core/api/auth/models/views';
import { Role } from '../../core/api/auth/models/dtos';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

interface GroupState {
  loading: boolean;
  group: GroupView | null;
  members: UserView[];
  roles: Role[];
  error: string | null;
}

@Component({
  selector: 'app-role-management-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatCheckboxModule, FormsModule],
  template: `
    <h2 mat-dialog-title>Manage Roles</h2>
    <mat-dialog-content>
      <div class="dialog-role-actions">
        <button mat-button type="button" (click)="selectAll()">Select All</button>
        <button mat-button type="button" (click)="deselectAll()">Deselect All</button>
      </div>
      <div class="dialog-role-grid">
        @for (role of roleEntries; track role.value) {
          <mat-checkbox [(ngModel)]="roleValues[role.value]">{{ role.name }}</mat-checkbox>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button [disabled]="saving" (click)="save()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-role-actions { display: flex; gap: 8px; margin-bottom: 12px; }
    .dialog-role-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 12px; }
  `]
})
export class RoleManagementDialogComponent implements OnInit {
  readonly roleEntries = Object.keys(Role)
    .filter(key => isNaN(Number(key)) && key !== 'None')
    .map(key => ({ name: key, value: Role[key as keyof typeof Role] as number }));

  roleValues: { [key: number]: boolean } = {};
  saving = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { groupGuid: string; currentRoles: Role[] },
    private dialogRef: MatDialogRef<RoleManagementDialogComponent>,
    private authClient: AuthApiClient
  ) {}

  ngOnInit() {
    this.roleEntries.forEach(r => {
      this.roleValues[r.value] = this.data.currentRoles.includes(r.value);
    });
  }

  get selectedRoles(): Role[] {
    return this.roleEntries.filter(r => this.roleValues[r.value]).map(r => r.value);
  }

  selectAll() { this.roleEntries.forEach(r => { this.roleValues[r.value] = true; }); }
  deselectAll() { this.roleEntries.forEach(r => { this.roleValues[r.value] = false; }); }

  save() {
    this.saving = true;
    this.authClient.assignGroupRoles(this.data.groupGuid, { roles: this.selectedRoles }).pipe(
      catchError(() => EMPTY),
      finalize(() => { this.saving = false; })
    ).subscribe(() => this.dialogRef.close(true));
  }
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

  constructor(
    private route: ActivatedRoute,
    private authClient: AuthApiClient,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const paramId$ = this.route.paramMap.pipe(
      map(params => params.get('groupGuid')),
      filter((id): id is string => !!id),
      distinctUntilChanged()
    );

    this.state$ = combineLatest([paramId$, this.refreshTrigger$]).pipe(
      switchMap(([id]) =>
        forkJoin({
          group: this.authClient.getGroup(id),
          members: this.authClient.getGroupUsers(id),
          roles: this.authClient.getGroupRoles(id)
        }).pipe(
          map(({ group, members, roles }) => ({ loading: false, group, members, roles, error: null })),
          catchError(() => of({ loading: false, group: null, members: [], roles: [], error: 'Failed to load group details.' })),
          startWith({ loading: true, group: null, members: [], roles: [], error: null })
        )
      )
    );
  }

  getRoleName(role: Role): string {
    return Role[role] ?? String(role);
  }

  openRolesDialog(groupGuid: string, currentRoles: Role[]) {
    const ref = this.dialog.open(RoleManagementDialogComponent, {
      width: '600px',
      data: { groupGuid, currentRoles }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.refreshTrigger$.next();
    });
  }
}
