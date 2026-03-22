import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RentalActionPage } from '../rental-action-page';

@Component({
  selector: 'app-rental-action-record-payment',
  standalone: true,
  imports: [RentalActionPage],
  template: '<app-rental-action-page actionType="record-payment"></app-rental-action-page>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionRecordPaymentPage {}
