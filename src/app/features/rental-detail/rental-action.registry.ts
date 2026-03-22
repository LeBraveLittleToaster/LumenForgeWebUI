import { ChecklistType, DamageSeverity, PaymentMethod, RentalActionType } from '@lumenforge/api-client';

export type RentalActionFormKind = 'generic' | 'assign-items' | 'remove-items' | 'record-damages' | 'create-maintenance-jobs';

export type RentalActionFieldKey =
  | 'comment'
  | 'reason'
  | 'checklistType'
  | 'checklistGuid'
  | 'scannedValue'
  | 'signatureData'
  | 'newRequestedEnd'
  | 'extensionGuid'
  | 'dueDateOverride'
  | 'invoiceGuid'
  | 'amount'
  | 'paymentMethod'
  | 'reference'
  | 'includeDamages'
  | 'includePayments';

export interface RentalActionFieldOption {
  value: string | boolean;
  label: string;
}

export interface RentalActionFieldConfig {
  key: RentalActionFieldKey;
  label: string;
  kind: 'text' | 'textarea' | 'date' | 'number' | 'select' | 'checkbox';
  required?: boolean;
  hint?: string;
  options?: RentalActionFieldOption[];
}

export interface RentalActionConfig {
  actionType: RentalActionType;
  label: string;
  title: string;
  description: string;
  submitLabel: string;
  successMessage: string;
  formKind: RentalActionFormKind;
  fields?: RentalActionFieldConfig[];
}

export const CHECKLIST_TYPE_OPTIONS: RentalActionFieldOption[] = [
  { value: 'PICKUP' satisfies ChecklistType, label: 'Pickup' },
  { value: 'DROPOFF' satisfies ChecklistType, label: 'Dropoff' },
];

export const PAYMENT_METHOD_OPTIONS: RentalActionFieldOption[] = [
  { value: 'CASH' satisfies PaymentMethod, label: 'Cash' },
  { value: 'CARD' satisfies PaymentMethod, label: 'Card' },
  { value: 'TRANSFER' satisfies PaymentMethod, label: 'Transfer' },
  { value: 'OTHER' satisfies PaymentMethod, label: 'Other' },
];

export const DAMAGE_SEVERITY_OPTIONS: Array<{ value: DamageSeverity; label: string }> = [
  { value: 'MINOR', label: 'Minor' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'SEVERE', label: 'Severe' },
  { value: 'TOTAL_LOSS', label: 'Total Loss' },
];

