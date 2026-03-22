import { ChangeDetectionStrategy, Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ApproveExtensionDto,
  ApproveItemsDto,
  ApproveRequestDto,
  AssignItemsDto,
  CancelRentalDto,
  ChecklistType,
  CreateMaintenanceJobsDto,
  DamageSeverity,
  DeviceView,
  GenerateChecklistDto,
  GenerateInvoiceDto,
  GenerateReportDto,
  InventoryApiClient,
  ItemAssignmentDto,
  PaymentMethod,
  RecordDamagesDto,
  RecordPaymentDto,
  RecordPickupDto,
  RecordReturnDto,
  RejectExtensionDto,
  RejectItemsDto,
  RejectRequestDto,
  RemoveItemsDto,
  RequestExtensionDto,
  RentalActionType,
  RentalActionView,
  RentalApiClient,
  RentalView,
  ScanChecklistDto,
  ScrapRentalDto,
  SignChecklistDto,
} from '@lumenforge/api-client';
import { finalize, forkJoin } from 'rxjs';
import {
  DAMAGE_SEVERITY_OPTIONS,
  RENTAL_ACTION_CONFIG,
  type RentalActionConfig,
  type RentalActionFieldConfig,
} from './rental-action.registry';
import {
  formatDateOnly,
  formatDateTime,
  getActionLabel,
  getChecklistOptions,
  getCurrentStage,
  getCustomerDisplay,
  getExtensionOptions,
  getInvoiceOptions,
  getProcessGuid,
  getRentalBindingOptions,
  getRentalNotes,
  getRentalPurpose,
  getRentalSubtitle,
  getRentalTitle,
  getRequestedEnd,
  getRequestedStart,
  normalizeActionType,
} from './rental-process.utils';

interface SelectedDevice {
  device: DeviceView;
  quantity: number;
}

interface DamageEntryDraft {
  stockBindingGuid: string;
  description: string;
  severity: DamageSeverity;
}

