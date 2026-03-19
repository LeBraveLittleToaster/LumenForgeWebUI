import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RentalApiClient, RentalStatusView, RentalTransitionsView, RentalView } from '@lumenforge/api-client';
import { catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'app-rental-transition-generic',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    RouterLink,
  ],
  templateUrl: './rental-transition-generic.html',
  styleUrl: './rental-transition-page.scss',
})
export class RentalTransitionGeneric implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  rentalGuid = '';
  statusGuid = '';
  rental: RentalView | null = null;
  targetStatus: RentalStatusView | null = null;
  submitting = false;

  readonly form = this.fb.nonNullable.group({
    reason: [''],
  });

  constructor(@Inject(RentalApiClient) private readonly rentalApiClient: RentalApiClient) {}

  ngOnInit(): void {
    this.rentalGuid = this.route.snapshot.paramMap.get('rentalGuid') ?? '';
    this.statusGuid = this.route.snapshot.paramMap.get('statusGuid') ?? '';
    if (this.rentalGuid) {
      this.rentalApiClient.getRental(this.rentalGuid).subscribe(r => (this.rental = r));
      this.rentalApiClient.listAllowedTransitions(this.rentalGuid).subscribe((t: RentalTransitionsView) => {
        this.targetStatus = t.allowed.find(s => s.uuid === this.statusGuid) ?? null;
      });
    }
  }

  onSubmit(): void {
    if (this.submitting) return;
    this.submitting = true;
    const reason = this.form.value.reason?.trim() || null;

    this.rentalApiClient
      .transitionRentalStatus(this.rentalGuid, { target_status_guid: this.statusGuid, reason })
      .pipe(
        catchError(() => {
          this.submitting = false;
          this.snackBar.open('Transition failed. Please try again.', 'Close', { duration: 4000 });
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.snackBar.open(`Rental moved to ${this.prettifyStatus(this.targetStatus?.name)}.`, 'Close', { duration: 3000 });
        this.router.navigate(['/rental', this.rentalGuid]);
      });
  }

  prettifyStatus(value: string | null | undefined): string {
    if (!value) return '-';
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
