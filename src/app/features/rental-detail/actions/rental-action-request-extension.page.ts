import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RentalActionPage } from '../rental-action-page';

@Component({
  selector: 'app-rental-action-request-extension',
  standalone: true,
  imports: [RentalActionPage],
  template: '<app-rental-action-page actionType="request-extension"></app-rental-action-page>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionRequestExtensionPage {}
