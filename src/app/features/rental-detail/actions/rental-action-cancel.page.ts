import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RentalActionPage } from '../rental-action-page';

@Component({
  selector: 'app-rental-action-cancel',
  standalone: true,
  imports: [RentalActionPage],
  template: '<app-rental-action-page actionType="cancel"></app-rental-action-page>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionCancelPage {}
