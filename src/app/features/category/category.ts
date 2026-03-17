import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { catchError, EMPTY } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { InventoryApiClient } from '@lumenforge/api-client';
import { CategoryDataSource, CategoryDataItem } from './category.data-source';
import { DataTableComponent, ColumnDef } from '../../shared/data-table/data-table';
import { CategoryCreateDialogComponent } from './category-create-dialog.component';
import { CategoryUpdateDialogComponent } from './category-update-dialog.component';

@Component({
  selector: 'app-category',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    DataTableComponent
  ],
  templateUrl: './category.html',
  styleUrl: './category.css',
})
export class Category implements OnInit {
  columns: ColumnDef<CategoryDataItem>[] = [
    { key: 'guid',        header: 'GUID',        cell: r => r.categoryView.guid },
    { key: 'name',        header: 'Name',        cell: r => r.categoryView.name },
    { key: 'description', header: 'Description', cell: r => r.categoryView.description ?? '—' },
    { key: 'created_at',  header: 'Created At',  cell: r => new Date(r.categoryView.created_at).toDateString() },
    { key: 'updated_at',  header: 'Updated At',  cell: r => new Date(r.categoryView.updated_at).toDateString() },
  ];

  dataSource!: CategoryDataSource;
  searchCtrl = new FormControl('');

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  constructor(
    @Inject(InventoryApiClient) private api: InventoryApiClient,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.dataSource = new CategoryDataSource(this.api);
    this.dataSource.loadCategories('', 'asc', 0, 10);
  }

  onSearch() {
    const value = this.searchCtrl.value ?? '';
    this.dataSource.loadCategories(value, 'asc', 0, 10);
    this.dataTable?.resetPage();
  }

  clearSearch() {
    this.searchCtrl.setValue('');
    this.onSearch();
  }

  onPage(event: PageEvent) {
    this.dataSource.loadCategories(this.searchCtrl.value ?? '', 'asc', event.pageIndex, event.pageSize);
  }

  onDeleteRow(row: CategoryDataItem) {
    this.api.deleteCategory(row.categoryView.guid).pipe(
      catchError(() => EMPTY)
    ).subscribe(() => {
      this.dataSource.loadCategories(this.searchCtrl.value ?? '', 'asc', 0, 10);
      this.dataTable?.resetPage();
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CategoryCreateDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSource.loadCategories(this.searchCtrl.value ?? '', 'asc', 0, 10);
      }
    });
  }

  onEditRow(row: CategoryDataItem) {
    const dialogRef = this.dialog.open(CategoryUpdateDialogComponent, { data: row.categoryView });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSource.loadCategories(this.searchCtrl.value ?? '', 'asc', 0, 10);
      }
    });
  }
}
