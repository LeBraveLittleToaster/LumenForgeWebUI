import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, finalize, of, timeout } from 'rxjs';

import { CategoryView, InventoryApiClient } from '@lumenforge/api-client';

export interface DeviceAssignCategoriesDialogData {
  deviceGuid: string;
  assignedCategoryGuids: string[];
}

@Component({
  selector: 'app-device-assign-categories-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Assign Categories</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search categories</mat-label>
        <input matInput [formControl]="searchCtrl" placeholder="Type to filter..." />
      </mat-form-field>

      @if (loading) {
        <div class="dialog-spinner">
          <mat-progress-spinner diameter="32" mode="indeterminate"></mat-progress-spinner>
        </div>
      } @else if (categories.length === 0 && !error) {
        <p class="dialog-empty">No categories found.</p>
      } @else {
        <mat-selection-list [multiple]="true" (selectionChange)="onSelectionChange($event)">
          @for (category of categories; track category.guid) {
            <mat-list-option [value]="category.guid" [selected]="selectedCategoryGuids.has(category.guid)">
              <span matListItemTitle>{{ category.name }}</span>
              <span matListItemLine class="category-desc">{{ category.description || 'No description' }}</span>
            </mat-list-option>
          }
        </mat-selection-list>
      }

      @if (!loading) {
        @if (error) {
          <p class="error-text">{{ error }}</p>
        }
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="saving">Cancel</button>
      <button mat-flat-button [disabled]="saving || loading" (click)="save()">
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .search-field { width: 100%; margin-bottom: 8px; }
    .dialog-spinner { display: flex; justify-content: center; padding: 16px; }
    .dialog-empty { text-align: center; color: var(--mat-sys-on-surface-variant); padding: 16px; margin: 0; }
    mat-selection-list { max-height: 300px; overflow-y: auto; display: block; }
    .category-desc { font-size: 0.8rem; color: var(--mat-sys-on-surface-variant); }
    .error-text { color: var(--mat-sys-error); margin: 8px 0 0; }
  `]
})
export class DeviceAssignCategoriesDialogComponent implements OnInit {
  searchCtrl = new FormControl('', { nonNullable: true });
  selectedCategoryGuids = new Set<string>();
  categories: CategoryView[] = [];
  loading = true;
  saving = false;
  error: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DeviceAssignCategoriesDialogData,
    @Inject(InventoryApiClient) private readonly inventoryApiClient: InventoryApiClient,
    private readonly dialogRef: MatDialogRef<DeviceAssignCategoriesDialogComponent>,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.selectedCategoryGuids = new Set(this.data.assignedCategoryGuids ?? []);
    this.loadCategories('');

    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.loadCategories(value.trim());
    });
  }

  onSelectionChange(event: MatSelectionListChange): void {
    for (const option of event.options) {
      const value = option.value as string;
      if (option.selected) {
        this.selectedCategoryGuids.add(value);
      } else {
        this.selectedCategoryGuids.delete(value);
      }
    }
  }

  private loadCategories(search: string): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    this.inventoryApiClient.listCategories({ search }).pipe(
      timeout(10000),
      catchError(() => {
        this.error = 'Failed to load categories.';
        return of([] as CategoryView[]);
      }),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe(result => {
      this.categories = Array.isArray(result) ? result : (result.list ?? []);
      this.cdr.detectChanges();
    });
  }

  save(): void {
    if (this.saving) {
      return;
    }

    this.saving = true;
    this.error = null;

    this.inventoryApiClient.setDeviceCategories(this.data.deviceGuid, {
      categoryGuids: Array.from(this.selectedCategoryGuids)
    }).pipe(
      catchError(() => {
        this.error = 'Failed to assign categories.';
        this.cdr.detectChanges();
        return EMPTY;
      }),
      finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      })
    ).subscribe(updatedDevice => {
      this.dialogRef.close(updatedDevice.categories);
    });
  }
}
