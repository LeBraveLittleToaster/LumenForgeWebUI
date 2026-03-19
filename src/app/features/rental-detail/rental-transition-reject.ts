import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RentalApiClient, RentalView } from '@lumenforge/api-client';
import { catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'app-rental-transition-reject',
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
  templateUrl: './rental-transition-reject.html',
  styleUrl: './rental-transition-page.scss',
})
export class RentalTransitionReject implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  rentalGuid = '';
  statusGuid = '';
  rental: RentalView | null = null;
  submitting = false;

  readonly form = this.fb.nonNullable.group({
    reason: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  constructor(@Inject(RentalApiClient) private readonly rentalApiClient: RentalApiClient) {}

  ngOnInit(): void {
    this.rentalGuid = this.route.snapshot.paramMap.get('rentalGuid') ?? '';
    this.statusGuid = this.route.snapshot.paramMap.get('statusGuid') ?? '';
    if (this.rentalGuid) {
      this.rentalApiClient.getRental(this.rentalGuid).subscribe(r => (this.rental = r));
    }
  }

  onSubmit(): void {
    if (this.submitting || this.form.invalid) return;
    this.submitting = true;

    this.rentalApiClient
      .transitionRentalStatus(this.rentalGuid, {
        target_status_guid: this.statusGuid,
        reason: this.form.value.reason,
      })
      .pipe(
        catchError(() => {
          this.submitting = false;
          this.snackBar.open('Failed to reject the rental. Please try again.', 'Close', { duration: 4000 });
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.snackBar.open('Rental request rejected.', 'Close', { duration: 3000 });
        this.router.navigate(['/rental', this.rentalGuid]);
      });
  }

  prettifyStatus(value: string | null | undefined): string {
    if (!value) return '-';
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
