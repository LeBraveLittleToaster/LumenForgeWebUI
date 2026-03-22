import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RentalActionPage } from './rental-action-page';

@Component({ selector: 'app-rental-action-approve-request', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="approve-request"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionApproveRequestPage {}

@Component({ selector: 'app-rental-action-reject-request', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="reject-request"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionRejectRequestPage {}

@Component({ selector: 'app-rental-action-assign-items', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="assign-items"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionAssignItemsPage {}

@Component({ selector: 'app-rental-action-remove-items', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="remove-items"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionRemoveItemsPage {}

@Component({ selector: 'app-rental-action-approve-items', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="approve-items"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionApproveItemsPage {}

@Component({ selector: 'app-rental-action-reject-items', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="reject-items"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionRejectItemsPage {}

@Component({ selector: 'app-rental-action-generate-checklist', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="generate-checklist"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionGenerateChecklistPage {}

@Component({ selector: 'app-rental-action-scan-checklist', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="scan-checklist"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionScanChecklistPage {}

@Component({ selector: 'app-rental-action-sign-checklist', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="sign-checklist"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionSignChecklistPage {}

@Component({ selector: 'app-rental-action-record-pickup', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="record-pickup"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionRecordPickupPage {}

@Component({ selector: 'app-rental-action-record-return', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="record-return"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionRecordReturnPage {}

@Component({ selector: 'app-rental-action-request-extension', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="request-extension"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionRequestExtensionPage {}

@Component({ selector: 'app-rental-action-approve-extension', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="approve-extension"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionApproveExtensionPage {}

@Component({ selector: 'app-rental-action-reject-extension', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="reject-extension"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionRejectExtensionPage {}

@Component({ selector: 'app-rental-action-record-damages', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="record-damages"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionRecordDamagesPage {}

@Component({ selector: 'app-rental-action-create-maintenance-jobs', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="create-maintenance-jobs"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionCreateMaintenanceJobsPage {}

@Component({ selector: 'app-rental-action-generate-invoice', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="generate-invoice"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionGenerateInvoicePage {}

@Component({ selector: 'app-rental-action-record-payment', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="record-payment"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionRecordPaymentPage {}

@Component({ selector: 'app-rental-action-generate-report', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="generate-report"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionGenerateReportPage {}

@Component({ selector: 'app-rental-action-complete', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="complete"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionCompletePage {}

@Component({ selector: 'app-rental-action-cancel', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="cancel"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionCancelPage {}

@Component({ selector: 'app-rental-action-scrap', standalone: true, imports: [RentalActionPage], template: '<app-rental-action-page actionType="scrap"></app-rental-action-page>', changeDetection: ChangeDetectionStrategy.OnPush })
export class RentalActionScrapPage {}