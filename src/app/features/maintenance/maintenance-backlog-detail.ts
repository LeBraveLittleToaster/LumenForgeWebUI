import { CommonModule, Location } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  MaintenanceApiClient,
  MaintenanceBacklogView,
  Permissions,
  AuthService,
} from '@lumenforge/api-client';
import { catchError, distinctUntilChanged, EMPTY, filter, map, Observable, of, startWith, switchMap } from 'rxjs';
import { DeleteConfirmDialogComponent } from '../../shared/data-table/data-table';
import { MaintenanceBacklogDialogComponent } from './maintenance-backlog-dialog';

interface BacklogDetailState {
  loading: boolean;
  backlog: MaintenanceBacklogView | null;
  error: string | null;
}

@Component({
  selector: 'app-maintenance-backlog-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './maintenance-backlog-detail.html',
  styleUrl: './maintenance-backlog-detail.css',
})
export class MaintenanceBacklogDetail implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  state$!: Observable<BacklogDetailState>;
  canUpdate = false;
  canDelete = false;

  constructor(
    private readonly route: ActivatedRoute,
    @Inject(MaintenanceApiClient) private readonly maintenanceApiClient: MaintenanceApiClient,
    @Inject(AuthService) private readonly authService: AuthService,
    private readonly location: Location
  ) {}

  ngOnInit(): void {
    this.canUpdate = this.authService.hasPermission(Permissions.MaintenanceUpdate);
    this.canDelete = this.authService.hasPermission(Permissions.MaintenanceDelete);

    const backlogUuid$ = this.route.paramMap.pipe(
      map(params => params.get('backlogUuid')),
      filter((uuid): uuid is string => !!uuid),
      distinctUntilChanged()
    );

    this.state$ = backlogUuid$.pipe(
      switchMap(backlogUuid =>
        this.maintenanceApiClient.getBacklog(backlogUuid).pipe(
          map(backlog => ({ loading: false, backlog, error: null } as BacklogDetailState)),
          catchError(() => of({ loading: false, backlog: null, error: 'Failed to load backlog details.' } as BacklogDetailState)),
          startWith({ loading: true, backlog: null, error: null } as BacklogDetailState)
        )
      )
    );

  }

  goBack(): void {
    this.location.back();
  }

  markResolved(backlog: MaintenanceBacklogView): void {
    if (!this.canUpdate || backlog.resolved_at) return;

    this.maintenanceApiClient.updateBacklog(backlog.uuid, { resolve: true }).subscribe(updated => {
      this.snackBar.open('Backlog entry marked as resolved.', 'Close', { duration: 3000 });
      this.state$ = of({ loading: false, backlog: updated, error: null });
    });
  }

  openEdit(backlog: MaintenanceBacklogView): void {
    if (!this.canUpdate) return;

    this.dialog.open(MaintenanceBacklogDialogComponent, {
      width: '700px',
      data: { mode: 'edit' as const, backlog },
    }).afterClosed().subscribe(updated => {
      if (!updated) return;
      this.snackBar.open('Backlog entry updated.', 'Close', { duration: 3000 });
      this.state$ = of({ loading: false, backlog: updated, error: null });
    });
  }

  delete(backlog: MaintenanceBacklogView): void {
    if (!this.canDelete) return;

    this.dialog.open(DeleteConfirmDialogComponent).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.maintenanceApiClient.deleteBacklog(backlog.uuid).pipe(
        catchError(() => {
          this.snackBar.open('Failed to delete backlog entry.', 'Close', { duration: 4000 });
          return EMPTY;
        })
      ).subscribe(() => {
        this.snackBar.open('Backlog entry deleted.', 'Close', { duration: 3000 });
        this.goBack();
      });
    });
  }

  formatRelatedEntity(backlog: MaintenanceBacklogView): string {
    if (backlog.device_uuid) return `Device: ${backlog.device_uuid}`;
    if (backlog.rental_item_uuid) return `Rental Item: ${backlog.rental_item_uuid}`;
    if (backlog.checklist_item_uuid) return `Checklist Item: ${backlog.checklist_item_uuid}`;
    return 'No linked entity';
  }
}
