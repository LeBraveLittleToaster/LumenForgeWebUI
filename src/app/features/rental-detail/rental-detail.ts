import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RentalApiClient, RentalStatusView, RentalTransitionsView, RentalView } from '@lumenforge/api-client';
import { catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'app-rental-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatChipsModule, MatDividerModule, MatIconModule, RouterLink],
  templateUrl: './rental-detail.html',
  styleUrl: './rental-detail.scss',
})
export class RentalDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  rentalGuid = '';
  rental: RentalView | null = null;
  transitions: RentalTransitionsView | null = null;

  constructor(@Inject(RentalApiClient) private readonly rentalApiClient: RentalApiClient) {}

  ngOnInit(): void {
    this.rentalGuid = this.route.snapshot.paramMap.get('rentalGuid') ?? '';
    if (!this.rentalGuid) {
      return;
    }

    this.loadRental();
    this.loadTransitions();
  }

  transitionTo(status: RentalStatusView): void {
    if (!this.rentalGuid) {
      return;
    }

    this.rentalApiClient.transitionRentalStatus(this.rentalGuid, {
      target_status_guid: status.uuid,
    }).pipe(
      catchError(() => {
        this.snackBar.open('Transition failed. Please try again.', 'Close', { duration: 4000 });
        return EMPTY;
      })
    ).subscribe(updated => {
      this.rental = updated;
      this.loadTransitions();
      this.snackBar.open(`Rental moved to ${this.prettifyStatus(status.name)}.`, 'Close', { duration: 2500 });
    });
  }

  prettifyStatus(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  private loadRental(): void {
    this.rentalApiClient.getRental(this.rentalGuid, ['Items']).subscribe(result => {
      this.rental = result;
    });
  }

  private loadTransitions(): void {
    this.rentalApiClient.listAllowedTransitions(this.rentalGuid).subscribe(result => {
      this.transitions = result;
    });
  }
}
