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
import { ApproveExtensionDto, RentalActionView, RentalApiClient, RentalProcessView } from '@lumenforge/api-client';
import { finalize, forkJoin } from 'rxjs';
import {
  formatDateOnly, getCurrentStage, getCustomerDisplay, getExtensionOptions,
  getProcessGuid, getRentalNotes, getRentalPurpose, getRentalSubtitle,
  getRentalTitle, getRequestedEnd, getRequestedStart, normalizeActionType,
} from '../../rental-process.utils';
import { ActionContainerComponent } from '../../../../shared/action-container/action-container';

@Component({
  selector: 'app-rental-action-approve-extension',
  standalone: true,
  imports: [
    ActionContainerComponent, ReactiveFormsModule, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatProgressSpinnerModule,
    MatSelectModule, MatSnackBarModule, RouterLink,
  ],
  templateUrl: './rental-action-approve-extension.html',
  styleUrl: './rental-action-approve-extension.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionApproveExtension implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly rentalApiClient = inject(RentalApiClient);

  readonly process = signal<RentalProcessView | null>(null);
  readonly availableActions = signal<RentalActionView[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);

  readonly extensionGuid = new FormControl('', { nonNullable: true });
  readonly comment = new FormControl('', { nonNullable: true });

  processGuid = '';

  readonly isAvailable = computed(() =>
    this.availableActions().some(a => normalizeActionType(a) === 'approve-extension')
  );

  readonly extensionOptions = computed(() => getExtensionOptions(this.process()));

  ngOnInit(): void {
    this.processGuid = this.route.snapshot.paramMap.get('processGuid') ?? '';
    if (!this.processGuid) { this.loading.set(false); return; }

    forkJoin({
      process: this.rentalApiClient.getRental(this.processGuid, ['extensions']),
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
    if (!this.extensionGuid.value) {
      this.snackBar.open('Extension request is required.', 'Close', { duration: 3000 });
      return;
    }
    const dto: ApproveExtensionDto = {
      extension_guid: this.extensionGuid.value,
      comment: this.toNullable(this.comment.value),
    };
    this.submitting.set(true);
    this.rentalApiClient.approveExtension(this.processGuid, dto).pipe(
      finalize(() => this.submitting.set(false))
    ).subscribe({
      next: () => {
        this.snackBar.open('Extension approved.', 'Close', { duration: 3000 });
        this.router.navigate(['/rental', this.processGuid]);
      },
      error: () => this.snackBar.open('The rental action failed. Please try again.', 'Close', { duration: 4000 }),
    });
  }

  private toNullable(value: string): string | null {
    return value.trim() ? value.trim() : null;
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
