import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RentalActionPage } from '../rental-action-page';

@Component({
  selector: 'app-rental-action-complete',
  standalone: true,
  imports: [RentalActionPage],
  template: '<app-rental-action-page actionType="complete"></app-rental-action-page>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionCompletePage {}
