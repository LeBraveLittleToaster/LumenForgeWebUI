import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {
  AuthService,
  MaintenanceApiClient,
  Permissions,
} from '@lumenforge/api-client';
import { catchError, EMPTY, of } from 'rxjs';
import { DataTableComponent, ColumnDef } from '../../shared/data-table/data-table';
import { MaintenanceDataItem, MaintenanceDataSource } from './maintenance.data-source';
import { getMaintenanceStatusLabel, MAINTENANCE_STATUS_OPTIONS } from './maintenance-status-options';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    DataTableComponent,
  ],
  templateUrl: './maintenance.html',
  styleUrl: './maintenance.css',
})
export class Maintenance implements OnInit {
  private readonly snackBar = inject(MatSnackBar);

  readonly statusOptions = MAINTENANCE_STATUS_OPTIONS;
  readonly rowRouterLink = (row: MaintenanceDataItem): any[] => ['/maintenance/jobs', row.job.guid];

  columns: ColumnDef<MaintenanceDataItem>[] = [
    { key: 'guid', header: 'Report ID', cell: r => r.job.guid },
    { key: 'name', header: 'Name', cell: r => r.job.name },
    { key: 'status', header: 'Status', cell: r => this.getStatusLabel(r.job.status) },
    { key: 'devices', header: 'Affected Devices', cell: r => String(r.job.device_guids.length) },
    { key: 'createdAt', header: 'Created At', cell: r => new Date(r.job.created_at).toDateString() },
    {
      key: 'resolvedAt',
      header: 'Resolved At',
      cell: r => r.job.resolved_at ? new Date(r.job.resolved_at).toDateString() : 'Unresolved'
    },
  ];

  dataSource!: MaintenanceDataSource;

  searchCtrl = new FormControl('');
  statusCtrl = new FormControl<number | null>(null);
  unresolvedOnlyCtrl = new FormControl(true, { nonNullable: true });

  canCreateBacklog = false;
  canDeleteBacklog = false;

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  constructor(
    @Inject(MaintenanceApiClient) private readonly maintenanceApiClient: MaintenanceApiClient,
    @Inject(AuthService) private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.canCreateBacklog = this.authService.hasPermission(Permissions.MaintenanceCreate);
    this.canDeleteBacklog = this.authService.hasPermission(Permissions.MaintenanceDelete);

    this.dataSource = new MaintenanceDataSource(this.maintenanceApiClient);
    this.loadBacklogs(0, 10);
  }

  openCreateBacklogDialog(): void {
    void this.router.navigate(['/maintenance/create']);
  }

  onSearch(): void {
    this.loadBacklogs(0, 10);
    this.dataTable?.resetPage();
  }

  clearSearch(): void {
    this.searchCtrl.setValue('');
    this.onSearch();
  }

  onFiltersChanged(): void {
    this.loadBacklogs(0, 10);
    this.dataTable?.resetPage();
  }

  onPage(event: PageEvent): void {
    this.loadBacklogs(event.pageIndex, event.pageSize);
  }

  onDeleteRow(row: MaintenanceDataItem): void {
    this.maintenanceApiClient.deleteJob(row.job.guid).pipe(
      catchError(() => {
        this.snackBar.open('Failed to delete maintenance report.', 'Close', { duration: 4000 });
        return EMPTY;
      })
    ).subscribe(() => {
      this.snackBar.open('Maintenance report deleted.', 'Close', { duration: 3000 });
      this.loadBacklogs(0, 10);
      this.dataTable?.resetPage();
    });
  }

  private loadBacklogs(pageIndex: number, pageSize: number): void {
    this.dataSource.loadJobs({
      search: this.searchCtrl.value ?? undefined,
      status: this.statusCtrl.value,
      unresolvedOnly: this.unresolvedOnlyCtrl.value,
      offset: pageIndex * pageSize,
      limit: pageSize,
    });
  }

  private getStatusLabel(status: number): string {
    return getMaintenanceStatusLabel(status);
  }

}
