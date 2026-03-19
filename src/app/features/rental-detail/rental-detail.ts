import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RentalApiClient, RentalStatusView, RentalTransitionsView, RentalView } from '@lumenforge/api-client';
import { catchError, EMPTY, finalize } from 'rxjs';

@Component({
  selector: 'app-rental-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatChipsModule, MatDividerModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule, RouterLink],
  templateUrl: './rental-detail.html',
  styleUrl: './rental-detail.scss',
})
export class RentalDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  rentalGuid = '';
  rental: RentalView | null = null;
  transitions: RentalTransitionsView | null = null;
  rentalLoading = false;
  transitionsLoading = false;
  rentalError = '';
  transitionsError = '';

  constructor(@Inject(RentalApiClient) private readonly rentalApiClient: RentalApiClient) { }

  ngOnInit(): void {
    this.rentalGuid = this.route.snapshot.paramMap.get('rentalGuid') ?? '';
    if (!this.rentalGuid) {
      this.rentalError = 'No rental id was provided.';
      return;
    }

    this.loadRental();
    this.loadTransitions();
  }

  transitionTo(status: RentalStatusView): void {
    if (!this.rentalGuid) return;
    const statusId = this.getStatusId(status);
    if (!statusId) {
      this.snackBar.open('This transition is missing its status id and cannot be opened.', 'Close', { duration: 4000 });
      return;
    }

    const routeKey = this.getTransitionRoutePath(this.getStatusLabel(status));
    this.router.navigate(['/rental', this.rentalGuid, routeKey, statusId]);
  }

  private getTransitionRoutePath(statusName: string): string {
    const lower = statusName.toLowerCase();
    if (lower.includes('approv') || lower.includes('accept')) return 'approve';
    if (lower.includes('reject') || lower.includes('deny') || lower.includes('decline')) return 'reject';
    if (lower.includes('cancel')) return 'cancel';
    if (lower.includes('active') || lower.includes('pickup') || lower.includes('pick') || lower.includes('collected')) return 'pickup';
    if (lower.includes('return') || lower.includes('complet') || lower.includes('clos')) return 'return';
    return 'transition';
  }

  prettifyStatus(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    return value
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  getRentalStatusLabel(rental: RentalView | null): string {
    if (!rental) {
      return '-';
    }

    const rentalRecord = rental as unknown as Record<string, unknown>;

    const nestedStatus = this.readString(rentalRecord['rental_status'])
      ?? this.readString(rentalRecord['status']);

    return this.prettifyStatus(
      rental.rental_status_name
      ?? nestedStatus
      ?? this.readString(rentalRecord['status_name'])
      ?? this.readString(rentalRecord['current_status'])
    );
  }

  getStatusLabel(status: unknown): string {
    if (!status || typeof status !== 'object') {
      return '-';
    }

    const record = status as Record<string, unknown>;
    return this.prettifyStatus(
      this.readString(record['name'])
      ?? this.readString(record['status_name'])
      ?? this.readString(record['display_name'])
      ?? this.readString(record['label'])
      ?? this.readString(record['current'])
    );
  }

  getStatusTrackKey(status: unknown, index: number): string {
    return this.getStatusId(status) || `${this.getStatusLabel(status)}-${index}`;
  }

  private getStatusId(status: unknown): string {
    if (!status || typeof status !== 'object') {
      return '';
    }

    const record = status as Record<string, unknown>;
    return this.readString(record['uuid'])
      ?? this.readString(record['guid'])
      ?? this.readString(record['status_uuid'])
      ?? this.readString(record['status_guid'])
      ?? '';
  }

  private readString(value: unknown): string | null {
    if (typeof value === 'string' && value.trim()) {
      return value;
    }

    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const nested = record['name'] ?? record['status_name'] ?? record['display_name'] ?? record['label'];
      return typeof nested === 'string' && nested.trim() ? nested : null;
    }

    return null;
  }

  loadRental(): void {
    this.rentalLoading = true;
    this.rentalError = '';

    this.rentalApiClient.getRental(this.rentalGuid).pipe(
      finalize(() => {
        this.rentalLoading = false;
      })
    ).subscribe({
      next: result => {
        console.log('getRental success', result);
        this.rental = result;
      },
      error: err => {
        console.error('getRental error', err);
        this.rental = null;
        this.rentalError = 'Rental details could not be loaded.';
      }
    });
  }

  loadTransitions(): void {
    this.transitionsLoading = true;
    this.transitionsError = '';

    this.rentalApiClient.listAllowedTransitions(this.rentalGuid).pipe(
      finalize(() => {
        this.transitionsLoading = false;
      }),
      catchError(() => {
        this.transitions = null;
        this.transitionsError = 'Allowed transitions could not be loaded.';
        return EMPTY;
      })
    ).subscribe(result => {
      this.transitions = result;
    });
  }
}
