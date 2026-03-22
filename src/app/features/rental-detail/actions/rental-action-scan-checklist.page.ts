import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RentalActionPage } from '../rental-action-page';

@Component({
  selector: 'app-rental-action-scan-checklist',
  standalone: true,
  imports: [RentalActionPage],
  template: '<app-rental-action-page actionType="scan-checklist"></app-rental-action-page>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionScanChecklistPage {}
