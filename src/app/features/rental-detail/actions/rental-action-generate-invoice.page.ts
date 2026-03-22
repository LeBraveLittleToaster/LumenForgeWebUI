import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RentalActionPage } from '../rental-action-page';

@Component({
  selector: 'app-rental-action-generate-invoice',
  standalone: true,
  imports: [RentalActionPage],
  template: '<app-rental-action-page actionType="generate-invoice"></app-rental-action-page>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionGenerateInvoicePage {}
