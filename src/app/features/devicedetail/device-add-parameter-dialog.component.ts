import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { catchError, EMPTY, finalize } from 'rxjs';

import { InventoryApiClient } from '@lumenforge/api-client';

export interface DeviceAddParameterDialogData {
  deviceGuid: string;
}

@Component({
  selector: 'app-device-add-parameter-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>Add Parameter</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Key</mat-label>
          <input matInput formControlName="key" placeholder="e.g. color" />
          @if (form.controls.key.hasError('required')) {
            <mat-error>Key is required.</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Value</mat-label>
          <textarea matInput formControlName="value" placeholder="e.g. black" rows="3"></textarea>
          @if (form.controls.value.hasError('required')) {
            <mat-error>Value is required.</mat-error>
          }
        </mat-form-field>
      </form>

      @if (error) {
        <p class="error-text">{{ error }}</p>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="saving">Cancel</button>
      <button mat-flat-button [disabled]="saving || form.invalid" (click)="save()">
        {{ saving ? 'Saving...' : 'Add' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 12px; padding-top: 8px; }
    .error-text { color: var(--mat-sys-error); margin: 4px 0 0; }
  `]
})
export class DeviceAddParameterDialogComponent {
  readonly form;
  saving = false;
  error: string | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DeviceAddParameterDialogData,
    @Inject(InventoryApiClient) private readonly inventoryApiClient: InventoryApiClient,
    private readonly dialogRef: MatDialogRef<DeviceAddParameterDialogComponent>
  ) {
    this.form = this.formBuilder.nonNullable.group({
      key: ['', [Validators.required]],
      value: ['', [Validators.required]]
    });
  }

  save(): void {
    if (this.form.invalid || this.saving) {
      return;
    }

    this.saving = true;
    this.error = null;

    const key = this.form.controls.key.value.trim();
    const value = this.form.controls.value.value.trim();

    this.inventoryApiClient.upsertDeviceParameter(this.data.deviceGuid, { key, value }).pipe(
      catchError(() => {
        this.error = 'Failed to add parameter.';
        return EMPTY;
      }),
      finalize(() => {
        this.saving = false;
      })
    ).subscribe(parameter => {
      this.dialogRef.close(parameter);
    });
  }
}
