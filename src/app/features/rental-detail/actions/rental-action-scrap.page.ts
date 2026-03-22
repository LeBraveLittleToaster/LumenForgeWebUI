import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RentalActionPage } from '../rental-action-page';

@Component({
  selector: 'app-rental-action-scrap',
  standalone: true,
  imports: [RentalActionPage],
  template: '<app-rental-action-page actionType="scrap"></app-rental-action-page>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionScrapPage {}
