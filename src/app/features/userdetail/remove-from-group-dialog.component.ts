import { Component, Inject } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-remove-from-group-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Remove from Group</h2>
    <mat-dialog-content>
      <p>Remove user from group "{{ data.groupName }}"?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>No</button>
      <button mat-flat-button color="warn" (click)="confirm()">Yes, Remove</button>
    </mat-dialog-actions>
  `,
})
export class RemoveFromGroupDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { groupName: string },
    private dialogRef: MatDialogRef<RemoveFromGroupDialogComponent>
  ) {}

  confirm() {
    this.dialogRef.close(true);
  }
}
