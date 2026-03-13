import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { AbstractControl, FormArray, FormControl, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import {
  CreateMaintenanceJobDto,
  DeviceView,
  InventoryApiClient,
  MaintenanceApiClient,
} from '@lumenforge/api-client';
import { catchError, EMPTY, finalize } from 'rxjs';

import { MaintenanceJobCreateDeviceItem, MaintenanceJobCreateDevicesDataSource } from './maintenance-job-create-devices.data-source';
import { getMaintenanceStatusLabel, MAINTENANCE_STATUS_OPTIONS, type MaintenanceStatusOption } from './maintenance-status-options';

interface SelectedDevice {
  guid: string;
  name: string;
  serialNumber: string;
  vendorName: string;
}

@Component({
  selector: 'app-maintenance-job-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTableModule,
  ],
  templateUrl: './maintenance-job-create.html',
  styleUrl: './maintenance-job-create.scss',
})
export class MaintenanceJobCreate implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly deviceSelectionForm = this.fb.group({
    deviceGuids: this.fb.nonNullable.control<string[]>([], { validators: [this.minArrayLengthValidator(1)] }),
  });

  readonly reportForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(256)]],
    description: ['', [Validators.required, Validators.maxLength(4000)]],
  });

  readonly tasksForm = this.fb.group({
    tasks: this.fb.array([this.createTaskForm()], { validators: [this.minArrayLengthValidator(1)] }),
  });

  readonly statusOptions: MaintenanceStatusOption[] = MAINTENANCE_STATUS_OPTIONS;

  readonly deviceColumns = ['name', 'serial', 'vendor', 'actions'];

  dataSource!: MaintenanceJobCreateDevicesDataSource;
  deviceSearchCtrl = new FormControl('', { nonNullable: true });
  selectedDevices: SelectedDevice[] = [];
  submitting = false;

  constructor(
    @Inject(InventoryApiClient) private readonly inventoryApiClient: InventoryApiClient,
    @Inject(MaintenanceApiClient) private readonly maintenanceApiClient: MaintenanceApiClient,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.dataSource = new MaintenanceJobCreateDevicesDataSource(this.inventoryApiClient);
    this.dataSource.loadDevices('', 'asc', 0, 10);
  }

  get tasksArray(): FormArray {
    return this.tasksForm.controls.tasks;
  }

  onDeviceSearch(): void {
    this.dataSource.loadDevices(this.deviceSearchCtrl.value.trim(), 'asc', 0, 10);
  }

  clearDeviceSearch(): void {
    this.deviceSearchCtrl.setValue('');
    this.onDeviceSearch();
  }

  onDevicePage(event: PageEvent): void {
    this.dataSource.loadDevices(this.deviceSearchCtrl.value.trim(), 'asc', event.pageIndex, event.pageSize);
  }

  addSelectedDevice(row: MaintenanceJobCreateDeviceItem): void {
    if (this.selectedDevices.some(device => device.guid === row.device.guid)) {
      return;
    }

    this.selectedDevices = [
      ...this.selectedDevices,
      this.toSelectedDevice(row.device),
    ];
    this.syncSelectedDevices();
  }

  removeSelectedDevice(guid: string): void {
    this.selectedDevices = this.selectedDevices.filter(device => device.guid !== guid);
    for (const taskControl of this.tasksArray.controls) {
      const currentGuids = ((taskControl.get('affectedDeviceGuids')?.value as string[] | null) ?? [])
        .filter(deviceGuid => deviceGuid !== guid);
      taskControl.get('affectedDeviceGuids')?.setValue(currentGuids);
    }
    this.syncSelectedDevices();
  }

  addTask(): void {
    this.tasksArray.push(this.createTaskForm());
  }

  removeTask(index: number): void {
    if (this.tasksArray.length === 1) {
      return;
    }
    this.tasksArray.removeAt(index);
    this.tasksArray.updateValueAndValidity();
  }

  submit(): void {
    if (this.deviceSelectionForm.invalid || this.reportForm.invalid || this.tasksForm.invalid) {
      this.deviceSelectionForm.markAllAsTouched();
      this.reportForm.markAllAsTouched();
      this.tasksForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const payload: CreateMaintenanceJobDto = {
      name: this.reportForm.controls.name.value.trim(),
      description: this.reportForm.controls.description.value.trim(),
      device_guids: this.selectedDevices.map(device => device.guid),
      tasks: this.tasksArray.controls.map(taskControl => ({
        description: String(taskControl.get('description')?.value ?? '').trim(),
        status: Number(taskControl.get('status')?.value ?? 0),
        affected_device_guids: ((taskControl.get('affectedDeviceGuids')?.value as string[] | null) ?? []),
      })),
    };

    this.maintenanceApiClient.createJob(payload).pipe(
      catchError(() => {
        this.snackBar.open('Failed to create maintenance report.', 'Close', { duration: 4000 });
        return EMPTY;
      }),
      finalize(() => {
        this.submitting = false;
      })
    ).subscribe(() => {
      this.snackBar.open('Maintenance report created.', 'Close', { duration: 3000 });
      void this.router.navigate(['/maintenance']);
    });
  }

  trackByGuid(_index: number, item: SelectedDevice): string {
    return item.guid;
  }

  isDeviceSelected(deviceGuid: string): boolean {
    return this.selectedDevices.some(device => device.guid === deviceGuid);
  }

  getAddButtonLabel(deviceGuid: string): string {
    return this.isDeviceSelected(deviceGuid) ? 'Added' : 'Add';
  }

  getStatusLabel(status: number): string {
    return getMaintenanceStatusLabel(status);
  }

  taskAffectedDeviceCount(taskControl: AbstractControl): number {
    const value = taskControl.get('affectedDeviceGuids')?.value;
    return Array.isArray(value) ? value.length : 0;
  }

  private createTaskForm() {
    return this.fb.group({
      description: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(4000)]),
      status: this.fb.nonNullable.control(0, [Validators.required]),
      affectedDeviceGuids: this.fb.nonNullable.control<string[]>([], [this.minArrayLengthValidator(1)]),
    });
  }

  private syncSelectedDevices(): void {
    this.deviceSelectionForm.controls.deviceGuids.setValue(this.selectedDevices.map(device => device.guid));
    this.deviceSelectionForm.controls.deviceGuids.updateValueAndValidity();
  }

  private toSelectedDevice(device: DeviceView): SelectedDevice {
    return {
      guid: device.guid,
      name: device.name || 'Unnamed device',
      serialNumber: device.serial_number,
      vendorName: device.vendor?.name || 'Unknown vendor',
    };
  }

  private minArrayLengthValidator(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!Array.isArray(value)) {
        return { minArrayLength: { requiredLength: min, actualLength: 0 } };
      }
      return value.length >= min ? null : { minArrayLength: { requiredLength: min, actualLength: value.length } };
    };
  }
}
