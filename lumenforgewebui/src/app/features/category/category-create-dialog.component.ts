import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, EMPTY, catchError, finalize } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { InventoryApiClient } from '../../core/api/inventory/inventory-api.client';

@Component({
  selector: 'app-category-create-dialog',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, CommonModule],
  template: `
    <h2 mat-dialog-title>Create Category</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Category name" required>
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" placeholder="Category description" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-button [disabled]="form.invalid || (isSending$ | async)" (click)="create()">Create</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; min-width: 320px; padding-top: 8px; }
    .full-width { width: 100%; }
  `]
})
export class CategoryCreateDialogComponent {
  private fb = inject(FormBuilder);
  private isSendingSubject = new BehaviorSubject<boolean>(false);
  isSending$ = this.isSendingSubject.asObservable();

  form = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  constructor(
    private dialogRef: MatDialogRef<CategoryCreateDialogComponent>,
    private api: InventoryApiClient
  ) {}

  create() {
    if (this.form.invalid) return;
    this.isSendingSubject.next(true);
    this.api.createCategory({
      name: this.form.value.name!,
      description: this.form.value.description || null
    }).pipe(
      catchError(() => EMPTY),
      finalize(() => this.isSendingSubject.next(false))
    ).subscribe(category => {
      this.dialogRef.close(category);
    });
  }
}
