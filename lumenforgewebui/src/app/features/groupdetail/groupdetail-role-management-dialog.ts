import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EMPTY, catchError, finalize } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

import { AuthApiClient } from '../../core/api/auth/auth-api.client';
import { Permissions } from '../../core/api/auth/models/dtos';

@Component({
  selector: 'app-role-management-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatDividerModule, MatCheckboxModule, FormsModule],
  template: `
    <h2 mat-dialog-title>Manage Roles</h2>
    <mat-dialog-content>
      <div class="dialog-role-actions">
        <button mat-button type="button" (click)="selectAll()">Select All</button>
        <button mat-button type="button" (click)="deselectAll()">Deselect All</button>
      </div>
      <div class="dialog-role-grid">
        @for (role of roleEntries; track role.value) {
          @if($index % 4 == 0) {
            <mat-divider class="full-row-item"></mat-divider>
          }
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
    .dialog-role-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 12px; max-height: 400px; overflow-y: auto; overflow-x: hidden; }
    .full-row-item { grid-column-start: 1; grid-column-end: 3; margin-top: 8px; margin-bottom: 8px; }
  `]
})
export class RoleManagementDialogComponent implements OnInit {
  readonly roleEntries = Object.keys(Permissions)
    .filter(key => isNaN(Number(key)) && key !== 'None')
    .map(key => ({ name: key, value: Permissions[key as keyof typeof Permissions] as number }));

  roleValues: { [key: number]: boolean } = {};
  saving = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { groupGuid: string; currentRoles: Permissions[] },
    private dialogRef: MatDialogRef<RoleManagementDialogComponent>,
    private authClient: AuthApiClient
  ) {}

  ngOnInit() {
    this.roleEntries.forEach(r => {
      this.roleValues[r.value] = this.data.currentRoles.includes(r.value);
    });
  }

  get selectedRoles(): Permissions[] {
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
