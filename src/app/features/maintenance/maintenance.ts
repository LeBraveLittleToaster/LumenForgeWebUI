import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  AuthService,
  MaintenanceApiClient,
  MaintenanceStatusView,
  Permissions,
} from '@lumenforge/api-client';
import { catchError, EMPTY, of } from 'rxjs';
import { DataTableComponent, ColumnDef } from '../../shared/data-table/data-table';
import { MaintenanceBacklogDialogComponent } from './maintenance-backlog-dialog';
import { MaintenanceDataItem, MaintenanceDataSource } from './maintenance.data-source';
import { MaintenanceStatusManagerDialogComponent } from './maintenance-status-manager-dialog';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
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
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly rowRouterLink = (row: MaintenanceDataItem): any[] => ['/maintenance/backlogs', row.backlog.uuid];

  columns: ColumnDef<MaintenanceDataItem>[] = [
    { key: 'uuid', header: 'Backlog ID', cell: r => r.backlog.uuid },
    { key: 'issue', header: 'Issue', cell: r => r.backlog.issue_summary },
    { key: 'status', header: 'Status', cell: r => r.backlog.status.name },
    { key: 'quantity', header: 'Qty Affected', cell: r => String(r.backlog.quantity_affected) },
    { key: 'reportedAt', header: 'Reported At', cell: r => new Date(r.backlog.reported_at).toDateString() },
    {
      key: 'resolvedAt',
      header: 'Resolved At',
      cell: r => r.backlog.resolved_at ? new Date(r.backlog.resolved_at).toDateString() : 'Unresolved'
    },
  ];

  dataSource!: MaintenanceDataSource;
  statuses: MaintenanceStatusView[] = [];

  searchCtrl = new FormControl('');
  statusCtrl = new FormControl<string | null>(null);
  unresolvedOnlyCtrl = new FormControl(true, { nonNullable: true });

  canCreateBacklog = false;
  canDeleteBacklog = false;
  canManageStatuses = false;

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  constructor(
    @Inject(MaintenanceApiClient) private readonly maintenanceApiClient: MaintenanceApiClient,
    @Inject(AuthService) private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.canCreateBacklog = this.authService.hasPermission(Permissions.MaintenanceCreate);
    this.canDeleteBacklog = this.authService.hasPermission(Permissions.MaintenanceDelete);
    this.canManageStatuses = this.authService.hasAnyPermission(
      Permissions.MaintenanceCreate,
      Permissions.MaintenanceUpdate,
      Permissions.MaintenanceDelete
    );

    this.dataSource = new MaintenanceDataSource(this.maintenanceApiClient);
    this.loadStatuses();
    this.loadBacklogs(0, 10);
  }

  openCreateBacklogDialog(): void {
    this.dialog.open(MaintenanceBacklogDialogComponent, {
      width: '700px',
      data: { mode: 'create' as const },
    }).afterClosed().subscribe(result => {
      if (!result) return;
      this.loadBacklogs(0, 10);
      this.dataTable?.resetPage();
    });
  }

  openStatusManagerDialog(): void {
    this.dialog.open(MaintenanceStatusManagerDialogComponent, {
      width: '720px',
    }).afterClosed().subscribe(result => {
      if (!result) return;
      this.loadStatuses();
      this.loadBacklogs(0, 10);
    });
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
    this.maintenanceApiClient.deleteBacklog(row.backlog.uuid).pipe(
      catchError(() => {
        this.snackBar.open('Failed to delete backlog entry.', 'Close', { duration: 4000 });
        return EMPTY;
      })
    ).subscribe(() => {
      this.snackBar.open('Backlog entry deleted.', 'Close', { duration: 3000 });
      this.loadBacklogs(0, 10);
      this.dataTable?.resetPage();
    });
  }

  private loadStatuses(): void {
    this.maintenanceApiClient.listStatuses({ limit: 200, offset: 0 }).pipe(
      catchError(() => of([] as MaintenanceStatusView[]))
    ).subscribe(statuses => {
      this.statuses = statuses;
    });
  }

  private loadBacklogs(pageIndex: number, pageSize: number): void {
    this.dataSource.loadBacklogs({
      search: this.searchCtrl.value ?? undefined,
      statusUuid: this.statusCtrl.value,
      unresolvedOnly: this.unresolvedOnlyCtrl.value,
      offset: pageIndex * pageSize,
      limit: pageSize,
    });
  }

}
