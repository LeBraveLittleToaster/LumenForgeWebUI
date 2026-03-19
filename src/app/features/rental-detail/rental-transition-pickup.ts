import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RentalApiClient, RentalView } from '@lumenforge/api-client';
import { catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'app-rental-transition-pickup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    RouterLink,
  ],
  templateUrl: './rental-transition-pickup.html',
  styleUrl: './rental-transition-page.scss',
})
export class RentalTransitionPickup implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  rentalGuid = '';
  statusGuid = '';
  rental: RentalView | null = null;
  submitting = false;

  readonly form = this.fb.nonNullable.group({
    allItemsVerified: [false],
    notes: [''],
  });

  constructor(@Inject(RentalApiClient) private readonly rentalApiClient: RentalApiClient) {}

  ngOnInit(): void {
    this.rentalGuid = this.route.snapshot.paramMap.get('rentalGuid') ?? '';
    this.statusGuid = this.route.snapshot.paramMap.get('statusGuid') ?? '';
    if (this.rentalGuid) {
      this.rentalApiClient.getRental(this.rentalGuid, ['Items']).subscribe(r => (this.rental = r));
    }
  }

  onSubmit(): void {
    if (this.submitting) return;
    this.submitting = true;
    const notes = this.form.value.notes?.trim() || null;

    this.rentalApiClient
      .transitionRentalStatus(this.rentalGuid, { target_status_guid: this.statusGuid, reason: notes })
      .pipe(
        catchError(() => {
          this.submitting = false;
          this.snackBar.open('Failed to record pick-up. Please try again.', 'Close', { duration: 4000 });
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.snackBar.open('Equipment pick-up confirmed.', 'Close', { duration: 3000 });
        this.router.navigate(['/rental', this.rentalGuid]);
      });
  }

  prettifyStatus(value: string | null | undefined): string {
    if (!value) return '-';
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