export const RENTAL_ACTION_CONFIG: Record<RentalActionType, RentalActionConfig> = {
  'approve-request': {
    actionType: 'approve-request',
    label: 'Approve Request',
    title: 'Approve Rental Request',
    description: 'Confirm the request is valid and move the process into the approved stage.',
    submitLabel: 'Approve Request',
    successMessage: 'Rental request approved.',
    formKind: 'generic',
    fields: [{ key: 'comment', label: 'Approval comment', kind: 'textarea' }],
  },
  'reject-request': {
    actionType: 'reject-request',
    label: 'Reject Request',
    title: 'Reject Rental Request',
    description: 'Reject this request and record the reason for the audit trail.',
    submitLabel: 'Reject Request',
    successMessage: 'Rental request rejected.',
    formKind: 'generic',
    fields: [{ key: 'reason', label: 'Rejection reason', kind: 'textarea', required: true }],
  },
  'assign-items': {
    actionType: 'assign-items',
    label: 'Assign Items',
    title: 'Assign Inventory Items',
    description: 'Select inventory devices and quantities to reserve for this rental.',
    submitLabel: 'Assign Items',
    successMessage: 'Items assigned to rental.',
    formKind: 'assign-items',
  },
  'remove-items': {
    actionType: 'remove-items',
    label: 'Remove Items',
    title: 'Remove Assigned Items',
    description: 'Remove one or more current stock bindings from the rental.',
    submitLabel: 'Remove Items',
    successMessage: 'Assigned items removed.',
    formKind: 'remove-items',
  },
  'approve-items': {
    actionType: 'approve-items',
    label: 'Approve Items',
    title: 'Approve Item Assignment',
    description: 'Lock the current item assignment in preparation for pickup.',
    submitLabel: 'Approve Items',
    successMessage: 'Assigned items approved.',
    formKind: 'generic',
    fields: [{ key: 'comment', label: 'Approval comment', kind: 'textarea' }],
  },
  'reject-items': {
    actionType: 'reject-items',
    label: 'Reject Items',
    title: 'Reject Item Assignment',
    description: 'Reject the selected item set and return the process to re-assignment.',
    submitLabel: 'Reject Items',
    successMessage: 'Assigned items rejected.',
    formKind: 'generic',
    fields: [{ key: 'reason', label: 'Rejection reason', kind: 'textarea', required: true }],
  },
  'generate-checklist': {
    actionType: 'generate-checklist',
    label: 'Generate Checklist',
    title: 'Generate Checklist',
    description: 'Create a pickup or dropoff checklist from the currently assigned items.',
    submitLabel: 'Generate Checklist',
    successMessage: 'Checklist generated.',
    formKind: 'generic',
    fields: [{ key: 'checklistType', label: 'Checklist type', kind: 'select', required: true, options: CHECKLIST_TYPE_OPTIONS }],
  },
  'scan-checklist': {
    actionType: 'scan-checklist',
    label: 'Scan Checklist',
    title: 'Scan Checklist Item',
    description: 'Record a QR or barcode scan against a checklist entry.',
    submitLabel: 'Record Scan',
    successMessage: 'Checklist scan recorded.',
    formKind: 'generic',
    fields: [
      { key: 'checklistGuid', label: 'Checklist', kind: 'select', required: true },
      { key: 'scannedValue', label: 'Scanned value', kind: 'text', required: true },
    ],
  },
  'sign-checklist': {
    actionType: 'sign-checklist',
    label: 'Sign Checklist',
    title: 'Sign Checklist',
    description: 'Capture a final signature payload for a completed checklist.',
    submitLabel: 'Sign Checklist',
    successMessage: 'Checklist signed.',
    formKind: 'generic',
    fields: [
      { key: 'checklistGuid', label: 'Checklist', kind: 'select', required: true },
      { key: 'signatureData', label: 'Signature data', kind: 'textarea', required: true, hint: 'Paste the base64-encoded signature payload.' },
    ],
  },
  'record-pickup': {
    actionType: 'record-pickup',
    label: 'Record Pickup',
    title: 'Record Pickup',
    description: 'Confirm the customer has collected the rental items.',
    submitLabel: 'Record Pickup',
    successMessage: 'Pickup recorded.',
    formKind: 'generic',
    fields: [{ key: 'comment', label: 'Pickup notes', kind: 'textarea' }],
  },
  'record-return': {
    actionType: 'record-return',
    label: 'Record Return',
    title: 'Record Return',
    description: 'Record that the customer returned the rental items.',
    submitLabel: 'Record Return',
    successMessage: 'Return recorded.',
    formKind: 'generic',
    fields: [{ key: 'comment', label: 'Return notes', kind: 'textarea' }],
  },
  'request-extension': {
    actionType: 'request-extension',
    label: 'Request Extension',
    title: 'Request Rental Extension',
    description: 'Propose a new requested end date for this rental.',
    submitLabel: 'Request Extension',
    successMessage: 'Extension requested.',
    formKind: 'generic',
    fields: [
      { key: 'newRequestedEnd', label: 'New requested end date', kind: 'date', required: true },
      { key: 'reason', label: 'Reason', kind: 'textarea' },
    ],
  },
  'approve-extension': {
    actionType: 'approve-extension',
    label: 'Approve Extension',
    title: 'Approve Extension Request',
    description: 'Approve one of the pending extension requests on this process.',
    submitLabel: 'Approve Extension',
    successMessage: 'Extension approved.',
    formKind: 'generic',
    fields: [
      { key: 'extensionGuid', label: 'Extension request', kind: 'select', required: true },
      { key: 'comment', label: 'Approval comment', kind: 'textarea' },
    ],
  },
  'reject-extension': {
    actionType: 'reject-extension',
    label: 'Reject Extension',
    title: 'Reject Extension Request',
    description: 'Reject an extension request and provide the reason.',
    submitLabel: 'Reject Extension',
    successMessage: 'Extension rejected.',
    formKind: 'generic',
    fields: [
      { key: 'extensionGuid', label: 'Extension request', kind: 'select', required: true },
      { key: 'reason', label: 'Rejection reason', kind: 'textarea', required: true },
    ],
  },
  'record-damages': {
    actionType: 'record-damages',
    label: 'Record Damages',
    title: 'Record Damage Reports',
    description: 'Capture one or more damage findings against returned stock bindings.',
    submitLabel: 'Record Damages',
    successMessage: 'Damage reports recorded.',
    formKind: 'record-damages',
  },
  'create-maintenance-jobs': {
    actionType: 'create-maintenance-jobs',
    label: 'Create Maintenance Jobs',
    title: 'Create Maintenance Jobs',
    description: 'Create maintenance jobs for damaged stock bindings linked to this rental.',
    submitLabel: 'Create Jobs',
    successMessage: 'Maintenance jobs created.',
    formKind: 'create-maintenance-jobs',
  },
  'generate-invoice': {
    actionType: 'generate-invoice',
    label: 'Generate Invoice',
    title: 'Generate Invoice',
    description: 'Generate billing for the current rental period and assigned items.',
    submitLabel: 'Generate Invoice',
    successMessage: 'Invoice generated.',
    formKind: 'generic',
    fields: [{ key: 'dueDateOverride', label: 'Due date override', kind: 'date' }],
  },
  'record-payment': {
    actionType: 'record-payment',
    label: 'Record Payment',
    title: 'Record Payment',
    description: 'Record a payment against one of the rental invoices.',
    submitLabel: 'Record Payment',
    successMessage: 'Payment recorded.',
    formKind: 'generic',
    fields: [
      { key: 'invoiceGuid', label: 'Invoice', kind: 'select', required: true },
      { key: 'amount', label: 'Amount', kind: 'number', required: true },
      { key: 'paymentMethod', label: 'Payment method', kind: 'select', required: true, options: PAYMENT_METHOD_OPTIONS },
      { key: 'reference', label: 'Reference', kind: 'text' },
    ],
  },
  'generate-report': {
    actionType: 'generate-report',
    label: 'Generate Report',
    title: 'Generate Rental Report',
    description: 'Generate a final report with optional damage and payment information.',
    submitLabel: 'Generate Report',
    successMessage: 'Report generated.',
    formKind: 'generic',
    fields: [
      { key: 'includeDamages', label: 'Include damages', kind: 'checkbox' },
      { key: 'includePayments', label: 'Include payments', kind: 'checkbox' },
    ],
  },
  'complete': {
    actionType: 'complete',
    label: 'Complete',
    title: 'Complete Rental Process',
    description: 'Mark the process as complete once all obligations are closed.',
    submitLabel: 'Complete Rental',
    successMessage: 'Rental process completed.',
    formKind: 'generic',
    fields: [{ key: 'comment', label: 'Completion comment', kind: 'textarea' }],
  },
  'cancel': {
    actionType: 'cancel',
    label: 'Cancel',
    title: 'Cancel Rental Process',
    description: 'Cancel the rental process and record the reason.',
    submitLabel: 'Cancel Rental',
    successMessage: 'Rental process cancelled.',
    formKind: 'generic',
    fields: [{ key: 'reason', label: 'Cancellation reason', kind: 'textarea', required: true }],
  },
  'scrap': {
    actionType: 'scrap',
    label: 'Scrap',
    title: 'Scrap Rental Process',
    description: 'Scrap the rental process for a total write-off situation.',
    submitLabel: 'Scrap Rental',
    successMessage: 'Rental process scrapped.',
    formKind: 'generic',
    fields: [{ key: 'reason', label: 'Scrap reason', kind: 'textarea', required: true }],
  },
};