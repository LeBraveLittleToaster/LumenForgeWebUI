import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RentalActionPage } from '../rental-action-page';

@Component({
  selector: 'app-rental-action-generate-checklist',
  standalone: true,
  imports: [RentalActionPage],
  template: '<app-rental-action-page actionType="generate-checklist"></app-rental-action-page>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionGenerateChecklistPage {}
