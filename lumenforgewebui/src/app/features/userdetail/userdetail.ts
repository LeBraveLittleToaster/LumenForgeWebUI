import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, debounceTime, distinctUntilChanged, EMPTY, filter, finalize, map, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { AuthApiClient } from '../../core/api/auth/auth-api.client';
import { UserView, GroupView } from '../../core/api/auth/models/views';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

interface UserState {
  loading: boolean;
  user: UserView | null;
  error: string | null;
}

@Component({
  selector: 'app-assign-to-group-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatListModule, MatProgressSpinnerModule, ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>Assign to Group</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search groups</mat-label>
        <input matInput [formControl]="searchCtrl" placeholder="Type to filter...">
      </mat-form-field>
      @if (loading) {
        <div class="dialog-spinner">
          <mat-progress-spinner diameter="32" mode="indeterminate"></mat-progress-spinner>
        </div>
      } @else if (groups.length === 0) {
        <p class="dialog-empty">No groups found.</p>
      } @else {
        <mat-selection-list [multiple]="false" (selectionChange)="onSelectionChange($event)">
          @for (g of groups; track g.guid) {
            <mat-list-option [value]="g">
              <span matListItemTitle>{{ g.name }}</span>
              <span matListItemLine class="group-desc">{{ g.description }}</span>
            </mat-list-option>
          }
        </mat-selection-list>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button [disabled]="!selectedGroup" (click)="assign()">Assign</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .search-field { width: 100%; margin-bottom: 8px; }
    .dialog-spinner { display: flex; justify-content: center; padding: 16px; }
    .dialog-empty { text-align: center; color: var(--mat-sys-on-surface-variant); padding: 16px; margin: 0; }
    mat-selection-list { max-height: 300px; overflow-y: auto; display: block; }
    .group-desc { font-size: 0.8rem; color: var(--mat-sys-on-surface-variant); }
  `]
})
export class AssignToGroupDialogComponent implements OnInit {
  searchCtrl = new FormControl('');
  groups: GroupView[] = [];
  selectedGroup: GroupView | null = null;
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { userKcId: string },
    private dialogRef: MatDialogRef<AssignToGroupDialogComponent>,
    private authClient: AuthApiClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadGroups('');
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(val => this.loadGroups(val ?? ''));
  }

  private loadGroups(search: string) {
    this.loading = true;
    this.authClient.listGroups({ search }).pipe(
      catchError(() => of({ list: [], total: 0 })),
      tap(result => {
        this.groups = result.list;
        this.selectedGroup = null;
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe();
  }

  onSelectionChange(event: MatSelectionListChange) {
    this.selectedGroup = event.options[0]?.value ?? null;
  }

  assign() {
    if (!this.selectedGroup) return;
    this.authClient.assignUserToGroup(this.selectedGroup.guid, { userKcId: this.data.userKcId }).pipe(
      catchError(() => EMPTY)
    ).subscribe(() => this.dialogRef.close(true));
  }
}

@Component({
  selector: 'app-userdetail',
  imports: [
    MatDividerModule, MatIconModule, MatProgressSpinnerModule, MatTableModule,
    MatButtonModule, CommonModule
  ],
  templateUrl: './userdetail.html',
  styleUrl: './userdetail.scss',
})
export class UserDetail implements OnInit {
  displayedColumns = ['groupId', 'userId', 'joinedAt', 'assignedByKeycloakId'];
  state$!: Observable<UserState>;
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  constructor(
    private route: ActivatedRoute,
    private authClient: AuthApiClient,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    const paramId$ = this.route.paramMap.pipe(
      map(params => params.get('userKcId')),
      filter((id): id is string => !!id),
      distinctUntilChanged()
    );

    this.state$ = combineLatest([paramId$, this.refreshTrigger$]).pipe(
      switchMap(([id]) =>
        this.authClient.getUser(id).pipe(
          map(user => ({ loading: false, user, error: null })),
          catchError(() => of({
            loading: false,
            user: null,
            error: "Failed to load user profile."
          })),
          startWith({ loading: true, user: null, error: null })
        )
      )
    );
  }

  openAssignDialog(userKcId: string) {
    const ref = this.dialog.open(AssignToGroupDialogComponent, {
      width: '500px',
      data: { userKcId }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.refreshTrigger$.next();
    });
  }
}