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
  readonly rowRouterLink = (row: RentalDataItem): any[] => ['/rental', row.rental.uuid];

  readonly columns: ColumnDef<RentalDataItem>[] = [
    { key: 'title', header: 'Title', cell: r => r.rental.request_title ?? 'Untitled request' },
    { key: 'event', header: 'Event', cell: r => r.rental.event_name ?? '-' },
    { key: 'status', header: 'Status', cell: r => this.prettifyStatus(r.rental.rental_status_name) },
    { key: 'priority', header: 'Priority', cell: r => this.prettifyStatus(r.rental.priority) },
    {
      key: 'window',
      header: 'Window',
      cell: r => this.formatWindow(r.rental.planned_pickup_at, r.rental.planned_return_at),
    },
    { key: 'customer', header: 'Customer', cell: r => r.rental.customer_user_id },
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

    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  }

  prettifyStatus(value: string | null | undefined): string {
    if (!value) {
      return 'Unknown';
    }

    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
