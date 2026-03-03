import { Component, OnInit, ViewChild } from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import { AuthApiClient } from '../../core/api/auth/auth-api.client';
import { UserDataSource } from './user.data-source';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { tap } from 'rxjs/internal/operators/tap';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user',
  imports: [MatTableModule, MatPaginatorModule, MatProgressSpinner, CommonModule, RouterLink],
  templateUrl: './user.html',
  styleUrl: './user.css',
  providers: [AuthApiClient]
})
export class User implements OnInit {

  displayedColumns: string[] = ["userKcId", "username", "email", 'firstName', 'lastName'];
  dataSource!: UserDataSource;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private authApiClient: AuthApiClient) { 

  }

  ngOnInit(): void {
    this.dataSource = new UserDataSource(this.authApiClient);
    this.dataSource.loadUsers('', 'asc', 0, 10);
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
            '',
            'asc',
            this.paginator.pageIndex,
            this.paginator.pageSize);
    }
}
