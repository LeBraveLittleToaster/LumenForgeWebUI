import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MaintenanceApiClient, MaintenanceStatusView } from '@lumenforge/api-client';
import { catchError, EMPTY, of } from 'rxjs';
import { DeleteConfirmDialogComponent } from '../../shared/data-table/data-table';
import { MaintenanceStatusDialogComponent } from './maintenance-status-dialog';

@Component({
  selector: 'app-maintenance-status-manager-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatListModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>Status Management</h2>
    <mat-dialog-content>
      <div class="toolbar">
        <button mat-flat-button (click)="openCreate()">
          <mat-icon>add</mat-icon>
          Create Status
        </button>
      </div>

      @if (statuses.length === 0) {
        <p class="empty">No statuses found.</p>
      } @else {
        <mat-list>
          @for (status of statuses; track status.uuid) {
            <mat-list-item>
              <div class="row-content">
                <div>
                  <div class="name">{{ status.name }}</div>
                  <div class="desc">{{ status.description || 'No description' }}</div>
                </div>
                <div class="actions">
                  <button mat-icon-button aria-label="Edit" (click)="openEdit(status)"><mat-icon>edit</mat-icon></button>
                  <button mat-icon-button aria-label="Delete" (click)="deleteStatus(status)"><mat-icon>delete_outline</mat-icon></button>
                </div>
              </div>
            </mat-list-item>
          }
        </mat-list>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Done</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .toolbar { display: flex; justify-content: flex-end; margin-bottom: 10px; }
    .empty { margin: 8px 0; color: var(--mat-sys-on-surface-variant); }
    .row-content { display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 12px; }
    .name { font-weight: 600; }
    .desc { color: var(--mat-sys-on-surface-variant); font-size: 0.85rem; }
    .actions { display: flex; gap: 2px; }
  `],
})
export class MaintenanceStatusManagerDialogComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  statuses: MaintenanceStatusView[] = [];

  constructor(
    @Inject(MaintenanceApiClient) private readonly maintenanceApiClient: MaintenanceApiClient,
    private readonly dialogRef: MatDialogRef<MaintenanceStatusManagerDialogComponent>
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  openCreate(): void {
    this.dialog.open(MaintenanceStatusDialogComponent, {
      width: '560px',
      data: { mode: 'create' as const },
    }).afterClosed().subscribe(result => {
      if (result) this.refresh();
    });
  }

  openEdit(status: MaintenanceStatusView): void {
    this.dialog.open(MaintenanceStatusDialogComponent, {
      width: '560px',
      data: { mode: 'edit' as const, status },
    }).afterClosed().subscribe(result => {
      if (result) this.refresh();
    });
  }

  deleteStatus(status: MaintenanceStatusView): void {
    this.dialog.open(DeleteConfirmDialogComponent).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.maintenanceApiClient.deleteStatus(status.uuid).pipe(
        catchError(() => {
          this.snackBar.open('Failed to delete status.', 'Close', { duration: 4000 });
          return EMPTY;
        })
      ).subscribe(() => {
        this.snackBar.open('Status deleted.', 'Close', { duration: 3000 });
        this.refresh();
      });
    });
  }

  close(): void {
    this.dialogRef.close(true);
  }

  private refresh(): void {
    this.maintenanceApiClient.listStatuses({ limit: 200, offset: 0 }).pipe(
      catchError(() => of([] as MaintenanceStatusView[]))
    ).subscribe(statuses => this.statuses = statuses);
  }
}
