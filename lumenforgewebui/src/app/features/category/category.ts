import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { tap } from 'rxjs/internal/operators/tap';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, catchError, EMPTY, finalize } from 'rxjs';
import { InventoryApiClient } from '../../core/api/inventory/inventory-api.client';
import { CategoryDataSource } from './category.data-source';

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
    MatTableModule, FormsModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatPaginatorModule, MatProgressSpinner,
    CommonModule, ReactiveFormsModule],
  templateUrl: './category.html',
  styleUrl: './category.css',
})
export class Category implements OnInit {

  displayedColumns: string[] = ['guid', 'name', 'description', 'created_at', 'updated_at'];
  dataSource!: CategoryDataSource;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchCtrl = new FormControl('');

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
  }

  clearSearch() {
    this.searchCtrl.setValue('');
    this.onSearch();
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(tap(() => this.loadCategoriesPage()))
      .subscribe();
  }

  loadCategoriesPage() {
    this.dataSource.loadCategories(
      this.searchCtrl.value ?? '',
      'asc',
      this.paginator.pageIndex,
      this.paginator.pageSize);
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CategoryCreateDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSource.loadCategories(this.searchCtrl.value ?? '', 'asc', 0, 10);
      }
    });
  }

  parseDate(dateStr: string) {
    return new Date(dateStr).toDateString();
  }
}