@Component({
  selector: 'app-rental-action-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './rental-action-page.html',
  styleUrl: './rental-action-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly rentalApiClient = inject(RentalApiClient);
  private readonly inventoryApiClient = inject(InventoryApiClient);

  @Input({ required: true }) actionType!: RentalActionType | string;

  readonly process = signal<RentalView | null>(null);
  readonly availableActions = signal<RentalActionView[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly inventoryLoading = signal(false);
  readonly devices = signal<DeviceView[]>([]);
  readonly selectedDevices = signal<SelectedDevice[]>([]);
  readonly selectedBindingGuids = signal<string[]>([]);
  readonly selectedMaintenanceBindingGuids = signal<string[]>([]);
  readonly damageEntries = signal<DamageEntryDraft[]>([]);

  readonly deviceSearch = new FormControl('', { nonNullable: true });
  readonly comment = new FormControl('', { nonNullable: true });
  readonly reason = new FormControl('', { nonNullable: true });
  readonly checklistType = new FormControl<ChecklistType>('PICKUP', { nonNullable: true });
  readonly checklistGuid = new FormControl('', { nonNullable: true });
  readonly scannedValue = new FormControl('', { nonNullable: true });
  readonly signatureData = new FormControl('', { nonNullable: true });
  readonly newRequestedEnd = new FormControl('', { nonNullable: true });
  readonly extensionGuid = new FormControl('', { nonNullable: true });
  readonly dueDateOverride = new FormControl('', { nonNullable: true });
  readonly invoiceGuid = new FormControl('', { nonNullable: true });
  readonly amount = new FormControl<number | null>(null);
  readonly paymentMethod = new FormControl<PaymentMethod>('CASH', { nonNullable: true });
  readonly reference = new FormControl('', { nonNullable: true });
  readonly includeDamages = new FormControl(false, { nonNullable: true });
  readonly includePayments = new FormControl(false, { nonNullable: true });

  processGuid = '';

  readonly normalizedActionType = computed(() => normalizeActionType(this.actionType) as RentalActionType);
  readonly config = computed<RentalActionConfig | null>(() => RENTAL_ACTION_CONFIG[this.normalizedActionType()] ?? null);
  readonly bindingOptions = computed(() => getRentalBindingOptions(this.process()));
  readonly checklistOptions = computed(() => getChecklistOptions(this.process()));
  readonly extensionOptions = computed(() => getExtensionOptions(this.process()));
  readonly invoiceOptions = computed(() => getInvoiceOptions(this.process()));
  readonly isAvailable = computed(() => {
    const expectedAction = this.normalizedActionType();
    return this.availableActions().some(action => normalizeActionType(action) === expectedAction);
  });

  ngOnInit(): void {
    this.processGuid = this.route.snapshot.paramMap.get('processGuid') ?? '';

    if (!this.processGuid || !this.config()) {
      this.loading.set(false);
      return;
    }

    forkJoin({
      process: this.rentalApiClient.getRental(this.processGuid, ['checklists', 'extensions', 'damage_reports']),
      actions: this.rentalApiClient.listAvailableActions(this.processGuid),
    }).subscribe({
      next: ({ process, actions }) => {
        this.process.set(process);
        this.availableActions.set(actions);
        this.seedDraftsFromProcess(process);
        this.loading.set(false);

        if (this.config()?.formKind === 'assign-items') {
          this.loadInventoryDevices();
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  fieldOptions(field: RentalActionFieldConfig): Array<{ value: string | boolean; label: string }> {
    if (field.options) {
      return field.options;
    }

    switch (field.key) {
      case 'checklistGuid':
        return this.checklistOptions().map(option => ({ value: option.guid, label: option.label }));
      case 'extensionGuid':
        return this.extensionOptions().map(option => ({ value: option.guid, label: option.label }));
      case 'invoiceGuid':
        return this.invoiceOptions().map(option => ({ value: option.guid, label: option.label }));
      default:
        return [];
    }
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
      next: result => {
        this.devices.set(result.list);
      },
      error: () => {
        this.devices.set([]);
      },
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

  toggleBindingSelection(bindingGuid: string): void {
    this.selectedBindingGuids.update(current =>
      current.includes(bindingGuid)
        ? current.filter(guid => guid !== bindingGuid)
        : [...current, bindingGuid]
    );
  }

  toggleMaintenanceBinding(bindingGuid: string): void {
    this.selectedMaintenanceBindingGuids.update(current =>
      current.includes(bindingGuid)
        ? current.filter(guid => guid !== bindingGuid)
        : [...current, bindingGuid]
    );
  }

  addDamageEntry(): void {
    const firstBindingGuid = this.bindingOptions()[0]?.guid ?? '';
    this.damageEntries.update(current => [
      ...current,
      { stockBindingGuid: firstBindingGuid, description: '', severity: 'MINOR' },
    ]);
  }

  updateDamageEntry(index: number, patch: Partial<DamageEntryDraft>): void {
    this.damageEntries.update(current => current.map((entry, currentIndex) => currentIndex === index ? { ...entry, ...patch } : entry));
  }

  removeDamageEntry(index: number): void {
    this.damageEntries.update(current => current.filter((_, currentIndex) => currentIndex !== index));
  }

  submit(): void {
    const config = this.config();
    if (!config || !this.processGuid || this.submitting() || !this.validateBeforeSubmit()) {
      return;
    }

    this.submitting.set(true);
    this.buildRequest().pipe(
      finalize(() => this.submitting.set(false))
    ).subscribe({
      next: () => {
        this.snackBar.open(config.successMessage, 'Close', { duration: 3000 });
        this.router.navigate(['/rental', this.processGuid]);
      },
      error: () => {
        this.snackBar.open('The rental action failed. Please try again.', 'Close', { duration: 4000 });
      },
    });
  }

  trackField(_: number, field: RentalActionFieldConfig): string {
    return field.key;
  }

  private seedDraftsFromProcess(process: RentalView): void {
    if (this.bindingOptions().length > 0 && this.damageEntries().length === 0 && this.config()?.formKind === 'record-damages') {
      this.addDamageEntry();
    }

    if (this.config()?.formKind === 'assign-items') {
      const seededDevices = (process.items ?? process.rental?.items ?? [])
        .filter(item => item.device_guid)
        .map(item => ({
          device: {
            guid: item.device_guid!,
            serial_number: item.device_serial_number ?? '-',
            name: item.device_name ?? 'Assigned device',
            description: null,
            photo_url: null,
            purchase_price: 0,
            purchase_date: '',
            maintenance_status_uuid: '',
            maintenance_status_name: '',
            vendor: { guid: '', name: '', created_at: '', updated_at: '' },
            stock: null,
            parameters: [],
            categories: [],
            created_at: '',
            updated_at: '',
          },
          quantity: item.quantity_approved ?? item.quantity_requested ?? 1,
        } satisfies SelectedDevice));

      if (seededDevices.length > 0) {
        this.selectedDevices.set(seededDevices);
      }
    }
  }

  private validateBeforeSubmit(): boolean {
    if (!this.isAvailable()) {
      this.snackBar.open('This action is not currently available for the process state returned by the API.', 'Close', { duration: 4000 });
      return false;
    }

    switch (this.normalizedActionType()) {
      case 'assign-items':
        if (this.selectedDevices().length === 0) {
          this.snackBar.open('Select at least one device to assign.', 'Close', { duration: 3000 });
          return false;
        }
        return true;
      case 'remove-items':
        if (this.selectedBindingGuids().length === 0) {
          this.snackBar.open('Select at least one stock binding to remove.', 'Close', { duration: 3000 });
          return false;
        }
        return true;
      case 'record-damages':
        if (this.damageEntries().length === 0 || this.damageEntries().some(entry => !entry.stockBindingGuid)) {
          this.snackBar.open('Add at least one valid damage entry.', 'Close', { duration: 3000 });
          return false;
        }
        return true;
      case 'create-maintenance-jobs':
        if (this.selectedMaintenanceBindingGuids().length === 0) {
          this.snackBar.open('Select at least one damaged stock binding.', 'Close', { duration: 3000 });
          return false;
        }
        return true;
      default:
        return this.validateGenericFields();
    }
  }

  private validateGenericFields(): boolean {
    const config = this.config();
    if (!config?.fields) {
      return true;
    }

    for (const field of config.fields) {
      if (!field.required) {
        continue;
      }

      const value = this.fieldValue(field.key);
      if (value === '' || value === null || value === false) {
        this.snackBar.open(`${field.label} is required.`, 'Close', { duration: 3000 });
        return false;
      }
    }

    return true;
  }

  private fieldValue(key: RentalActionFieldConfig['key']): string | number | boolean | null {
    switch (key) {
      case 'comment':
        return this.comment.value.trim();
      case 'reason':
        return this.reason.value.trim();
      case 'checklistType':
        return this.checklistType.value;
      case 'checklistGuid':
        return this.checklistGuid.value;
      case 'scannedValue':
        return this.scannedValue.value.trim();
      case 'signatureData':
        return this.signatureData.value.trim();
      case 'newRequestedEnd':
        return this.newRequestedEnd.value;
      case 'extensionGuid':
        return this.extensionGuid.value;
      case 'dueDateOverride':
        return this.dueDateOverride.value;
      case 'invoiceGuid':
        return this.invoiceGuid.value;
      case 'amount':
        return this.amount.value;
      case 'paymentMethod':
        return this.paymentMethod.value;
      case 'reference':
        return this.reference.value.trim();
      case 'includeDamages':
        return this.includeDamages.value;
      case 'includePayments':
        return this.includePayments.value;
    }
  }

  private buildRequest() {
    switch (this.normalizedActionType()) {
      case 'approve-request': {
        const dto: ApproveRequestDto = { comment: this.toNullable(this.comment.value) };
        return this.rentalApiClient.approveRequest(this.processGuid, dto);
      }
      case 'reject-request': {
        const dto: RejectRequestDto = { reason: this.toNullable(this.reason.value) };
        return this.rentalApiClient.rejectRequest(this.processGuid, dto);
      }
      case 'assign-items': {
        const dto: AssignItemsDto = {
          items: this.selectedDevices().map(item => ({ device_guid: item.device.guid, quantity: item.quantity } satisfies ItemAssignmentDto)),
        };
        return this.rentalApiClient.assignItems(this.processGuid, dto);
      }
      case 'remove-items': {
        const dto: RemoveItemsDto = { stock_binding_guids: this.selectedBindingGuids() };
        return this.rentalApiClient.removeItems(this.processGuid, dto);
      }
      case 'approve-items': {
        const dto: ApproveItemsDto = { comment: this.toNullable(this.comment.value) };
        return this.rentalApiClient.approveItems(this.processGuid, dto);
      }
      case 'reject-items': {
        const dto: RejectItemsDto = { reason: this.toNullable(this.reason.value) };
        return this.rentalApiClient.rejectItems(this.processGuid, dto);
      }
      case 'generate-checklist': {
        const dto: GenerateChecklistDto = { checklist_type: this.checklistType.value };
        return this.rentalApiClient.generateChecklist(this.processGuid, dto);
      }
      case 'scan-checklist': {
        const dto: ScanChecklistDto = {
          checklist_guid: this.checklistGuid.value,
          scanned_value: this.toNullable(this.scannedValue.value),
        };
        return this.rentalApiClient.scanChecklist(this.processGuid, dto);
      }
      case 'sign-checklist': {
        const dto: SignChecklistDto = {
          checklist_guid: this.checklistGuid.value,
          signature_data: this.toNullable(this.signatureData.value),
        };
        return this.rentalApiClient.signChecklist(this.processGuid, dto);
      }
      case 'record-pickup': {
        const dto: RecordPickupDto = { notes: this.toNullable(this.comment.value) };
        return this.rentalApiClient.recordPickup(this.processGuid, dto);
      }
      case 'record-return': {
        const dto: RecordReturnDto = { notes: this.toNullable(this.comment.value) };
        return this.rentalApiClient.recordReturn(this.processGuid, dto);
      }
      case 'request-extension': {
        const dto: RequestExtensionDto = {
          new_requested_end: this.toIsoInstant(this.newRequestedEnd.value),
          reason: this.toNullable(this.reason.value),
        };
        return this.rentalApiClient.requestExtension(this.processGuid, dto);
      }
      case 'approve-extension': {
        const dto: ApproveExtensionDto = {
          extension_guid: this.extensionGuid.value,
          comment: this.toNullable(this.comment.value),
        };
        return this.rentalApiClient.approveExtension(this.processGuid, dto);
      }
      case 'reject-extension': {
        const dto: RejectExtensionDto = {
          extension_guid: this.extensionGuid.value,
          reason: this.toNullable(this.reason.value),
        };
        return this.rentalApiClient.rejectExtension(this.processGuid, dto);
      }
      case 'record-damages': {
        const dto: RecordDamagesDto = {
          damages: this.damageEntries().map(entry => ({
            stock_binding_guid: entry.stockBindingGuid,
            description: this.toNullable(entry.description),
            severity: entry.severity,
          })),
        };
        return this.rentalApiClient.recordDamages(this.processGuid, dto);
      }
      case 'create-maintenance-jobs': {
        const dto: CreateMaintenanceJobsDto = { damaged_stock_binding_guids: this.selectedMaintenanceBindingGuids() };
        return this.rentalApiClient.createMaintenanceJobs(this.processGuid, dto);
      }
      case 'generate-invoice': {
        const dto: GenerateInvoiceDto = { due_date_override: this.toNullable(this.toIsoInstant(this.dueDateOverride.value)) };
        return this.rentalApiClient.generateInvoice(this.processGuid, dto);
      }
      case 'record-payment': {
        const dto: RecordPaymentDto = {
          invoice_guid: this.invoiceGuid.value,
          amount: Number(this.amount.value ?? 0),
          method: this.paymentMethod.value,
          reference: this.toNullable(this.reference.value),
        };
        return this.rentalApiClient.recordPayment(this.processGuid, dto);
      }
      case 'generate-report': {
        const dto: GenerateReportDto = {
          include_damages: this.includeDamages.value,
          include_payments: this.includePayments.value,
        };
        return this.rentalApiClient.generateReport(this.processGuid, dto);
      }
      case 'complete':
        return this.rentalApiClient.complete(this.processGuid, { comment: this.toNullable(this.comment.value) });
      case 'cancel': {
        const dto: CancelRentalDto = { reason: this.toNullable(this.reason.value) };
        return this.rentalApiClient.cancel(this.processGuid, dto);
      }
      case 'scrap': {
        const dto: ScrapRentalDto = { reason: this.toNullable(this.reason.value) };
        return this.rentalApiClient.scrap(this.processGuid, dto);
      }
    }
  }

  private toNullable(value: string | null | undefined): string | null {
    return value && value.trim() ? value.trim() : null;
  }

  private toIsoInstant(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toISOString();
  }

  protected readonly formatDateTime = formatDateTime;
  protected readonly formatDateOnly = formatDateOnly;
  protected readonly getActionLabel = getActionLabel;
  protected readonly getCurrentStage = getCurrentStage;
  protected readonly getCustomerDisplay = getCustomerDisplay;
  protected readonly getProcessGuid = getProcessGuid;
  protected readonly getRentalNotes = getRentalNotes;
  protected readonly getRentalPurpose = getRentalPurpose;
  protected readonly getRentalSubtitle = getRentalSubtitle;
  protected readonly getRentalTitle = getRentalTitle;
  protected readonly getRequestedEnd = getRequestedEnd;
  protected readonly getRequestedStart = getRequestedStart;
  protected readonly damageSeverityOptions = DAMAGE_SEVERITY_OPTIONS;
}