import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, finalize, of, switchMap, timeout } from 'rxjs';

import { DeviceView, DeviceRelationType, InventoryApiClient } from '@lumenforge/api-client';

export interface DeviceAddChildDialogData {
  parentDeviceGuid: string;
  existingChildGuids: string[];
}

const PAGE_SIZE = 10;

@Component({
  selector: 'app-device-add-child-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>Add Child Device</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search devices</mat-label>
        <input matInput [formControl]="searchCtrl" placeholder="Type to filter..." />
      </mat-form-field>

      @if (loading) {
        <div class="dialog-spinner">
          <mat-progress-spinner diameter="32" mode="indeterminate"></mat-progress-spinner>
        </div>
      } @else if (devices.length === 0 && !error) {
        <p class="dialog-empty">No available devices found.</p>
      } @else {
        <mat-selection-list [multiple]="false" (selectionChange)="onSelectionChange($event)">
          @for (device of devices; track device.guid) {
            <mat-list-option
              [value]="device.guid"
              [selected]="selectedDeviceGuid === device.guid"
              [disabled]="getAvailableAmount(device) <= 0">
              <span matListItemTitle>{{ device.name || device.serial_number }}</span>
              <span matListItemLine class="device-desc">{{ device.serial_number }}</span>
              <span matListItemLine class="device-desc">
                Available: {{ getAvailableAmount(device) }} | Bound: {{ getBoundAmount(device) }} | Stock: {{ getTotalStockAmount(device) }}
              </span>
            </mat-list-option>
          }
        </mat-selection-list>

        @if (hasMore) {
          <div class="load-more-wrapper">
            <button mat-stroked-button type="button" (click)="loadMore()" [disabled]="loadingMore || saving">
              {{ loadingMore ? 'Loading...' : 'Load more' }}
            </button>
          </div>
        }
      }

      @if (!loading) {
        @if (error) {
          <p class="error-text">{{ error }}</p>
        }
      }

      <div class="relation-fields">
        <mat-form-field appearance="outline">
          <mat-label>Quantity</mat-label>
          <input matInput type="number" [formControl]="quantityCtrl" min="1" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Relation Type</mat-label>
          <mat-select [formControl]="relationTypeCtrl">
            <mat-option value="Flexible">Flexible</mat-option>
            <mat-option value="Fixed">Fixed</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="saving">Cancel</button>
      <button mat-flat-button [disabled]="saving || loading || !selectedDeviceGuid" (click)="save()">
        {{ saving ? 'Adding...' : 'Add' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .search-field { width: 100%; margin-bottom: 8px; }
    .dialog-spinner { display: flex; justify-content: center; padding: 16px; }
    .dialog-empty { text-align: center; color: var(--mat-sys-on-surface-variant); padding: 16px; margin: 0; }
    mat-selection-list { max-height: min(50vh, 400px); overflow-y: auto; display: block; }
    .load-more-wrapper { display: flex; justify-content: center; margin-top: 12px; }
    .device-desc { font-size: 0.8rem; color: var(--mat-sys-on-surface-variant); }
    .error-text { color: var(--mat-sys-error); margin: 8px 0 0; }
    .relation-fields { display: flex; gap: 12px; margin-top: 16px; }
    .relation-fields mat-form-field { flex: 1; }
  `]
})
export class DeviceAddChildDialogComponent implements OnInit {
  searchCtrl = new FormControl('', { nonNullable: true });
  quantityCtrl = new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] });
  relationTypeCtrl = new FormControl<DeviceRelationType>('Flexible', { nonNullable: true });

  selectedDeviceGuid: string | null = null;
  devices: DeviceView[] = [];
  loading = true;
  loadingMore = false;
  saving = false;
  hasMore = false;
  error: string | null = null;
  private currentSearch = '';
  private excludeGuids: Set<string>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DeviceAddChildDialogData,
    @Inject(InventoryApiClient) private readonly inventoryApiClient: InventoryApiClient,
    private readonly dialogRef: MatDialogRef<DeviceAddChildDialogComponent>,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.excludeGuids = new Set([data.parentDeviceGuid, ...(data.existingChildGuids ?? [])]);
  }

  ngOnInit(): void {
    this.loadDevices('');

    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.loadDevices(value.trim());
    });
  }

  loadMore(): void {
    if (!this.hasMore || this.loading || this.loadingMore) return;
    this.fetchDevices(true);
  }

  onSelectionChange(event: MatSelectionListChange): void {
    const selected = event.options.find(o => o.selected);
    this.selectedDeviceGuid = selected ? (selected.value as string) : null;
  }

  save(): void {
    if (!this.selectedDeviceGuid || this.quantityCtrl.invalid) return;

    const selectedDevice = this.devices.find(d => d.guid === this.selectedDeviceGuid);
    if (!selectedDevice) {
      return;
    }

    const availableAmount = this.getAvailableAmount(selectedDevice);
    if (this.quantityCtrl.value > availableAmount) {
      this.error = `Only ${availableAmount} item(s) available for this device.`;
      this.cdr.detectChanges();
      return;
    }

    this.saving = true;
    this.error = null;
    this.cdr.detectChanges();

    this.inventoryApiClient.createDeviceRelation({
      parent_device_guid: this.data.parentDeviceGuid,
      child_device_guid: this.selectedDeviceGuid,
      contained_amount: this.quantityCtrl.value,
      relation_type: this.relationTypeCtrl.value,
    }).pipe(
      catchError(() => {
        this.error = 'Failed to create relation.';
        this.saving = false;
        this.cdr.detectChanges();
        return EMPTY;
      })
    ).subscribe(result => {
      this.dialogRef.close(result);
    });
  }

  private loadDevices(search: string): void {
    this.currentSearch = search;
    this.loading = true;
    this.loadingMore = false;
    this.error = null;
    this.hasMore = false;
    this.devices = [];
    this.cdr.detectChanges();
    this.fetchDevices(false);
  }

  private fetchDevices(append: boolean): void {
    if (append) {
      this.loadingMore = true;
    } else {
      this.loading = true;
    }
    this.cdr.detectChanges();

    this.inventoryApiClient.listDevices({
      search: this.currentSearch,
      limit: PAGE_SIZE + 1,
      offset: append ? this.devices.length : 0,
    }).pipe(
      timeout(10000),
      catchError(() => {
        this.error = 'Failed to load devices.';
        return of({ list: [] as DeviceView[], total: 0 });
      }),
      finalize(() => {
        this.loading = false;
        this.loadingMore = false;
        this.cdr.detectChanges();
      })
    ).subscribe(result => {
      const responseItems = Array.isArray(result) ? result : (result.list ?? []);
      const filtered = responseItems.filter(d => !this.excludeGuids.has(d.guid));
      const hasExtraItem = responseItems.length > PAGE_SIZE;
      const pageItems = hasExtraItem ? filtered.slice(0, PAGE_SIZE) : filtered;

      const nextDevices = append ? [...this.devices, ...pageItems] : pageItems;
      this.devices = nextDevices;

      const total = Array.isArray(result) ? undefined : result.total;
      this.hasMore = typeof total === 'number'
        ? nextDevices.length < total
        : hasExtraItem;
    });
  }

  getBoundAmount(device: DeviceView): number {
    const relations = device.parent_device_relations ?? [];
    return relations.reduce((sum, relation) => sum + (relation.contained_amount ?? 0), 0);
  }

  getTotalStockAmount(device: DeviceView): number {
    return device.stock_amount ?? 0;
  }

  getAvailableAmount(device: DeviceView): number {
    return Math.max(0, this.getTotalStockAmount(device) - this.getBoundAmount(device));
  }
}
