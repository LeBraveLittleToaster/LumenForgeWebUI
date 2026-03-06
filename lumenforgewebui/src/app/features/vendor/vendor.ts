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
import { VendorDataSource, VendorDataItem } from './vendor.data-source';
import { DataTableComponent, ColumnDef } from '../../shared/data-table/data-table';

@Component({
  selector: 'app-vendor-create-dialog',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, CommonModule],
  template: `
    <h2 mat-dialog-title>Create Vendor</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Vendor name" required>
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Name is required</mat-error>
          }
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
export class VendorCreateDialogComponent {
  private fb = inject(FormBuilder);
  private isSendingSubject = new BehaviorSubject<boolean>(false);
  isSending$ = this.isSendingSubject.asObservable();

  form = this.fb.group({
    name: ['', Validators.required]
  });

  constructor(
    private dialogRef: MatDialogRef<VendorCreateDialogComponent>,
    private api: InventoryApiClient
  ) {}

  create() {
    if (this.form.invalid) return;
    this.isSendingSubject.next(true);
    this.api.createVendor({ name: this.form.value.name! }).pipe(
      catchError(() => EMPTY),
      finalize(() => this.isSendingSubject.next(false))
    ).subscribe(vendor => {
      this.dialogRef.close(vendor);
    });
  }
}

@Component({
  selector: 'app-vendor',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    DataTableComponent
  ],
  templateUrl: './vendor.html',
  styleUrl: './vendor.css',
})
export class Vendor implements OnInit {
  columns: ColumnDef<VendorDataItem>[] = [
    { key: 'guid',       header: 'GUID',       cell: r => r.vendorView.guid },
    { key: 'name',       header: 'Name',       cell: r => r.vendorView.name },
    { key: 'created_at', header: 'Created At', cell: r => new Date(r.vendorView.created_at).toDateString() },
    { key: 'updated_at', header: 'Updated At', cell: r => new Date(r.vendorView.updated_at).toDateString() },
  ];

  dataSource!: VendorDataSource;
  searchCtrl = new FormControl('');

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  constructor(
    private api: InventoryApiClient,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.dataSource = new VendorDataSource(this.api);
    this.dataSource.loadVendors('', 'asc', 0, 10);
  }

  onSearch() {
    const value = this.searchCtrl.value ?? '';
    this.dataSource.loadVendors(value, 'asc', 0, 10);
    this.dataTable?.resetPage();
  }

  clearSearch() {
    this.searchCtrl.setValue('');
    this.onSearch();
  }

  onPage(event: PageEvent) {
    this.dataSource.loadVendors(this.searchCtrl.value ?? '', 'asc', event.pageIndex, event.pageSize);
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(VendorCreateDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSource.loadVendors(this.searchCtrl.value ?? '', 'asc', 0, 10);
      }
    });
  }
}
