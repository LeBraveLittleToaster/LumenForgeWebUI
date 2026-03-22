import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RentalActionPage } from '../rental-action-page';

@Component({
  selector: 'app-rental-action-record-damages',
  standalone: true,
  imports: [RentalActionPage],
  template: '<app-rental-action-page actionType="record-damages"></app-rental-action-page>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionRecordDamagesPage {}
