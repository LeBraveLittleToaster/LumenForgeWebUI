import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { AuthApiClient } from '../../core/api/auth/auth-api.client';
import { UserDataSource } from './user.data-source';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { tap } from 'rxjs/internal/operators/tap';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/select';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-user',
  imports: [
    MatTableModule, FormsModule, MatFormFieldModule,
    MatInputModule, MatButton, MatIcon, MatPaginatorModule, MatProgressSpinner,
    CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './user.html',
  styleUrl: './user.css',
  providers: [AuthApiClient]
})
export class User implements OnInit {

  displayedColumns: string[] = ["userKcId", "username", "email", 'firstName', 'lastName'];
  dataSource!: UserDataSource;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchCtrl = new FormControl('', Validators.required)

  constructor(private authApiClient: AuthApiClient) {

  }

  ngOnInit(): void {
    this.dataSource = new UserDataSource(this.authApiClient);
    this.dataSource.loadUsers('', 'asc', 0, 10);
  }

  onSearch() {
    const value = this.searchCtrl.value ?? '';
    this.dataSource.loadUsers(value, 'asc', 0, 10);
  }

  clearSearch() {
    
    console.log("Hello")
    //this.searchCtrl.setValue('');
  }


  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.loadUsersPage())
      )
      .subscribe();
  }

  loadUsersPage() {
    this.dataSource.loadUsers(
      this.searchCtrl.value ?? '',
      'asc',
      this.paginator.pageIndex,
      this.paginator.pageSize);
  }
}
