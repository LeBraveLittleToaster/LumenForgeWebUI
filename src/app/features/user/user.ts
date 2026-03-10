import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthApiClient } from '../../core/api/auth/auth-api.client';
import { UserDataSource, UserDataItem } from './user.data-source';
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
  selector: 'app-user',
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    FormsModule, ReactiveFormsModule,
    DataTableComponent
  ],
  templateUrl: './user.html',
  styleUrl: './user.css',
  providers: [AuthApiClient]
})
export class User implements OnInit {
  columns: ColumnDef<UserDataItem>[] = [
    { key: 'userKcId',   header: 'User KC ID',  cell: r => r.userView.user_kc_id },
    { key: 'username',   header: 'Username',    cell: r => r.userView.username },
    { key: 'email',      header: 'Email',       cell: r => r.userView.email },
    { key: 'firstName',  header: 'First Name',  cell: r => r.userView.firstName },
    { key: 'lastName',   header: 'Last Name',   cell: r => r.userView.lastName },
  ];
  rowLink = (row: UserDataItem) => ['/admin/users/', row.userView.user_kc_id];

  dataSource!: UserDataSource;
  searchCtrl = new FormControl('');

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  constructor(private authApiClient: AuthApiClient) {}

  ngOnInit(): void {
    this.dataSource = new UserDataSource(this.authApiClient);
    this.dataSource.loadUsers('', 'asc', 0, 10);
  }

  onSearch() {
    const value = this.searchCtrl.value ?? '';
    this.dataSource.loadUsers(value, 'asc', 0, 10);
    this.dataTable?.resetPage();
  }

  clearSearch() {
    this.searchCtrl.setValue('');
    this.onSearch();
  }

  onPage(event: PageEvent) {
    this.dataSource.loadUsers(this.searchCtrl.value ?? '', 'asc', event.pageIndex, event.pageSize);
  }

  onDeleteRow(row: UserDataItem) {
    this.authApiClient.deleteUser(row.userView.user_kc_id).pipe(
      catchError(() => EMPTY)
    ).subscribe(() => {
      this.dataSource.loadUsers(this.searchCtrl.value ?? '', 'asc', 0, 10);
      this.dataTable?.resetPage();
    });
  }
}
