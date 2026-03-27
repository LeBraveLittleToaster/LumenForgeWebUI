import { Guid } from '../../core/common';

// ------------------- Enums -------------------

export type ChecklistType = 'PICKUP' | 'DROPOFF';

export type RentalPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

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

export type QuestionDataType = 'NUMBER_INT' | 'NUMBER_FLOAT' | 'FREETEXT' | 'YES_NO';

// ------------------- Rental Question Views -------------------

export interface QuestionView {
  guid: Guid;
  text: string;
  category: string | null;
  display_order: number;
  question_data_type?: QuestionDataType | null;
}

// ------------------- Rental Action / History Views -------------------

/** An action available to be performed on a rental process at its current stage. */
export interface RentalActionView {
  action_type: RentalActionType | string;
  description?: string | null;
}

/** Audit log entry returned by the rental history endpoint. */
export interface RentalActionLogView {
  guid: Guid;
  action_type: RentalActionType | string;
  performed_by_kc_id: string;
  stage_before: RentalStage;
  stage_after: RentalStage;
  success: boolean;
  error_message?: string | null;
  performed_at: string;
}

// ------------------- Stock Binding Views -------------------

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

// ------------------- Checklist Views -------------------

export interface ChecklistItemView {
  guid: Guid;
  stock_binding_guid: Guid;
  device_name: string;
  is_scanned: boolean;
  scanned_value?: string | null;
  scanned_by_kc_id?: string | null;
  scanned_at?: string | null;
}

export interface ChecklistView {
  guid: Guid;
  checklist_type: ChecklistType;
  is_signed: boolean;
  signed_by_kc_id?: string | null;
  signed_at?: string | null;
  created_at: string;
  items: ChecklistItemView[];
}

// ------------------- Extension / Damage Views -------------------

export interface RentalExtensionView {
  guid: Guid;
  new_requested_end: string;
  original_end: string;
  reason?: string | null;
  is_approved?: boolean | null;
  review_comment?: string | null;
  requested_by_kc_id: string;
  reviewed_by_kc_id?: string | null;
  requested_at: string;
  reviewed_at?: string | null;
}

export interface RentalDamageReportView {
  guid: Guid;
  stock_binding_guid: Guid;
  description: string;
  severity: DamageSeverity;
  reported_by_kc_id: string;
  reported_at: string;
}

// ------------------- Core Rental Views -------------------

/** Inner rental data — nested inside RentalProcessView.rental. */
export interface RentalView {
  uuid: Guid;
  customer_kc_id: string;
  customer_name?: string | null;
  customer_email?: string | null;
  purpose?: string | null;
  requested_start: string;
  requested_end: string;
  priority: RentalPriority;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

/** Full process view returned by GET /rentals/:guid. */
export interface RentalProcessView {
  guid: Guid;
  current_stage: RentalStage;
  created_by_kc_id: string;
  created_at: string;
  updated_at: string;
  rental?: RentalView | null;
  checklists?: ChecklistView[] | null;
  extensions?: RentalExtensionView[] | null;
  damage_reports?: RentalDamageReportView[] | null;
}

/** Compact summary view returned by rental list endpoints. */
export interface RentalProcessSummaryView {
  guid: Guid;
  current_stage: RentalStage;
  created_by_kc_id: string;
  customer_name?: string | null;
  customer_email?: string | null;
  requested_start?: string | null;
  requested_end?: string | null;
  priority?: RentalPriority | null;
  created_at: string;
  updated_at: string;
}

