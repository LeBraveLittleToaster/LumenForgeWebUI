import { CommonModule } from '@angular/common';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, Validators, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { ColumnDef } from '../../shared/data-table/data-table';
import { RentalApiClient, CatalogueApiClient, CatalogueItemView, QuestionView } from '@lumenforge/api-client';
import { RentalRequestDevicesDataSource, RentalRequestDeviceItem } from './rental-request-devices.data-source';
import { catchError, EMPTY } from 'rxjs';
import { getProcessGuid } from '../rental-detail/rental-process.utils';

export type QuestionAnswer = 'yes' | 'no' | 'not_important' | 'unknown';

interface RequestedDevice {
  guid: string;
  name: string;
  quantity: number;
}

@Component({
  selector: 'app-rental-request',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatSelectModule,
    MatStepperModule,
    MatTableModule,
  ],
  templateUrl: './rental-request.html',
  styleUrl: './rental-request.scss',
})
export class RentalRequest implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly eventForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    shortDescription: ['', [Validators.required, Validators.maxLength(500)]],
    eventStart: ['', Validators.required],
    eventEnd: ['', Validators.required],
    location: ['', [Validators.required, Validators.maxLength(200)]],
  }, { validators: this.eventTimeRangeValidator });

  readonly questionsForm = this.fb.group({});

  readonly pickupForm = this.fb.group({
    pickupTime: ['', Validators.required],
    dropoffTime: ['', Validators.required],
    transportationMethod: ['', Validators.required],
  });

  readonly deviceColumns: ColumnDef<RentalRequestDeviceItem>[] = [
    { key: 'name', header: 'Name', cell: r => r.item.name },
    { key: 'description', header: 'Description', cell: r => r.item.description },
  ];

  readonly answerOptions: Array<{ value: QuestionAnswer; label: string }> = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'not_important', label: 'Not Important' },
    { value: 'unknown', label: 'Unknown' },
  ];

  readonly transportationOptions = [
    'Customer pickup',
    'Company delivery',
    'Third-party carrier',
    'Not sure yet',
  ];

  dataSource!: RentalRequestDevicesDataSource;
  deviceSearchCtrl = new FormControl('', { nonNullable: true });
  requestedDevices: RequestedDevice[] = [];
  deviceQuantities: Record<string, number> = {};
  questions: string[] = [];
  selectedItem: CatalogueItemView | null = null;

  constructor(
    @Inject(CatalogueApiClient) private readonly catalogueApiClient: CatalogueApiClient,
    @Inject(RentalApiClient) private readonly rentalApiClient: RentalApiClient
  ) {}

  ngOnInit(): void {
    this.dataSource = new RentalRequestDevicesDataSource(this.catalogueApiClient);
    this.dataSource.loadDevices('', 'asc', 0, 10);

    // DEV: prefill step 1 (Event Data) and step 4 (Pickup & Dropoff) for faster iteration
    const devEventStart = new Date();
    devEventStart.setDate(devEventStart.getDate() + 7);
    const devEventEnd = new Date(devEventStart);
    devEventEnd.setDate(devEventEnd.getDate() + 3);

    this.eventForm.patchValue({
      name: 'Dev Test Event',
      shortDescription: 'Sample event created during development to test the rental request flow.',
      eventStart: devEventStart.toISOString(),
      eventEnd: devEventEnd.toISOString(),
      location: '123 Dev Lane, Testville',
    });

    const devPickup = new Date(devEventStart);
    devPickup.setDate(devPickup.getDate() - 1);
    const devDropoff = new Date(devEventEnd);
    devDropoff.setDate(devDropoff.getDate() + 1);

    this.pickupForm.patchValue({
      pickupTime: devPickup.toISOString(),
      dropoffTime: devDropoff.toISOString(),
      transportationMethod: 'Customer pickup',
    });
  }

  onStepperSelectionChange(event: StepperSelectionEvent): void {
    if (event.selectedIndex === 2) {
      this.loadRecommendedQuestions();
    }
  }

  private loadRecommendedQuestions(): void {
    const step1 = this.eventForm.getRawValue();

    const toIsoOrNull = (value: unknown): string | null => {
      if (!value) {
        return null;
      }
      const date = new Date(value as string | number | Date);
      return Number.isNaN(date.getTime()) ? null : date.toISOString();
    };

    this.rentalApiClient.recommendQuestions({
      event_name: step1.name ?? '',
      description: step1.shortDescription ?? null,
      start: toIsoOrNull(step1.eventStart),
      end: toIsoOrNull(step1.eventEnd),
      location: step1.location ?? null,
    }).subscribe((questions: QuestionView[]) => {
      this.questions = questions.map(q => q.question_text);

      for (const key of Object.keys(this.questionsForm.controls)) {
        this.questionsForm.removeControl(key);
      }

      for (let i = 0; i < questions.length; i++) {
        this.questionsForm.addControl(`q_${i}`, new FormControl<QuestionAnswer>('unknown', { nonNullable: true }));
        this.questionsForm.addControl(`comment_${i}`, new FormControl<string>('', { nonNullable: true }));
      }
    });
  }

  eventTimeRangeValidator(control: AbstractControl): ValidationErrors | null {
    const start = control.get('eventStart')?.value;
    const end = control.get('eventEnd')?.value;
    if (!start || !end) {
      return null;
    }
    return new Date(start) < new Date(end) ? null : { invalidEventRange: true };
  }

  openItemPreview(item: CatalogueItemView): void {
    this.selectedItem = item;
  }

  closeItemPreview(): void {
    this.selectedItem = null;
  }

  onDeviceSearch(): void {
    this.dataSource.loadDevices(this.deviceSearchCtrl.value, 'asc', 0, 10);
  }

  clearDeviceSearch(): void {
    this.deviceSearchCtrl.setValue('');
    this.onDeviceSearch();
  }

  onDevicePage(event: PageEvent): void {
    this.dataSource.loadDevices(this.deviceSearchCtrl.value, 'asc', event.pageIndex, event.pageSize);
  }

  setPendingQuantity(guid: string, value: string): void {
    this.deviceQuantities[guid] = Math.max(1, Number(value || 1));
  }

  getPendingQuantity(guid: string): number {
    const value = this.deviceQuantities[guid];
    return Number.isFinite(value) && value > 0 ? value : 1;
  }

  addRequestedDevice(row: RentalRequestDeviceItem): void {
    const quantity = this.getPendingQuantity(row.item.guid);
    const existing = this.requestedDevices.find(d => d.guid === row.item.guid);

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.requestedDevices.push({
        guid: row.item.guid,
        name: row.item.name,
        quantity,
      });
    }

    this.deviceQuantities[row.item.guid] = 1;
  }

  updateRequestedQuantity(guid: string, quantityInput: HTMLInputElement): void {
    const value = Math.max(1, Number(quantityInput.value || 1));
    const target = this.requestedDevices.find(d => d.guid === guid);
    if (target) {
      target.quantity = value;
    }
  }

  removeRequestedDevice(guid: string): void {
    this.requestedDevices = this.requestedDevices.filter(d => d.guid !== guid);
  }

  submitRequest(): void {
    if (this.eventForm.invalid || this.pickupForm.invalid) {
      this.eventForm.markAllAsTouched();
      this.pickupForm.markAllAsTouched();
      return;
    }

    const toIsoOrNull = (value: unknown): string | null => {
      if (!value) {
        return null;
      }

      const date = new Date(value as string | number | Date);
      return Number.isNaN(date.getTime()) ? null : date.toISOString();
    };

    const requestedDevicesNotes = this.requestedDevices.length === 0
      ? 'No catalogue devices pre-selected.'
      : this.requestedDevices.map(device => `- ${device.name} x${device.quantity}`).join('\n');

    const surveyNotes = this.questions
      .map((question, index) => {
        const answer = (this.questionsForm.get(`q_${index}`)?.value ?? 'unknown') as QuestionAnswer;
        const comment = (this.questionsForm.get<string>(`comment_${index}`)?.value as string) || null;
        return `${question}: ${answer}${comment ? ` (${comment})` : ''}`;
      })
      .join('\n');

    const notes = [
      `Location: ${this.eventForm.controls.location.value}`,
      `Transportation: ${this.pickupForm.controls.transportationMethod.value}`,
      'Requested catalogue devices:',
      requestedDevicesNotes,
      surveyNotes ? 'Survey answers:' : '',
      surveyNotes,
    ].filter(Boolean).join('\n');

    this.rentalApiClient.createRental({
      customer_name: this.eventForm.controls.name.value,
      purpose: this.eventForm.controls.shortDescription.value || this.eventForm.controls.name.value,
      requested_start: toIsoOrNull(this.pickupForm.controls.pickupTime.value) ?? new Date().toISOString(),
      requested_end: toIsoOrNull(this.pickupForm.controls.dropoffTime.value) ?? new Date().toISOString(),
      notes,
    }).pipe(
      catchError(() => {
        this.snackBar.open('Failed to create rental request.', 'Close', { duration: 4000 });
        return EMPTY;
      })
    ).subscribe(created => {
      this.snackBar.open(`Rental request created (${getProcessGuid(created)}).`, 'Close', { duration: 3500 });
      this.router.navigate(['/rental', getProcessGuid(created)]);
    });
  }
}
