import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RentalActionPage } from '../rental-action-page';

@Component({
  selector: 'app-rental-action-record-pickup',
  standalone: true,
  imports: [RentalActionPage],
  template: '<app-rental-action-page actionType="record-pickup"></app-rental-action-page>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionRecordPickupPage {}
