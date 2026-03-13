import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { InventoryApiClient } from '@lumenforge/api-client';
import { InventoryDataSource, InventoryDataItem } from './inventory.data-source';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { DataTableComponent, ColumnDef } from '../../shared/data-table/data-table';
import { catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'app-inventory',
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    FormsModule, ReactiveFormsModule,
    DataTableComponent
  ],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory implements OnInit {
  readonly rowRouterLink = (row: InventoryDataItem): any[] => {
    console.log('Row clicked:', row);
    return ['/inventory', row.deviceView.guid];
  };

  columns: ColumnDef<InventoryDataItem>[] = [
    { key: 'guid',           header: 'Device ID',      cell: r => r.deviceView.guid },
    { key: 'serialNumber',   header: 'Serial Number',  cell: r => r.deviceView.serial_number },
    { key: 'name',           header: 'Name',           cell: r => r.deviceView.name || '—' },
    { key: 'vendor',         header: 'Vendor',         cell: r => r.deviceView.vendor.name },
    { key: 'purchaseDate',   header: 'Purchase Date',  cell: r => new Date(r.deviceView.purchase_date).toDateString() },
    { key: 'created_at',     header: 'Created At',     cell: r => new Date(r.deviceView.created_at).toDateString() },
  ];

  dataSource!: InventoryDataSource;
  searchCtrl = new FormControl('');

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  constructor(@Inject(InventoryApiClient) private inventoryApiClient: InventoryApiClient) {}

  ngOnInit(): void {
    this.dataSource = new InventoryDataSource(this.inventoryApiClient);
    this.dataSource.loadDevices('', 'asc', 0, 10);
  }

  onSearch() {
    const value = this.searchCtrl.value ?? '';
    this.dataSource.loadDevices(value, 'asc', 0, 10);
    this.dataTable?.resetPage();
  }

  clearSearch() {
    this.searchCtrl.setValue('');
    this.onSearch();
  }

  onPage(event: PageEvent) {
    this.dataSource.loadDevices(this.searchCtrl.value ?? '', 'asc', event.pageIndex, event.pageSize);
  }

  onDeleteRow(row: InventoryDataItem) {
    this.inventoryApiClient.deleteDevice(row.deviceView.guid).pipe(
      catchError(() => EMPTY)
    ).subscribe(() => {
      this.dataSource.loadDevices(this.searchCtrl.value ?? '', 'asc', 0, 10);
      this.dataTable?.resetPage();
    });
  }
}
