import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RentalActionPage } from '../rental-action-page';

@Component({
  selector: 'app-rental-action-remove-items',
  standalone: true,
  imports: [RentalActionPage],
  template: '<app-rental-action-page actionType="remove-items"></app-rental-action-page>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionRemoveItemsPage {}
