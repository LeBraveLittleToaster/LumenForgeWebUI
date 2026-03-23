import {
  ChecklistView,
  RentalActionLogView,
  RentalActionType,
  RentalActionView,
  RentalDamageReportView,
  RentalExtensionView,
  RentalProcessSummaryView,
  RentalProcessView,
} from '@lumenforge/api-client';


export interface RentalBindingOption {
  guid: string;
  label: string;
  secondary: string;
  deviceGuid: string | null;
}

export interface RentalChecklistOption {
  guid: string;
  label: string;
}

export interface RentalExtensionOption {
  guid: string;
  label: string;
}

export interface RentalInvoiceOption {
  guid: string;
  label: string;
}

const ACTION_ALIASES: Record<string, RentalActionType> = {
  approveitems: 'approve-items',
  approverequest: 'approve-request',
  approveextension: 'approve-extension',
  assignitems: 'assign-items',
  cancel: 'cancel',
  complete: 'complete',
  createmaintenancejobs: 'create-maintenance-jobs',
  generatereport: 'generate-report',
  generateinvoice: 'generate-invoice',
  generatechecklist: 'generate-checklist',
  recorddamages: 'record-damages',
  recordpayment: 'record-payment',
  recordpickup: 'record-pickup',
  recordreturn: 'record-return',
  rejectextension: 'reject-extension',
  rejectitems: 'reject-items',
  rejectrequest: 'reject-request',
  removeitems: 'remove-items',
  requestextension: 'request-extension',
  scanchecklist: 'scan-checklist',
  scrap: 'scrap',
  signchecklist: 'sign-checklist',
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? value as Record<string, unknown> : null;
}

function readString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return null;
}

function readArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

export function prettifyToken(value: string | null | undefined): string {
  if (!value) {
    return 'Unknown';
  }

  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, character => character.toUpperCase());
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export function formatDateOnly(value: string | null | undefined): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

export function normalizeActionType(action: RentalActionView | string | null | undefined): RentalActionType | string {
  const source = typeof action === 'string'
    ? action
    : readString(action?.action_type) ?? '';

  const normalized = source
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();

  const aliasKey = normalized.replace(/-/g, '');
  return ACTION_ALIASES[aliasKey] ?? normalized;
}

export function getActionLabel(action: RentalActionView | string): string {
  return prettifyToken(String(normalizeActionType(action)));
}

export function getProcessGuid(process: RentalProcessView | RentalProcessSummaryView | null | undefined): string {
  return process ? String(process.guid) : '';
}

function getRentalRecord(process: RentalProcessView | null | undefined) {
  return process?.rental ?? null;
}

export function getCurrentStage(process: RentalProcessView | RentalProcessSummaryView | null | undefined): string {
  return prettifyToken(process?.current_stage ?? null);
}

export function getRentalTitle(process: RentalProcessView | RentalProcessSummaryView | null | undefined): string {
  if (!process) {
    return 'Rental Process';
  }
  const rental = getRentalRecord(process as RentalProcessView);
  return readString(
    rental?.purpose,
    rental?.customer_name,
    (process as RentalProcessSummaryView).customer_name,
  ) ?? 'Rental Process';
}

export function getRentalSubtitle(process: RentalProcessView | RentalProcessSummaryView | null | undefined): string {
  if (!process) {
    return 'No customer details';
  }
  const rental = getRentalRecord(process as RentalProcessView);
  return readString(
    rental?.customer_name,
    rental?.customer_email,
    (process as RentalProcessSummaryView).customer_name,
    (process as RentalProcessSummaryView).customer_email,
  ) ?? 'No customer details';
}

export function getRentalPurpose(process: RentalProcessView | RentalProcessSummaryView | null | undefined): string {
  const rental = getRentalRecord(process as RentalProcessView);
  return readString(rental?.purpose) ?? 'No purpose provided.';
}

export function getRentalNotes(process: RentalProcessView | RentalProcessSummaryView | null | undefined): string {
  const rental = getRentalRecord(process as RentalProcessView);
  return readString(rental?.notes) ?? 'No notes recorded.';
}

export function getCustomerDisplay(process: RentalProcessView | RentalProcessSummaryView | null | undefined): string {
  if (!process) {
    return 'Unknown customer';
  }
  const rental = getRentalRecord(process as RentalProcessView);
  return readString(
    rental?.customer_name,
    rental?.customer_email,
    rental?.customer_kc_id,
    (process as RentalProcessSummaryView).customer_name,
    (process as RentalProcessSummaryView).customer_email,
  ) ?? 'Unknown customer';
}

export function getRequestedStart(process: RentalProcessView | RentalProcessSummaryView | null | undefined): string | null {
  if (!process) return null;
  const rental = getRentalRecord(process as RentalProcessView);
  return readString(
    rental?.requested_start,
    (process as RentalProcessSummaryView).requested_start,
  );
}

export function getRequestedEnd(process: RentalProcessView | RentalProcessSummaryView | null | undefined): string | null {
  if (!process) return null;
  const rental = getRentalRecord(process as RentalProcessView);
  return readString(
    rental?.requested_end,
    (process as RentalProcessSummaryView).requested_end,
  );
}

export function getRentalChecklists(process: RentalProcessView | null | undefined): ChecklistView[] {
  return process?.checklists ?? [];
}

export function getRentalExtensions(process: RentalProcessView | null | undefined): RentalExtensionView[] {
  return process?.extensions ?? [];
}

export function getRentalDamageReports(process: RentalProcessView | null | undefined): RentalDamageReportView[] {
  return process?.damage_reports ?? [];
}

export function getRentalBindingOptions(process: RentalProcessView | null | undefined): RentalBindingOption[] {
  const checklists = process?.checklists ?? [];
  const seen = new Set<string>();
  const options: RentalBindingOption[] = [];

  for (const checklist of checklists) {
    for (const item of checklist.items) {
      const bindingGuid = String(item.stock_binding_guid);
      if (!seen.has(bindingGuid)) {
        seen.add(bindingGuid);
        options.push({
          guid: bindingGuid,
          label: item.device_name,
          secondary: prettifyToken(checklist.checklist_type),
          deviceGuid: null,
        });
      }
    }
  }

  return options;
}

export function getChecklistOptions(process: RentalProcessView | null | undefined): RentalChecklistOption[] {
  return getRentalChecklists(process).map(checklist => ({
    guid: String(checklist.guid),
    label: `${prettifyToken(checklist.checklist_type)} checklist — ${formatDateOnly(checklist.created_at)}`,
  }));
}

export function getExtensionOptions(process: RentalProcessView | null | undefined): RentalExtensionOption[] {
  return getRentalExtensions(process).map(extension => ({
    guid: String(extension.guid),
    label: `Until ${formatDateOnly(extension.new_requested_end)} • ${
      extension.is_approved === true ? 'Approved'
      : extension.is_approved === false ? 'Rejected'
      : 'Pending'
    }`,
  }));
}

export function getInvoiceOptions(_process: RentalProcessView | null | undefined): RentalInvoiceOption[] {
  // Invoice data is not included in the rental process view.
  return [];
}

export function getHistoryTimestamp(entry: RentalActionLogView): string | null {
  return entry.performed_at ?? null;
}

export function getHistoryLabel(entry: RentalActionLogView): string {
  return prettifyToken(String(normalizeActionType(entry.action_type)));
}