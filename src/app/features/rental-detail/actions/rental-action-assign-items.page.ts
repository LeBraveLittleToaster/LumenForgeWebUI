import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RentalActionPage } from '../rental-action-page';

@Component({
  selector: 'app-rental-action-assign-items',
  standalone: true,
  imports: [RentalActionPage],
  template: '<app-rental-action-page actionType="assign-items"></app-rental-action-page>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionAssignItemsPage {}
