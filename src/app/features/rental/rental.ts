import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { RentalApiClient } from '@lumenforge/api-client';
import { DataTableComponent, ColumnDef } from '../../shared/data-table/data-table';
import { RentalDataItem, RentalDataSource } from './rental.data-source';
import { formatDateOnly, getCurrentStage, getCustomerDisplay, getProcessGuid, getRentalPurpose, getRentalTitle } from '../rental-detail/rental-process.utils';

@Component({
  selector: 'app-rental',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    RouterLink,
    DataTableComponent,
  ],
  templateUrl: './rental.html',
  styleUrl: './rental.scss',
})
export class Rental implements OnInit {
  readonly rowRouterLink = (row: RentalDataItem): any[] => ['/rental', getProcessGuid(row.rental)];

  readonly columns: ColumnDef<RentalDataItem>[] = [
    { key: 'title', header: 'Title', cell: r => getRentalTitle(r.rental) },
    { key: 'event', header: 'Event', cell: r => getRentalPurpose(r.rental) },
    { key: 'status', header: 'Status', cell: r => getCurrentStage(r.rental) },
    { key: 'priority', header: 'Priority', cell: r => '-' },
    {
      key: 'window',
      header: 'Window',
      cell: r => this.formatWindow(r.rental.requested_start ?? r.rental.planned_pickup_at ?? null, r.rental.requested_end ?? r.rental.planned_return_at ?? null),
    },
    { key: 'customer', header: 'Customer', cell: r => getCustomerDisplay(r.rental) },
  ];

  dataSource!: RentalDataSource;
  readonly searchCtrl = new FormControl('', { nonNullable: true });

  @ViewChild(DataTableComponent) dataTable?: DataTableComponent;

  constructor(@Inject(RentalApiClient) private readonly rentalApiClient: RentalApiClient) {}

  ngOnInit(): void {
    this.dataSource = new RentalDataSource(this.rentalApiClient);
    this.loadRentals(0, 10);
  }

  onSearch(): void {
    this.dataTable?.resetPage();
    this.loadRentals(0, 10);
  }

  clearSearch(): void {
    this.searchCtrl.setValue('');
    this.onSearch();
  }

  onPage(event: PageEvent): void {
    this.loadRentals(event.pageIndex, event.pageSize);
  }

  private loadRentals(pageIndex: number, pageSize: number): void {
    this.dataSource.loadRentals(
      this.searchCtrl.value,
      pageIndex,
      pageSize,
    );
  }

  private formatWindow(start: string | null, end: string | null): string {
    if (!start || !end) {
      return '-';
    }

    return `${formatDateOnly(start)} - ${formatDateOnly(end)}`;
  }
}
