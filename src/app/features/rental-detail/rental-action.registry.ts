import { RentalActionType } from '@lumenforge/api-client';

export interface RentalActionMeta {
  actionType: RentalActionType;
  label: string;
  title: string;
  description: string;
  routeSegment: RentalActionType;
}

export const RENTAL_ACTION_REGISTRY: Record<RentalActionType, RentalActionMeta> = {
  'approve-request': {
    actionType: 'approve-request',
    label: 'Approve Request',
    title: 'Approve Rental Request',
    description: 'Confirm the request is valid and move the process into the approved stage.',
    routeSegment: 'approve-request',
  },
  'reject-request': {
    actionType: 'reject-request',
    label: 'Reject Request',
    title: 'Reject Rental Request',
    description: 'Reject this request and record the reason for the audit trail.',
    routeSegment: 'reject-request',
  },
  'assign-items': {
    actionType: 'assign-items',
    label: 'Assign Items',
    title: 'Assign Inventory Items',
    description: 'Select inventory devices and quantities to reserve for this rental.',
    routeSegment: 'assign-items',
  },
  'remove-items': {
    actionType: 'remove-items',
    label: 'Remove Items',
    title: 'Remove Assigned Items',
    description: 'Remove one or more current stock bindings from the rental.',
    routeSegment: 'remove-items',
  },
  'approve-items': {
    actionType: 'approve-items',
    label: 'Approve Items',
    title: 'Approve Item Assignment',
    description: 'Lock the current item assignment in preparation for pickup.',
    routeSegment: 'approve-items',
  },
  'reject-items': {
    actionType: 'reject-items',
    label: 'Reject Items',
    title: 'Reject Item Assignment',
    description: 'Reject the selected item set and return the process to re-assignment.',
    routeSegment: 'reject-items',
  },
  'generate-checklist': {
    actionType: 'generate-checklist',
    label: 'Generate Checklist',
    title: 'Generate Checklist',
    description: 'Create a pickup or dropoff checklist from the currently assigned items.',
    routeSegment: 'generate-checklist',
  },
  'scan-checklist': {
    actionType: 'scan-checklist',
    label: 'Scan Checklist',
    title: 'Scan Checklist Item',
    description: 'Record a QR or barcode scan against a checklist entry.',
    routeSegment: 'scan-checklist',
  },
  'sign-checklist': {
    actionType: 'sign-checklist',
    label: 'Sign Checklist',
    title: 'Sign Checklist',
    description: 'Capture a final signature payload for a completed checklist.',
    routeSegment: 'sign-checklist',
  },
  'record-pickup': {
    actionType: 'record-pickup',
    label: 'Record Pickup',
    title: 'Record Pickup',
    description: 'Confirm the customer has collected the rental items.',
    routeSegment: 'record-pickup',
  },
  'record-return': {
    actionType: 'record-return',
    label: 'Record Return',
    title: 'Record Return',
    description: 'Record that the customer returned the rental items.',
    routeSegment: 'record-return',
  },
  'request-extension': {
    actionType: 'request-extension',
    label: 'Request Extension',
    title: 'Request Rental Extension',
    description: 'Propose a new requested end date for this rental.',
    routeSegment: 'request-extension',
  },
  'approve-extension': {
    actionType: 'approve-extension',
    label: 'Approve Extension',
    title: 'Approve Extension Request',
    description: 'Approve one of the pending extension requests on this process.',
    routeSegment: 'approve-extension',
  },
  'reject-extension': {
    actionType: 'reject-extension',
    label: 'Reject Extension',
    title: 'Reject Extension Request',
    description: 'Reject an extension request and provide the reason.',
    routeSegment: 'reject-extension',
  },
  'record-damages': {
    actionType: 'record-damages',
    label: 'Record Damages',
    title: 'Record Damage Reports',
    description: 'Capture one or more damage findings against returned stock bindings.',
    routeSegment: 'record-damages',
  },
  'create-maintenance-jobs': {
    actionType: 'create-maintenance-jobs',
    label: 'Create Maintenance Jobs',
    title: 'Create Maintenance Jobs',
    description: 'Create maintenance jobs for damaged stock bindings linked to this rental.',
    routeSegment: 'create-maintenance-jobs',
  },
  'generate-invoice': {
    actionType: 'generate-invoice',
    label: 'Generate Invoice',
    title: 'Generate Invoice',
    description: 'Generate billing for the current rental period and assigned items.',
    routeSegment: 'generate-invoice',
  },
  'record-payment': {
    actionType: 'record-payment',
    label: 'Record Payment',
    title: 'Record Payment',
    description: 'Record a payment against one of the rental invoices.',
    routeSegment: 'record-payment',
  },
  'generate-report': {
    actionType: 'generate-report',
    label: 'Generate Report',
    title: 'Generate Rental Report',
    description: 'Generate a final report with optional damage and payment information.',
    routeSegment: 'generate-report',
  },
  'complete': {
    actionType: 'complete',
    label: 'Complete',
    title: 'Complete Rental Process',
    description: 'Mark the process as complete once all obligations are closed.',
    routeSegment: 'complete',
  },
  'cancel': {
    actionType: 'cancel',
    label: 'Cancel',
    title: 'Cancel Rental Process',
    description: 'Cancel the rental process and record the reason.',
    routeSegment: 'cancel',
  },
  'scrap': {
    actionType: 'scrap',
    label: 'Scrap',
    title: 'Scrap Rental Process',
    description: 'Scrap the rental process for a total write-off situation.',
    routeSegment: 'scrap',
  },
};

export function getRentalActionMeta(action: RentalActionType | string | null | undefined): RentalActionMeta | null {
  if (!action) {
    return null;
  }

  return RENTAL_ACTION_REGISTRY[action as RentalActionType] ?? null;
}
