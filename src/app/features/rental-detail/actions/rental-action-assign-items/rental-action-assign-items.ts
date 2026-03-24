import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AssignItemsDto, DeviceView, InventoryApiClient, ItemAssignmentDto,
  RentalActionView, RentalApiClient, RentalProcessView,
} from '@lumenforge/api-client';
import { finalize, forkJoin } from 'rxjs';
import {
  formatDateOnly, getCurrentStage, getCustomerDisplay, getProcessGuid,
  getRentalNotes, getRentalPurpose, getRentalSubtitle, getRentalTitle,
  getRequestedEnd, getRequestedStart, normalizeActionType,
} from '../../rental-process.utils';
import { ActionContainerComponent } from '../../../../shared/action-container/action-container';
import { ActionRentalCard } from '../../../../shared/action-rental-card/action-rental-card';

interface SelectedDevice {
  device: DeviceView;
  quantity: number;
}

@Component({
  selector: 'app-rental-action-assign-items',
  standalone: true,
  imports: [
    ActionContainerComponent, ReactiveFormsModule, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatProgressSpinnerModule,
    MatSnackBarModule, RouterLink, ActionRentalCard,
  ],
  templateUrl: './rental-action-assign-items.html',
  styleUrl: './rental-action-assign-items.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionAssignItems implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly rentalApiClient = inject(RentalApiClient);
  private readonly inventoryApiClient = inject(InventoryApiClient);

  readonly process = signal<RentalProcessView | null>(null);
  readonly availableActions = signal<RentalActionView[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly inventoryLoading = signal(false);
  readonly devices = signal<DeviceView[]>([]);
  readonly selectedDevices = signal<SelectedDevice[]>([]);

  readonly deviceSearch = new FormControl('', { nonNullable: true });

  processGuid = '';

  readonly isAvailable = computed(() =>
    this.availableActions().some(a => normalizeActionType(a) === 'assign-items')
  );

  ngOnInit(): void {
    this.processGuid = this.route.snapshot.paramMap.get('processGuid') ?? '';
    if (!this.processGuid) { this.loading.set(false); return; }

    forkJoin({
      process: this.rentalApiClient.getRental(this.processGuid, []),
      actions: this.rentalApiClient.listAvailableActions(this.processGuid),
    }).subscribe({
      next: ({ process, actions }) => {
        this.process.set(process);
        this.availableActions.set(actions);
        this.loading.set(false);
        this.loadInventoryDevices();
      },
      error: () => this.loading.set(false),
    });
  }

  loadInventoryDevices(): void {
    this.inventoryLoading.set(true);
    this.inventoryApiClient.listDevices({
      search: this.deviceSearch.value.trim() || null,
      limit: 50,
      offset: 0,
    }).pipe(
      finalize(() => this.inventoryLoading.set(false))
    ).subscribe({
      next: result => this.devices.set(result.list),
      error: () => this.devices.set([]),
    });
  }

  addDevice(device: DeviceView): void {
    this.selectedDevices.update(current => {
      const existing = current.find(item => item.device.guid === device.guid);
      if (existing) {
        return current.map(item => item.device.guid === device.guid ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { device, quantity: 1 }];
    });
  }

  updateSelectedQuantity(deviceGuid: string, rawValue: string): void {
    const quantity = Math.max(1, Number(rawValue || 1));
    this.selectedDevices.update(current =>
      current.map(item => item.device.guid === deviceGuid ? { ...item, quantity } : item)
    );
  }

  removeSelectedDevice(deviceGuid: string): void {
    this.selectedDevices.update(current => current.filter(item => item.device.guid !== deviceGuid));
  }

  submit(): void {
    if (!this.processGuid || this.submitting()) { return; }
    if (!this.isAvailable()) {
      this.snackBar.open('This action is not currently available.', 'Close', { duration: 4000 });
      return;
    }
    if (this.selectedDevices().length === 0) {
      this.snackBar.open('Select at least one device to assign.', 'Close', { duration: 3000 });
      return;
    }
    const dto: AssignItemsDto = {
      items: this.selectedDevices().map(item => ({ device_guid: item.device.guid, quantity: item.quantity } satisfies ItemAssignmentDto)),
    };
    this.submitting.set(true);
    this.rentalApiClient.assignItems(this.processGuid, dto).pipe(
      finalize(() => this.submitting.set(false))
    ).subscribe({
      next: () => {
        this.snackBar.open('Items assigned to rental.', 'Close', { duration: 3000 });
        this.router.navigate(['/rental', this.processGuid]);
      },
      error: () => this.snackBar.open('The rental action failed. Please try again.', 'Close', { duration: 4000 }),
    });
  }

  protected readonly formatDateOnly = formatDateOnly;
  protected readonly getCurrentStage = getCurrentStage;
  protected readonly getCustomerDisplay = getCustomerDisplay;
  protected readonly getProcessGuid = getProcessGuid;
  protected readonly getRentalNotes = getRentalNotes;
  protected readonly getRentalPurpose = getRentalPurpose;
  protected readonly getRentalSubtitle = getRentalSubtitle;
  protected readonly getRentalTitle = getRentalTitle;
  protected readonly getRequestedEnd = getRequestedEnd;
  protected readonly getRequestedStart = getRequestedStart;
}
