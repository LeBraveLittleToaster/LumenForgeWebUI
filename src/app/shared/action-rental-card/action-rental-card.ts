import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { formatDateOnly, getCurrentStage, getCustomerDisplay, getProcessGuid, getRentalNotes, getRentalPurpose, getRentalSubtitle, getRentalTitle, getRequestedEnd, getRequestedStart } from '../../features/rental-detail/rental-process.utils';
import { RentalProcessView } from '@lumenforge/api-client';

@Component({
  selector: 'app-action-rental-card',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './action-rental-card.html',
  styleUrl: './action-rental-card.scss',
})
export class ActionRentalCard {

  @Input() process! : RentalProcessView | null;

  protected readonly formatDateOnly = formatDateOnly;
    protected readonly getCurrentStage = getCurrentStage;
    protected readonly getCustomerDisplay = getCustomerDisplay;
    protected readonly getProcessGuid = getProcessGuid;
    protected readonly getRentalNotes = getRentalNotes;
    protected readonly getRentalPurpose = getRentalPurpose;
    protected readonly getRentalSubtitle = getRentalSubtitle;
    protected readonly getRentalTitle = getRentalTitle;
    protected readonly getRequestedEnd = getRequestedEnd;
    protected readonly getRequestedStart = getRequestedStart;
}
