import { Guid } from '../../core/common';
import { SurveyAnswerResponse } from './dtos';

// ------------------- Enums -------------------

export type ChecklistType = 'PICKUP' | 'DROPOFF';

export type RentalPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type RentalItemStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'PARTIALLY_APPROVED'
  | 'REJECTED'
  | 'PICKED_UP'
  | 'PARTIALLY_RETURNED'
  | 'RETURNED'
  | 'LOST'
  | 'DAMAGED';

export type BindingType = 'RENTAL' | 'RENTAL_REQUEST' | 'MAINTENANCE';

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

export interface RentalStatusView {
  uuid: Guid;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface RentalTransitionsView {
  current: RentalStatusView;
  allowed: RentalStatusView[];
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
  start: string;
  end: string;
  created_at: string;
}

export interface ChecklistItemView {
  uuid: Guid;
  rental_item_uuid: Guid;
  is_checked: boolean;
  quantity_checked: number;
  condition_ok: boolean;
  condition_notes: string | null;
  damaged_quantity: number;
  damage_summary: string | null;
  damage_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistView {
  uuid: Guid;
  checklist_type: ChecklistType;
  source_checklist_uuid: Guid | null;
  generated_by_user_id: string | null;
  generated_at: string;
  signed_at: string | null;
  signed_by_user_id: string | null;
  notes: string | null;
  total_items: number;
  checked_items_count: number;
  is_complete: boolean;
  is_signed: boolean;
  created_at: string;
  updated_at: string;
  items: ChecklistItemView[];
}

export interface RentalItemView {
  uuid: Guid;
  status: RentalItemStatus;
  quantity_requested: number;
  quantity_approved: number | null;
  quantity_picked_up: number | null;
  quantity_returned: number | null;
  quantity_damaged: number | null;
  quantity_lost: number | null;
  is_approved: boolean;
  approved_at: string | null;
  approved_by_user_id: string | null;
  rejection_reason: string | null;
  planned_pickup_at: string | null;
  planned_return_at: string | null;
  actual_pickup_at: string | null;
  actual_return_at: string | null;
  daily_rate: number | null;
  deposit_amount: number | null;
  condition_notes: string | null;
  pickup_notes: string | null;
  return_notes: string | null;
  stock_bindings: StockBindingView[];
  created_at: string;
  updated_at: string;
}

export interface RentalView {
  uuid: Guid;
  rental_status_uuid: Guid;
  rental_status_name: string;
  customer_user_id: string;
  request_title: string | null;
  request_description: string | null;
  event_name: string | null;
  customer_notes: string | null;
  delivery_address: string | null;
  priority: RentalPriority;
  requested_at: string | null;
  planned_pickup_at: string | null;
  planned_return_at: string | null;
  created_at: string;
  pickup_at: string | null;
  dropoff_at: string | null;
  completed_at: string | null;
  invoiced_at: string | null;
  paid_at: string | null;
  reported_at: string | null;
  assigned_by_user_id: string | null;
  assigned_at: string | null;
  is_scrapped: boolean;
  scrapped_at: string | null;
  updated_at: string;
  items: RentalItemView[];
}
