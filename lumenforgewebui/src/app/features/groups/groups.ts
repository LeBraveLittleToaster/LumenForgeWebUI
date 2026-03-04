import { Component, OnInit, ViewChild } from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import { AuthApiClient } from '../../core/api/auth/auth-api.client';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { tap } from 'rxjs/internal/operators/tap';
import { RouterLink } from '@angular/router';
import { GroupsDataSource } from './groups.data-source';

@Component({
  selector: 'app-groups',
  imports: [MatTableModule, MatPaginatorModule, MatProgressSpinner, CommonModule, RouterLink],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
})
export class Groups implements OnInit {

  displayedColumns: string[] = ["guid", "name", "description", 'created_at'];
  dataSource!: GroupsDataSource;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private authApiClient: AuthApiClient) { 

  }

  ngOnInit(): void {
    this.dataSource = new GroupsDataSource(this.authApiClient);
    this.dataSource.loadGroups('', 'asc', 0, 10);
  }

  ngAfterViewInit() {
        this.paginator.page
            .pipe(
                tap(() => this.loadGroupsPage())
            )
            .subscribe();
    }

    loadGroupsPage() {
        this.dataSource.loadGroups(
            '',
            'asc',
            this.paginator.pageIndex,
            this.paginator.pageSize);
    }

    parseDate(dateStr: string) {
      return new Date(dateStr).toDateString();
    }
}
