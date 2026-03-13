import { CommonModule, Location } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  AuthService,
  MaintenanceApiClient,
  MaintenanceJobView,
  Permissions,
} from '@lumenforge/api-client';
import { catchError, distinctUntilChanged, EMPTY, filter, map, Observable, of, startWith, switchMap } from 'rxjs';
import { DeleteConfirmDialogComponent } from '../../shared/data-table/data-table';
import { getMaintenanceStatusLabel, MAINTENANCE_STATUS_OPTIONS } from './maintenance-status-options';

interface JobDetailState {
  loading: boolean;
  job: MaintenanceJobView | null;
  error: string | null;
}

@Component({
  selector: 'app-maintenance-job-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './maintenance-job-detail.html',
  styleUrl: './maintenance-job-detail.css',
})
export class MaintenanceJobDetail implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly statusOptions = MAINTENANCE_STATUS_OPTIONS;

  readonly editForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(256)]],
    description: ['', [Validators.required, Validators.maxLength(4000)]],
    status: [0, [Validators.required]],
  });

  state$!: Observable<JobDetailState>;
  canUpdate = false;
  canDelete = false;
  currentJob: MaintenanceJobView | null = null;
  saving = false;

  constructor(
    private readonly route: ActivatedRoute,
    @Inject(MaintenanceApiClient) private readonly maintenanceApiClient: MaintenanceApiClient,
    @Inject(AuthService) private readonly authService: AuthService,
    private readonly location: Location
  ) {}

  ngOnInit(): void {
    this.canUpdate = this.authService.hasPermission(Permissions.MaintenanceUpdate);
    this.canDelete = this.authService.hasPermission(Permissions.MaintenanceDelete);

    const jobGuid$ = this.route.paramMap.pipe(
      map(params => params.get('jobGuid')),
      filter((guid): guid is string => !!guid),
      distinctUntilChanged()
    );

    this.state$ = jobGuid$.pipe(
      switchMap(jobGuid =>
        this.maintenanceApiClient.getJob(jobGuid, 'tasks').pipe(
          map(job => {
            this.currentJob = job;
            this.editForm.patchValue({
              name: job.name,
              description: job.description,
              status: job.status,
            });
            return ({ loading: false, job, error: null } as JobDetailState);
          }),
          catchError(() => of({ loading: false, job: null, error: 'Failed to load maintenance report details.' } as JobDetailState)),
          startWith({ loading: true, job: null, error: null } as JobDetailState)
        )
      )
    );
  }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    if (!this.canUpdate || !this.currentJob || this.editForm.invalid || this.saving) {
      return;
    }

    this.saving = true;

    this.maintenanceApiClient.updateJob(this.currentJob.guid, {
      name: this.editForm.controls.name.value.trim(),
      description: this.editForm.controls.description.value.trim(),
      status: this.editForm.controls.status.value,
    }).pipe(
      catchError(() => {
        this.snackBar.open('Failed to update maintenance report.', 'Close', { duration: 4000 });
        return EMPTY;
      })
    ).subscribe(updated => {
      this.currentJob = updated;
      this.editForm.patchValue({
        name: updated.name,
        description: updated.description,
        status: updated.status,
      });
      this.state$ = of({ loading: false, job: updated, error: null });
      this.saving = false;
      this.snackBar.open('Maintenance report updated.', 'Close', { duration: 3000 });
    });
  }

  delete(job: MaintenanceJobView): void {
    if (!this.canDelete) {
      return;
    }

    this.dialog.open(DeleteConfirmDialogComponent).afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        return;
      }

      this.maintenanceApiClient.deleteJob(job.guid).pipe(
        catchError(() => {
          this.snackBar.open('Failed to delete maintenance report.', 'Close', { duration: 4000 });
          return EMPTY;
        })
      ).subscribe(() => {
        this.snackBar.open('Maintenance report deleted.', 'Close', { duration: 3000 });
        this.goBack();
      });
    });
  }

  statusLabel(value: number): string {
    return getMaintenanceStatusLabel(value);
  }
}
