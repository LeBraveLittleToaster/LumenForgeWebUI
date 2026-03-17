import { Component, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import { PageEvent, MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

export interface ColumnDef<T = any> {
  key: string;
  header: string;
  cell: (row: T) => string | null | undefined;
}

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Confirm Delete</h2>
    <mat-dialog-content>Are you sure you want to delete this entry? This action cannot be undone.</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `
})
export class DeleteConfirmDialogComponent {}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatProgressSpinner, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTableComponent {
  private dialog = inject(MatDialog);

  @Input() dataSource!: DataSource<any>;
  @Input() columns!: ColumnDef[];
  @Input() loading$!: Observable<boolean>;
  @Input() length$!: Observable<number>;
  @Input() pageSize = 10;
  @Input() pageSizeOptions = [5, 10, 25, 100];
  @Input() rowRouterLink?: (row: any) => any[];
  @Input() canDelete = false;
  @Input() canEdit = false;

  @Output() page = new EventEmitter<PageEvent>();
  @Output() deleteRow = new EventEmitter<any>();
  @Output() editRow = new EventEmitter<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  get displayedColumns(): string[] {
    const cols = this.columns.map(c => c.key);
    if (this.canEdit) cols.push('edit');
    if (this.canDelete) cols.push('delete');
    return cols;
  }

  resetPage() {
    this.paginator?.firstPage();
  }

  onDeleteClick(event: Event, row: any) {
    event.stopPropagation();
    this.dialog.open(DeleteConfirmDialogComponent).afterClosed().subscribe(confirmed => {
      if (confirmed) this.deleteRow.emit(row);
    });
  }
}
