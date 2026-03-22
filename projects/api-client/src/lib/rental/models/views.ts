import { Guid } from '../../core/common';
import { SurveyAnswerResponse } from './dtos';

// ------------------- Enums -------------------

export type ChecklistType = 'PICKUP' | 'DROPOFF';

export type RentalStage =
  | 'None'
  | 'Requested'
  | 'Approved'
  | 'ItemsAssigned'
  | 'ItemsApproved'
  | 'ReadyForPickup'
  | 'PickedUp'
  | 'Returned'
  | 'Inspected'
  | 'Invoiced'
  | 'Paid'
  | 'Completed'
  | 'Cancelled'
  | 'Scrapped';

export type RentalSortField = 'UpdatedAt' | 'CreatedAt' | 'Stage' | 'CustomerName';

export type RentalActionType =
  | 'approve-request'
  | 'reject-request'
  | 'assign-items'
  | 'remove-items'
  | 'approve-items'
  | 'reject-items'
  | 'generate-checklist'
  | 'scan-checklist'
  | 'sign-checklist'
  | 'record-pickup'
  | 'record-return'
  | 'request-extension'
  | 'approve-extension'
  | 'reject-extension'
  | 'record-damages'
  | 'create-maintenance-jobs'
  | 'generate-invoice'
  | 'record-payment'
  | 'generate-report'
  | 'complete'
  | 'cancel'
  | 'scrap';

export type BindingType = 'RENTAL' | 'RENTAL_REQUEST' | 'MAINTENANCE';

export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';

export type DamageSeverity = 'MINOR' | 'MODERATE' | 'SEVERE' | 'TOTAL_LOSS';

// ------------------- Survey / Answer Views -------------------

export interface QuestionView {
  uuid: Guid;
  question_text: string;
  category: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface AnswerView {
  uuid: Guid;
  question_uuid: Guid;
  question_text: string;
  response: SurveyAnswerResponse;
  comment: string | null;
  respondent_user_id: string | null;
  rental_uuid: Guid | null;
  created_at: string;
}

// ------------------- Rental Views -------------------

export interface RentalActionView {
  type?: RentalActionType | string;
  action_type?: RentalActionType | string;
  name?: string;
  display_name?: string;
  description?: string | null;
  available?: boolean;
  enabled?: boolean;
  requires_confirmation?: boolean;
  metadata?: Record<string, unknown> | null;
}

export interface RentalHistoryEntryView {
  uuid?: Guid;
  action_type?: string;
  action_name?: string;
  display_name?: string;
  description?: string | null;
  stage_before?: RentalStage | null;
  stage_after?: RentalStage | null;
  actor_user_id?: string | null;
  created_at?: string;
  performed_at?: string;
  metadata?: Record<string, unknown> | null;
}

export interface StockBindingConflictView {
  binding_guid: Guid;
  binding_type: BindingType;
  device_guid: Guid;
  device_serial_number: string;
  device_name: string | null;
  start: string;
  end: string;
  created_at: string;
}

/** A read model for a stock binding allocated to a rental item. */
export interface StockBindingView {
  guid: Guid;
  binding_type: BindingType;
  device_guid: Guid;
  device_name?: string | null;
  device_serial_number?: string | null;
  start: string;
  end: string;
  created_at: string;
}

export interface ChecklistItemView {
  uuid: Guid;
  rental_item_uuid?: Guid;
  stock_binding_guid?: Guid | null;
  label?: string | null;
  scanned_value?: string | null;
  is_checked?: boolean;
  quantity_checked?: number;
  condition_ok?: boolean;
  condition_notes?: string | null;
  damaged_quantity?: number;
  damage_summary?: string | null;
  damage_description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ChecklistView {
  uuid: Guid;
  checklist_type: ChecklistType;
  source_checklist_uuid?: Guid | null;
  generated_by_user_id?: string | null;
  generated_at?: string;
  signed_at?: string | null;
  signed_by_user_id?: string | null;
  notes?: string | null;
  total_items?: number;
  checked_items_count?: number;
  is_complete?: boolean;
  is_signed?: boolean;
  created_at?: string;
  updated_at?: string;
  items?: ChecklistItemView[];
}

export interface RentalItemView {
  uuid: Guid;
  device_guid?: Guid | null;
  device_name?: string | null;
  device_serial_number?: string | null;
  quantity_requested?: number;
  quantity_approved?: number | null;
  quantity_picked_up?: number | null;
  quantity_returned?: number | null;
  quantity_damaged?: number | null;
  quantity_lost?: number | null;
  stock_bindings?: StockBindingView[];
  created_at?: string;
  updated_at?: string;
}

export interface RentalExtensionView {
  uuid: Guid;
  requested_end?: string | null;
  new_requested_end?: string | null;
  reason?: string | null;
  status?: string | null;
  created_at?: string;
  decided_at?: string | null;
}

export interface RentalDamageReportView {
  uuid: Guid;
  stock_binding_guid?: Guid;
  description?: string | null;
  severity?: DamageSeverity;
  created_at?: string;
}

export interface RentalPaymentView {
  uuid: Guid;
  invoice_guid?: Guid;
  amount?: number;
  method?: PaymentMethod;
  reference?: string | null;
  created_at?: string;
}

export interface RentalInvoiceView {
  uuid: Guid;
  amount_due?: number;
  amount_paid?: number;
  due_date?: string | null;
  status?: string | null;
  created_at?: string;
  payments?: RentalPaymentView[];
}

export interface RentalRecordView {
  uuid?: Guid;
  customer_name?: string | null;
  customer_email?: string | null;
  purpose?: string | null;
  notes?: string | null;
  requested_start?: string | null;
  requested_end?: string | null;
  request_title?: string | null;
  request_description?: string | null;
  event_name?: string | null;
  customer_notes?: string | null;
  delivery_address?: string | null;
  planned_pickup_at?: string | null;
  planned_return_at?: string | null;
  items?: RentalItemView[];
  checklists?: ChecklistView[];
  extensions?: RentalExtensionView[];
  damage_reports?: RentalDamageReportView[];
  invoices?: RentalInvoiceView[];
}

export interface RentalView {
  uuid: Guid;
  process_guid?: Guid;
  current_stage?: RentalStage | null;
  stage?: RentalStage | null;
  owner_kc_id?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  purpose?: string | null;
  notes?: string | null;
  requested_start?: string | null;
  requested_end?: string | null;
  created_at?: string;
  updated_at?: string;
  rental?: RentalRecordView | null;
  available_actions?: RentalActionView[];
  history?: RentalHistoryEntryView[];
  checklists?: ChecklistView[];
  extensions?: RentalExtensionView[];
  damage_reports?: RentalDamageReportView[];
  invoices?: RentalInvoiceView[];
  request_title?: string | null;
  request_description?: string | null;
  event_name?: string | null;
  customer_notes?: string | null;
  delivery_address?: string | null;
  planned_pickup_at?: string | null;
  planned_return_at?: string | null;
  customer_user_id?: string | null;
  items?: RentalItemView[];
}
