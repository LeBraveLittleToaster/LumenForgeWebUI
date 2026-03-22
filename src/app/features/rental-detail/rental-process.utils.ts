import {
  ChecklistView,
  RentalActionType,
  RentalActionView,
  RentalDamageReportView,
  RentalExtensionView,
  RentalHistoryEntryView,
  RentalInvoiceView,
  RentalItemView,
  RentalRecordView,
  RentalView,
  StockBindingView,
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
    : readString(action?.type, action?.action_type, action?.name, action?.display_name) ?? '';

  const normalized = source
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();

  const aliasKey = normalized.replace(/-/g, '');
  return ACTION_ALIASES[aliasKey] ?? normalized;
}

export function getActionLabel(action: RentalActionView | string): string {
  if (typeof action !== 'string') {
    const explicit = readString(action.display_name, action.name, action.description);
    if (explicit) {
      return prettifyToken(explicit);
    }
  }

  return prettifyToken(String(normalizeActionType(action)));
}

export function getProcessGuid(process: RentalView | null | undefined): string {
  if (!process) {
    return '';
  }

  return readString(process.process_guid, process.uuid) ?? '';
}

export function getRentalRecord(process: RentalView | null | undefined): RentalRecordView | null {
  if (!process) {
    return null;
  }

  return process.rental ?? process;
}

export function getCurrentStage(process: RentalView | null | undefined): string {
  if (!process) {
    return '-';
  }

  const record = asRecord(process);
  return prettifyToken(
    readString(
      process.current_stage,
      process.stage,
      record?.['current_stage'],
      record?.['stage'],
      record?.['rental_stage'],
    )
  );
}

export function getRentalTitle(process: RentalView | null | undefined): string {
  const rental = getRentalRecord(process);
  return readString(
    rental?.request_title,
    process?.purpose,
    rental?.purpose,
    rental?.event_name,
    process?.customer_name,
  ) ?? 'Rental Process';
}

export function getRentalSubtitle(process: RentalView | null | undefined): string {
  const rental = getRentalRecord(process);
  return readString(
    process?.customer_name,
    rental?.customer_name,
    process?.customer_email,
    rental?.customer_email,
    rental?.event_name,
  ) ?? 'No customer details';
}

export function getRentalPurpose(process: RentalView | null | undefined): string {
  const rental = getRentalRecord(process);
  return readString(process?.purpose, rental?.purpose, rental?.request_description) ?? 'No purpose provided.';
}

export function getRentalNotes(process: RentalView | null | undefined): string {
  const rental = getRentalRecord(process);
  return readString(process?.notes, rental?.notes, rental?.customer_notes) ?? 'No notes recorded.';
}

export function getCustomerDisplay(process: RentalView | null | undefined): string {
  const rental = getRentalRecord(process);
  return readString(
    process?.customer_name,
    rental?.customer_name,
    process?.customer_email,
    rental?.customer_email,
    process?.customer_user_id,
  ) ?? 'Unknown customer';
}

export function getRequestedStart(process: RentalView | null | undefined): string | null {
  const rental = getRentalRecord(process);
  return readString(process?.requested_start, rental?.requested_start, rental?.planned_pickup_at, process?.planned_pickup_at);
}

export function getRequestedEnd(process: RentalView | null | undefined): string | null {
  const rental = getRentalRecord(process);
  return readString(process?.requested_end, rental?.requested_end, rental?.planned_return_at, process?.planned_return_at);
}

export function getRentalItems(process: RentalView | null | undefined): RentalItemView[] {
  const rental = getRentalRecord(process);
  return process?.items ?? rental?.items ?? [];
}

export function getRentalChecklists(process: RentalView | null | undefined): ChecklistView[] {
  const rental = getRentalRecord(process);
  return process?.checklists ?? rental?.checklists ?? [];
}

export function getRentalExtensions(process: RentalView | null | undefined): RentalExtensionView[] {
  const rental = getRentalRecord(process);
  return process?.extensions ?? rental?.extensions ?? [];
}

export function getRentalDamageReports(process: RentalView | null | undefined): RentalDamageReportView[] {
  const rental = getRentalRecord(process);
  return process?.damage_reports ?? rental?.damage_reports ?? [];
}

export function getRentalInvoices(process: RentalView | null | undefined): RentalInvoiceView[] {
  const rental = getRentalRecord(process);
  return process?.invoices ?? rental?.invoices ?? [];
}

export function getRentalHistoryEntries(process: RentalView | null | undefined): RentalHistoryEntryView[] {
  return readArray<RentalHistoryEntryView>(process?.history);
}

function bindingLabel(binding: StockBindingView, item: RentalItemView): string {
  const primary = readString(binding.device_name, item.device_name, binding.device_serial_number) ?? binding.guid;
  const secondary = readString(binding.device_serial_number, item.device_serial_number, item.device_name) ?? 'Assigned item';
  return `${primary} (${secondary})`;
}

export function getRentalBindingOptions(process: RentalView | null | undefined): RentalBindingOption[] {
  return getRentalItems(process).flatMap(item =>
    (item.stock_bindings ?? []).map(binding => ({
      guid: binding.guid,
      label: bindingLabel(binding, item),
      secondary: `${formatDateOnly(binding.start)} to ${formatDateOnly(binding.end)}`,
      deviceGuid: binding.device_guid ?? item.device_guid ?? null,
    }))
  );
}

export function getChecklistOptions(process: RentalView | null | undefined): RentalChecklistOption[] {
  return getRentalChecklists(process).map(checklist => ({
    guid: checklist.uuid,
    label: `${prettifyToken(checklist.checklist_type)} checklist ${formatDateOnly(checklist.generated_at ?? checklist.created_at)}`,
  }));
}

export function getExtensionOptions(process: RentalView | null | undefined): RentalExtensionOption[] {
  return getRentalExtensions(process).map(extension => ({
    guid: extension.uuid,
    label: `${formatDateOnly(extension.new_requested_end ?? extension.requested_end)} • ${prettifyToken(extension.status)}`,
  }));
}

export function getInvoiceOptions(process: RentalView | null | undefined): RentalInvoiceOption[] {
  return getRentalInvoices(process).map(invoice => ({
    guid: invoice.uuid,
    label: `${prettifyToken(invoice.status)} • due ${formatDateOnly(invoice.due_date)}`,
  }));
}

export function getHistoryTimestamp(entry: RentalHistoryEntryView): string | null {
  return readString(entry.performed_at, entry.created_at);
}

export function getHistoryLabel(entry: RentalHistoryEntryView): string {
  return prettifyToken(readString(entry.display_name, entry.action_name, entry.action_type) ?? 'Process Update');
}