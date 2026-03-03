import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BehaviorSubject, catchError, filter, finalize, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { AuthApiClient } from '../../core/api/auth/auth-api.client';
import { UserView } from '../../core/api/auth/models/views';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

interface UserState {
  loading: boolean;
  user: UserView | null;
  error: string | null;
}

@Component({
  selector: 'app-userdetail',
  imports: [MatCardModule, MatDividerModule, MatIconModule, MatProgressSpinnerModule, MatTableModule, CommonModule],
  templateUrl: './userdetail.html',
  styleUrl: './userdetail.scss',
})
export class UserDetail implements OnInit {
  displayedColumns = ['groupId', 'userId', 'joinedAt', 'assignedByKeycloakId'];
  state$!: Observable<UserState>;

  constructor(
    private route: ActivatedRoute,
    private authClient: AuthApiClient
  ) { }

  ngOnInit() {
    this.state$ = this.route.paramMap.pipe(
      map(params => params.get('userKcId')),
      filter((id): id is string => !!id),
      switchMap(id => 
        this.authClient.getUser(id).pipe(
          map(user => ({ loading: false, user, error: null })),
          catchError(() => of({ 
            loading: false, 
            user: null, 
            error: "Failed to load user profile." 
          })),
          // Start the stream with a loading state
          startWith({ loading: true, user: null, error: null })
        )
      )
    );
  }
}