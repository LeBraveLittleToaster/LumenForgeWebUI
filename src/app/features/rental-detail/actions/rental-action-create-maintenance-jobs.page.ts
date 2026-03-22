import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RentalActionPage } from '../rental-action-page';

@Component({
  selector: 'app-rental-action-create-maintenance-jobs',
  standalone: true,
  imports: [RentalActionPage],
  template: '<app-rental-action-page actionType="create-maintenance-jobs"></app-rental-action-page>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentalActionCreateMaintenanceJobsPage {}
