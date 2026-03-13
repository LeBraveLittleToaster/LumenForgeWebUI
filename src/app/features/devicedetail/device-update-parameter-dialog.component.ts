import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { catchError, EMPTY, finalize } from 'rxjs';

import { DeviceParameterView, InventoryApiClient } from '@lumenforge/api-client';

export interface DeviceUpdateParameterDialogData {
  deviceGuid: string;
  parameter: DeviceParameterView;
}

@Component({
  selector: 'app-device-update-parameter-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>Update Parameter</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Key</mat-label>
          <input matInput formControlName="key" readonly />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Value</mat-label>
          <input matInput formControlName="value" />
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
        {{ saving ? 'Saving...' : 'Update' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 12px; padding-top: 8px; }
    .error-text { color: var(--mat-sys-error); margin: 4px 0 0; }
  `]
})
export class DeviceUpdateParameterDialogComponent {
  readonly form;
  saving = false;
  error: string | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DeviceUpdateParameterDialogData,
    @Inject(InventoryApiClient) private readonly inventoryApiClient: InventoryApiClient,
    private readonly dialogRef: MatDialogRef<DeviceUpdateParameterDialogComponent>
  ) {
    this.form = this.formBuilder.nonNullable.group({
      key: [{ value: this.data.parameter.key, disabled: true }],
      value: [this.data.parameter.value, [Validators.required]]
    });
  }

  save(): void {
    if (this.form.invalid || this.saving) {
      return;
    }

    this.saving = true;
    this.error = null;

    const value = this.form.controls.value.value.trim();

    this.inventoryApiClient.upsertDeviceParameter(this.data.deviceGuid, {
      key: this.data.parameter.key,
      value
    }).pipe(
      catchError(() => {
        this.error = 'Failed to update parameter.';
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
