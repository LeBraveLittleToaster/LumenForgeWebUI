import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import { PageEvent, MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

export interface ColumnDef<T = any> {
  key: string;
  header: string;
  cell: (row: T) => string | null | undefined;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatProgressSpinner, RouterLink],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTableComponent {
  @Input() dataSource!: DataSource<any>;
  @Input() columns!: ColumnDef[];
  @Input() loading$!: Observable<boolean>;
  @Input() length$!: Observable<number>;
  @Input() pageSize = 10;
  @Input() pageSizeOptions = [5, 10, 25, 100];
  @Input() rowRouterLink?: (row: any) => any[];

  @Output() page = new EventEmitter<PageEvent>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  get displayedColumns(): string[] {
    return this.columns.map(c => c.key);
  }

  resetPage() {
    this.paginator?.firstPage();
  }
}
