import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RentalActionPage } from '../rental-action-page';

@Component({
  selector: 'app-rental-action-approve-extension',
  standalone: true,
  imports: [RentalActionPage],
  template: '<app-rental-action-page actionType="approve-extension"></app-rental-action-page>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionApproveExtensionPage {}
