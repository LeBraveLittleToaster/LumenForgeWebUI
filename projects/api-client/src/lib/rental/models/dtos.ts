import { Guid } from '../../core/common';
import { ChecklistType, DamageSeverity, PaymentMethod } from './views';

// ------------------- Rental Questions DTOs -------------------

export interface CreateRentalFormInput {
  event_name: string;
  event_description: string;
  event_start_date: string;
  event_end_date: string;
  event_location: string;
}

// ------------------- Rental Create / Action DTOs -------------------

export interface CreateRentalDto {
  customer_name?: string | null;
  customer_email?: string | null;
  purpose?: string | null;
  requested_start: string;
  requested_end: string;
  notes?: string | null;
  answers?: CreateRentalAnswerDto[];
}

export interface CreateRentalAnswerDto {
  question_guid: Guid;
  answer: string;
}

export interface ApproveRequestDto {
  comment?: string | null;
}

export interface RejectRequestDto {
  reason: string;
}

export interface ItemAssignmentDto {
  device_guid: Guid;
  quantity: number;
}

export interface AssignItemsDto {
  items: ItemAssignmentDto[];
}

export interface RemoveItemsDto {
  stock_binding_guids: Guid[];
}

export interface ApproveItemsDto {
  comment?: string | null;
}

export interface RejectItemsDto {
  reason: string;
}

export interface GenerateChecklistDto {
  checklist_type: ChecklistType;
}

export interface SignChecklistDto {
  checklist_guid: Guid;
  signature_data: string;
}

export interface ScanChecklistDto {
  checklist_guid: Guid;
  scanned_value: string;
}

export interface RecordPickupDto {
  notes?: string | null;
}

export interface RecordReturnDto {
  notes?: string | null;
}

export interface RequestExtensionDto {
  new_requested_end: string;
  reason?: string | null;
}

export interface ApproveExtensionDto {
  extension_guid: Guid;
  comment?: string | null;
}

export interface RejectExtensionDto {
  extension_guid: Guid;
  reason: string;
}

export interface DamageEntryDto {
  stock_binding_guid: Guid;
  description: string;
  severity: DamageSeverity;
}

export interface RecordDamagesDto {
  damages: DamageEntryDto[];
}

export interface CreateMaintenanceJobsDto {
  damaged_stock_binding_guids: Guid[];
}

export interface GenerateInvoiceDto {
  due_date_override?: string | null;
}

export interface RecordPaymentDto {
  invoice_guid: Guid;
  amount: number;
  method: PaymentMethod;
  reference?: string | null;
}

export interface GenerateReportDto {
  include_damages?: boolean;
  include_payments?: boolean;
}

export interface CompleteRentalDto {
  comment?: string | null;
}

export interface CancelRentalDto {
  reason: string;
}

export interface ScrapRentalDto {
  reason: string;
}
