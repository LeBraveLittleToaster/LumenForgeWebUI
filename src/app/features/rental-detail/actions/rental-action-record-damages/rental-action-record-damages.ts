import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DamageSeverity, RecordDamagesDto, RentalActionView, RentalApiClient, RentalProcessView } from '@lumenforge/api-client';
import { finalize, forkJoin } from 'rxjs';
import {
  formatDateOnly, getCurrentStage, getCustomerDisplay, getProcessGuid,
  getRentalBindingOptions, getRentalNotes, getRentalPurpose, getRentalSubtitle,
  getRentalTitle, getRequestedEnd, getRequestedStart, normalizeActionType,
} from '../../rental-process.utils';
import { ActionContainerComponent } from '../../../../shared/action-container/action-container';
import { ActionRentalCard } from '../../../../shared/action-rental-card/action-rental-card';

interface DamageEntryDraft {
  stockBindingGuid: string;
  description: string;
  severity: DamageSeverity;
}

const DAMAGE_SEVERITY_OPTIONS: Array<{ value: DamageSeverity; label: string }> = [
  { value: 'MINOR', label: 'Minor' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'SEVERE', label: 'Severe' },
  { value: 'TOTAL_LOSS', label: 'Total Loss' },
];

@Component({
  selector: 'app-rental-action-record-damages',
  standalone: true,
  imports: [
    ActionContainerComponent, MatButtonModule, MatCardModule, MatFormFieldModule,
    MatIconModule, MatInputModule, MatProgressSpinnerModule, MatSelectModule,
    MatSnackBarModule, RouterLink, ActionRentalCard,
  ],
  templateUrl: './rental-action-record-damages.html',
  styleUrl: './rental-action-record-damages.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionRecordDamages implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly rentalApiClient = inject(RentalApiClient);

  readonly process = signal<RentalProcessView | null>(null);
  readonly availableActions = signal<RentalActionView[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly damageEntries = signal<DamageEntryDraft[]>([]);

  processGuid = '';

  readonly isAvailable = computed(() =>
    this.availableActions().some(a => normalizeActionType(a) === 'record-damages')
  );

  readonly bindingOptions = computed(() => getRentalBindingOptions(this.process()));

  ngOnInit(): void {
    this.processGuid = this.route.snapshot.paramMap.get('processGuid') ?? '';
    if (!this.processGuid) { this.loading.set(false); return; }

    forkJoin({
      process: this.rentalApiClient.getRental(this.processGuid, ['checklists']),
      actions: this.rentalApiClient.listAvailableActions(this.processGuid),
    }).subscribe({
      next: ({ process, actions }) => {
        this.process.set(process);
        this.availableActions.set(actions);
        this.loading.set(false);
        if (this.bindingOptions().length > 0) {
          this.addEntry();
        }
      },
      error: () => this.loading.set(false),
    });
  }

  addEntry(): void {
    const firstGuid = this.bindingOptions()[0]?.guid ?? '';
    this.damageEntries.update(current => [
      ...current,
      { stockBindingGuid: firstGuid, description: '', severity: 'MINOR' },
    ]);
  }

  updateEntry(index: number, patch: Partial<DamageEntryDraft>): void {
    this.damageEntries.update(current => current.map((entry, i) => i === index ? { ...entry, ...patch } : entry));
  }

  removeEntry(index: number): void {
    this.damageEntries.update(current => current.filter((_, i) => i !== index));
  }

  submit(): void {
    if (!this.processGuid || this.submitting()) { return; }
    if (!this.isAvailable()) {
      this.snackBar.open('This action is not currently available.', 'Close', { duration: 4000 });
      return;
    }
    if (this.damageEntries().length === 0 || this.damageEntries().some(e => !e.stockBindingGuid)) {
      this.snackBar.open('Add at least one valid damage entry.', 'Close', { duration: 3000 });
      return;
    }
    const dto: RecordDamagesDto = {
      damages: this.damageEntries().map(e => ({
        stock_binding_guid: e.stockBindingGuid,
        description: e.description.trim() || e.description,
        severity: e.severity,
      })),
    };
    this.submitting.set(true);
    this.rentalApiClient.recordDamages(this.processGuid, dto).pipe(
      finalize(() => this.submitting.set(false))
    ).subscribe({
      next: () => {
        this.snackBar.open('Damage reports recorded.', 'Close', { duration: 3000 });
        this.router.navigate(['/rental', this.processGuid]);
      },
      error: () => this.snackBar.open('The rental action failed. Please try again.', 'Close', { duration: 4000 }),
    });
  }

  protected readonly damageSeverityOptions = DAMAGE_SEVERITY_OPTIONS;
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
