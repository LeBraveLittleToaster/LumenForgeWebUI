import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { AuthApiClient } from '@lumenforge/api-client';
import { GroupsDataSource, GroupDataItem } from './groups.data-source';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { catchError, EMPTY } from 'rxjs';
import { DataTableComponent, ColumnDef } from '../../shared/data-table/data-table';

@Component({
  selector: 'app-groups',
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    FormsModule, ReactiveFormsModule,
    DataTableComponent
  ],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
})
export class Groups implements OnInit {
  columns: ColumnDef<GroupDataItem>[] = [
    { key: 'guid',        header: 'Group GUID',  cell: r => r.groupView.guid },
    { key: 'name',        header: 'Name',        cell: r => r.groupView.name },
    { key: 'description', header: 'Description', cell: r => r.groupView.description },
    { key: 'created_at',  header: 'Created At',  cell: r => new Date(r.groupView.created_at).toDateString() },
  ];
  rowLink = (row: GroupDataItem) => ['/admin/groups/', row.groupView.guid];

  dataSource!: GroupsDataSource;
  searchCtrl = new FormControl('');

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  constructor(@Inject(AuthApiClient) private authApiClient: AuthApiClient) {}

  ngOnInit(): void {
    this.dataSource = new GroupsDataSource(this.authApiClient);
    this.dataSource.loadGroups('', 'asc', 0, 10);
  }

  onSearch() {
    const value = this.searchCtrl.value ?? '';
    this.dataSource.loadGroups(value, 'asc', 0, 10);
    this.dataTable?.resetPage();
  }

  clearSearch() {
    this.searchCtrl.setValue('');
    this.onSearch();
  }

  onPage(event: PageEvent) {
    this.dataSource.loadGroups(this.searchCtrl.value ?? '', 'asc', event.pageIndex, event.pageSize);
  }

  onDeleteRow(row: GroupDataItem) {
    this.authApiClient.deleteGroup(row.groupView.guid).pipe(
      catchError(() => EMPTY)
    ).subscribe(() => {
      this.dataSource.loadGroups(this.searchCtrl.value ?? '', 'asc', 0, 10);
      this.dataTable?.resetPage();
    });
  }
}
