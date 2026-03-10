import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  CreateMaintenanceStatusDto,
  MaintenanceApiClient,
  MaintenanceStatusView,
  UpdateMaintenanceStatusDto,
} from '@lumenforge/api-client';
import { catchError, EMPTY, finalize } from 'rxjs';

export interface MaintenanceStatusDialogData {
  mode: 'create' | 'edit';
  status?: MaintenanceStatusView;
}

@Component({
  selector: 'app-maintenance-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Create Status' : 'Edit Status' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="saving">Cancel</button>
      <button mat-flat-button (click)="save()" [disabled]="saving || form.invalid">
        {{ saving ? 'Saving...' : (data.mode === 'create' ? 'Create' : 'Save') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 12px; margin-top: 4px; }
    .full-width { width: 100%; }
  `],
})
export class MaintenanceStatusDialogComponent {
  private readonly snackBar = inject(MatSnackBar);

  saving = false;
  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    @Inject(MaintenanceApiClient) private readonly maintenanceApiClient: MaintenanceApiClient,
    private readonly dialogRef: MatDialogRef<MaintenanceStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: MaintenanceStatusDialogData
  ) {
    this.form = this.fb.group({
      name: [this.data.status?.name ?? '', [Validators.required, Validators.maxLength(128)]],
      description: [this.data.status?.description ?? '', [Validators.maxLength(2000)]],
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    if (this.data.mode === 'create') {
      const dto: CreateMaintenanceStatusDto = {
        name: this.form.controls.name.value || '',
        description: this.form.controls.description.value || undefined,
      };

      this.maintenanceApiClient.createStatus(dto).pipe(
        catchError(() => {
          this.snackBar.open('Failed to create status.', 'Close', { duration: 4000 });
          return EMPTY;
        }),
        finalize(() => this.saving = false)
      ).subscribe(status => {
        this.snackBar.open('Status created.', 'Close', { duration: 3000 });
        this.dialogRef.close(status);
      });
      return;
    }

    if (!this.data.status) {
      this.saving = false;
      return;
    }

    const dto: UpdateMaintenanceStatusDto = {
      name: this.form.controls.name.value || undefined,
      description: this.form.controls.description.value || undefined,
    };

    this.maintenanceApiClient.updateStatus(this.data.status.uuid, dto).pipe(
      catchError(() => {
        this.snackBar.open('Failed to update status.', 'Close', { duration: 4000 });
        return EMPTY;
      }),
      finalize(() => this.saving = false)
    ).subscribe(status => {
      this.snackBar.open('Status updated.', 'Close', { duration: 3000 });
      this.dialogRef.close(status);
    });
  }
}
