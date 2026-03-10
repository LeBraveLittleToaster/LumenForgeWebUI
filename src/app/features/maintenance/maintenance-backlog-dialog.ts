import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  CreateMaintenanceBacklogDto,
  MaintenanceApiClient,
  MaintenanceBacklogView,
  MaintenanceStatusView,
  UpdateMaintenanceBacklogDto,
} from '@lumenforge/api-client';
import { catchError, EMPTY, finalize, of } from 'rxjs';

export interface MaintenanceBacklogDialogData {
  mode: 'create' | 'edit';
  backlog?: MaintenanceBacklogView;
}

@Component({
  selector: 'app-maintenance-backlog-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Create Backlog Entry' : 'Edit Backlog Entry' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Status</mat-label>
          <mat-select formControlName="statusUuid">
            @for (status of statuses; track status.uuid) {
              <mat-option [value]="status.uuid">{{ status.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Issue Summary</mat-label>
          <input matInput formControlName="issueSummary" placeholder="Short issue summary">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Issue Description</mat-label>
          <textarea matInput rows="4" formControlName="issueDescription" placeholder="Optional details"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Quantity Affected</mat-label>
          <input matInput type="number" min="0.001" step="0.001" formControlName="quantityAffected">
        </mat-form-field>

        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Device UUID</mat-label>
          <input matInput formControlName="deviceUuid" placeholder="Optional device link">
        </mat-form-field>

        <mat-form-field appearance="outline" class="half-width">
          <mat-label>Rental Item UUID</mat-label>
          <input matInput formControlName="rentalItemUuid" placeholder="Optional rental item link">
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
    .dialog-form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 4px; }
    .full-width { grid-column: 1 / -1; }
    .half-width { grid-column: span 1; }
    @media (max-width: 760px) { .dialog-form { grid-template-columns: 1fr; } }
  `],
})
export class MaintenanceBacklogDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  statuses: MaintenanceStatusView[] = [];
  saving = false;

  readonly form = this.fb.group({
    statusUuid: ['', Validators.required],
    issueSummary: ['', [Validators.required, Validators.maxLength(2000)]],
    issueDescription: [''],
    quantityAffected: [1, [Validators.required, Validators.min(0.001)]],
    deviceUuid: [''],
    rentalItemUuid: [''],
  });

  constructor(
    @Inject(MaintenanceApiClient) private readonly maintenanceApiClient: MaintenanceApiClient,
    private readonly dialogRef: MatDialogRef<MaintenanceBacklogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: MaintenanceBacklogDialogData
  ) {}

  ngOnInit(): void {
    this.maintenanceApiClient.listStatuses({ limit: 200, offset: 0 }).pipe(
      catchError(() => of([] as MaintenanceStatusView[]))
    ).subscribe(statuses => {
      this.statuses = statuses;
      this.prefillForm();
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    if (this.data.mode === 'create') {
      const dto: CreateMaintenanceBacklogDto = {
        statusUuid: this.form.controls.statusUuid.value || '',
        issueSummary: this.form.controls.issueSummary.value || '',
        issueDescription: this.form.controls.issueDescription.value || undefined,
        quantityAffected: Number(this.form.controls.quantityAffected.value || 1),
        deviceUuid: this.form.controls.deviceUuid.value || undefined,
        rentalItemUuid: this.form.controls.rentalItemUuid.value || undefined,
      };

      this.maintenanceApiClient.createBacklog(dto).pipe(
        catchError(() => {
          this.snackBar.open('Failed to create backlog entry.', 'Close', { duration: 4000 });
          return EMPTY;
        }),
        finalize(() => this.saving = false)
      ).subscribe(backlog => {
        this.snackBar.open('Backlog entry created.', 'Close', { duration: 3000 });
        this.dialogRef.close(backlog);
      });
      return;
    }

    if (!this.data.backlog) {
      this.saving = false;
      return;
    }

    const dto: UpdateMaintenanceBacklogDto = {
      statusUuid: this.form.controls.statusUuid.value || undefined,
      issueSummary: this.form.controls.issueSummary.value || undefined,
      issueDescription: this.form.controls.issueDescription.value || undefined,
      quantityAffected: Number(this.form.controls.quantityAffected.value || 1),
    };

    this.maintenanceApiClient.updateBacklog(this.data.backlog.uuid, dto).pipe(
      catchError(() => {
        this.snackBar.open('Failed to update backlog entry.', 'Close', { duration: 4000 });
        return EMPTY;
      }),
      finalize(() => this.saving = false)
    ).subscribe(backlog => {
      this.snackBar.open('Backlog entry updated.', 'Close', { duration: 3000 });
      this.dialogRef.close(backlog);
    });
  }

  private prefillForm(): void {
    if (this.data.mode !== 'edit' || !this.data.backlog) {
      if (this.statuses.length > 0) {
        this.form.controls.statusUuid.setValue(this.statuses[0].uuid);
      }
      return;
    }

    const b = this.data.backlog;
    this.form.patchValue({
      statusUuid: b.status.uuid,
      issueSummary: b.issue_summary,
      issueDescription: b.issue_description || '',
      quantityAffected: b.quantity_affected,
      deviceUuid: b.device_uuid || '',
      rentalItemUuid: b.rental_item_uuid || '',
    });
  }
}
