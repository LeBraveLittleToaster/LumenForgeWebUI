import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaymentMethod, RecordPaymentDto, RentalActionView, RentalApiClient, RentalProcessView } from '@lumenforge/api-client';
import { finalize, forkJoin } from 'rxjs';
import {
  formatDateOnly, getCurrentStage, getCustomerDisplay, getInvoiceOptions,
  getProcessGuid, getRentalNotes, getRentalPurpose, getRentalSubtitle,
  getRentalTitle, getRequestedEnd, getRequestedStart, normalizeActionType,
} from '../../rental-process.utils';
import { ActionContainerComponent } from '../../../../shared/action-container/action-container';

const PAYMENT_METHOD_OPTIONS: Array<{ value: PaymentMethod; label: string }> = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'OTHER', label: 'Other' },
];

@Component({
  selector: 'app-rental-action-record-payment',
  standalone: true,
  imports: [
    ActionContainerComponent, ReactiveFormsModule, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatProgressSpinnerModule,
    MatSelectModule, MatSnackBarModule, RouterLink,
  ],
  templateUrl: './rental-action-record-payment.html',
  styleUrl: './rental-action-record-payment.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionRecordPayment implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly rentalApiClient = inject(RentalApiClient);

  readonly process = signal<RentalProcessView | null>(null);
  readonly availableActions = signal<RentalActionView[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);

  readonly invoiceGuid = new FormControl('', { nonNullable: true });
  readonly amount = new FormControl<number | null>(null);
  readonly paymentMethod = new FormControl<PaymentMethod>('CASH', { nonNullable: true });
  readonly reference = new FormControl('', { nonNullable: true });

  processGuid = '';

  readonly isAvailable = computed(() =>
    this.availableActions().some(a => normalizeActionType(a) === 'record-payment')
  );

  readonly invoiceOptions = computed(() => getInvoiceOptions(this.process()));

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
      },
      error: () => this.loading.set(false),
    });
  }

  submit(): void {
    if (!this.processGuid || this.submitting()) { return; }
    if (!this.isAvailable()) {
      this.snackBar.open('This action is not currently available.', 'Close', { duration: 4000 });
      return;
    }
    if (!this.invoiceGuid.value) {
      this.snackBar.open('Invoice is required.', 'Close', { duration: 3000 });
      return;
    }
    if (this.amount.value === null) {
      this.snackBar.open('Amount is required.', 'Close', { duration: 3000 });
      return;
    }
    const dto: RecordPaymentDto = {
      invoice_guid: this.invoiceGuid.value,
      amount: Number(this.amount.value),
      method: this.paymentMethod.value,
      reference: this.toNullable(this.reference.value),
    };
    this.submitting.set(true);
    this.rentalApiClient.recordPayment(this.processGuid, dto).pipe(
      finalize(() => this.submitting.set(false))
    ).subscribe({
      next: () => {
        this.snackBar.open('Payment recorded.', 'Close', { duration: 3000 });
        this.router.navigate(['/rental', this.processGuid]);
      },
      error: () => this.snackBar.open('The rental action failed. Please try again.', 'Close', { duration: 4000 }),
    });
  }

  private toNullable(value: string): string | null {
    return value.trim() ? value.trim() : null;
  }

  protected readonly paymentMethodOptions = PAYMENT_METHOD_OPTIONS;
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
