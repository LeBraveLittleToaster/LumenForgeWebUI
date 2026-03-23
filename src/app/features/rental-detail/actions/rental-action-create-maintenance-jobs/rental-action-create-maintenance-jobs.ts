import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CreateMaintenanceJobsDto, RentalActionView, RentalApiClient, RentalProcessView } from '@lumenforge/api-client';
import { finalize, forkJoin } from 'rxjs';
import {
  formatDateOnly, getCurrentStage, getCustomerDisplay, getProcessGuid,
  getRentalBindingOptions, getRentalNotes, getRentalPurpose, getRentalSubtitle,
  getRentalTitle, getRequestedEnd, getRequestedStart, normalizeActionType,
} from '../../rental-process.utils';
import { ActionContainerComponent } from '../../../../shared/action-container/action-container';

@Component({
  selector: 'app-rental-action-create-maintenance-jobs',
  standalone: true,
  imports: [
    ActionContainerComponent, MatButtonModule, MatCardModule,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule, RouterLink,
  ],
  templateUrl: './rental-action-create-maintenance-jobs.html',
  styleUrl: './rental-action-create-maintenance-jobs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionCreateMaintenanceJobs implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly rentalApiClient = inject(RentalApiClient);

  readonly process = signal<RentalProcessView | null>(null);
  readonly availableActions = signal<RentalActionView[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly selectedBindingGuids = signal<string[]>([]);

  processGuid = '';

  readonly isAvailable = computed(() =>
    this.availableActions().some(a => normalizeActionType(a) === 'create-maintenance-jobs')
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
      },
      error: () => this.loading.set(false),
    });
  }

  toggleBinding(bindingGuid: string): void {
    this.selectedBindingGuids.update(current =>
      current.includes(bindingGuid) ? current.filter(g => g !== bindingGuid) : [...current, bindingGuid]
    );
  }

  submit(): void {
    if (!this.processGuid || this.submitting()) { return; }
    if (!this.isAvailable()) {
      this.snackBar.open('This action is not currently available.', 'Close', { duration: 4000 });
      return;
    }
    if (this.selectedBindingGuids().length === 0) {
      this.snackBar.open('Select at least one damaged stock binding.', 'Close', { duration: 3000 });
      return;
    }
    const dto: CreateMaintenanceJobsDto = { damaged_stock_binding_guids: this.selectedBindingGuids() };
    this.submitting.set(true);
    this.rentalApiClient.createMaintenanceJobs(this.processGuid, dto).pipe(
      finalize(() => this.submitting.set(false))
    ).subscribe({
      next: () => {
        this.snackBar.open('Maintenance jobs created.', 'Close', { duration: 3000 });
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
