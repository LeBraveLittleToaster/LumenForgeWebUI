import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, catchError, EMPTY, finalize } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { InventoryApiClient } from '../../core/api/inventory/inventory-api.client';
import { CategoryDataSource, CategoryDataItem } from './category.data-source';
import { DataTableComponent, ColumnDef } from '../../shared/data-table/data-table';

@Component({
  selector: 'app-category-create-dialog',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, CommonModule],
  template: `
    <h2 mat-dialog-title>Create Category</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Category name" required>
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" placeholder="Category description" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-button [disabled]="form.invalid || (isSending$ | async)" (click)="create()">Create</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; min-width: 320px; padding-top: 8px; }
    .full-width { width: 100%; }
  `]
})
export class CategoryCreateDialogComponent {
  private fb = inject(FormBuilder);
  private isSendingSubject = new BehaviorSubject<boolean>(false);
  isSending$ = this.isSendingSubject.asObservable();

  form = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  constructor(
    private dialogRef: MatDialogRef<CategoryCreateDialogComponent>,
    private api: InventoryApiClient
  ) {}

  create() {
    if (this.form.invalid) return;
    this.isSendingSubject.next(true);
    this.api.createCategory({
      name: this.form.value.name!,
      description: this.form.value.description || null
    }).pipe(
      catchError(() => EMPTY),
      finalize(() => this.isSendingSubject.next(false))
    ).subscribe(category => {
      this.dialogRef.close(category);
    });
  }
}

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
    private api: InventoryApiClient,
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
}
