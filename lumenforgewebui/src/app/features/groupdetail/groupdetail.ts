import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, filter, forkJoin, map, Observable, of, startWith, switchMap } from 'rxjs';
import { AuthApiClient } from '../../core/api/auth/auth-api.client';
import { GroupView } from '../../core/api/auth/models/views';
import { UserView } from '../../core/api/auth/models/views';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

interface GroupState {
  loading: boolean;
  group: GroupView | null;
  members: UserView[];
  error: string | null;
}

@Component({
  selector: 'app-groupdetail',
  imports: [CommonModule, MatDividerModule, MatIconModule, MatProgressSpinnerModule, MatTableModule],
  templateUrl: './groupdetail.html',
  styleUrl: './groupdetail.css',
})
export class Groupdetail implements OnInit {
  memberColumns = ['username', 'email', 'firstName', 'lastName'];
  state$!: Observable<GroupState>;

  constructor(
    private route: ActivatedRoute,
    private authClient: AuthApiClient
  ) {}

  ngOnInit() {
    this.state$ = this.route.paramMap.pipe(
      map(params => params.get('groupGuid')),
      filter((id): id is string => !!id),
      switchMap(id =>
        forkJoin({
          group: this.authClient.getGroup(id),
          members: this.authClient.getGroupUsers(id)
        }).pipe(
          map(({ group, members }) => ({ loading: false, group, members, error: null })),
          catchError(() => of({ loading: false, group: null, members: [], error: 'Failed to load group details.' })),
          startWith({ loading: true, group: null, members: [], error: null })
        )
      )
    );
  }
}
