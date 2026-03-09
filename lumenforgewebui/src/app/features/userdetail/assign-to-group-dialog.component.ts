import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EMPTY, catchError, debounceTime, distinctUntilChanged, of, tap } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthApiClient } from '../../core/api/auth/auth-api.client';
import { GroupView } from '../../core/api/auth/models/views';

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
    ).subscribe(() => this.dialogRef.close(this.selectedGroup));
  }
}
