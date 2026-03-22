import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RentalActionPage } from '../rental-action-page';

@Component({
  selector: 'app-rental-action-approve-request',
  standalone: true,
  imports: [RentalActionPage],
  template: '<app-rental-action-page actionType="approve-request"></app-rental-action-page>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionApproveRequestPage {}
