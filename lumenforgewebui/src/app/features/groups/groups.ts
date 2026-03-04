import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { AuthApiClient } from '../../core/api/auth/auth-api.client';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { tap } from 'rxjs/internal/operators/tap';
import { RouterLink } from '@angular/router';
import { GroupsDataSource } from './groups.data-source';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-groups',
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, MatProgressSpinner, CommonModule, RouterLink, ReactiveFormsModule, MatTableModule, FormsModule, MatFormFieldModule,
    MatInputModule, MatButton, MatPaginatorModule, MatProgressSpinner,
    CommonModule,],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
})
export class Groups implements OnInit {

  displayedColumns: string[] = ["guid", "name", "description", 'created_at'];
  dataSource!: GroupsDataSource;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchCtrl = new FormControl('', Validators.required)
  constructor(private authApiClient: AuthApiClient) {

  }

  ngOnInit(): void {
    this.dataSource = new GroupsDataSource(this.authApiClient);
    this.dataSource.loadGroups('', 'asc', 0, 10);
  }

  onSearch() {
    const value = this.searchCtrl.value ?? '';
    this.dataSource.loadGroups(value, 'asc', 0, 10);
  }
  clearSearch() {
    //this.searchCtrl.setValue('');
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
      this.searchCtrl.value ?? '',
      'asc',
      this.paginator.pageIndex,
      this.paginator.pageSize);
  }

  parseDate(dateStr: string) {
    return new Date(dateStr).toDateString();
  }
}
