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
import { VendorDataSource, VendorDataItem } from './vendor.data-source';
import { DataTableComponent, ColumnDef } from '../../shared/data-table/data-table';
import { VendorCreateDialogComponent } from './vendor-create-dialog.component';
import { VendorUpdateDialogComponent } from './vendor-update-dialog.component';

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
    @Inject(InventoryApiClient) private api: InventoryApiClient,
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

  onDeleteRow(row: VendorDataItem) {
    this.api.deleteVendor(row.vendorView.guid).pipe(
      catchError(() => EMPTY)
    ).subscribe(() => {
      this.dataSource.loadVendors(this.searchCtrl.value ?? '', 'asc', 0, 10);
      this.dataTable?.resetPage();
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(VendorCreateDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSource.loadVendors(this.searchCtrl.value ?? '', 'asc', 0, 10);
      }
    });
  }

  onEditRow(row: VendorDataItem) {
    const dialogRef = this.dialog.open(VendorUpdateDialogComponent, { data: row.vendorView });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataSource.loadVendors(this.searchCtrl.value ?? '', 'asc', 0, 10);
      }
    });
  }
}
