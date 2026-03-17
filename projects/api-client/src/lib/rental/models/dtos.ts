import { Guid } from '../../core/common';
import { RentalPriority } from './views';

type ChecklistType = 'PICKUP' | 'DROPOFF';

// ------------------- Survey / Answer DTOs -------------------

export type SurveyAnswerResponse = 'Yes' | 'No' | 'NotImportant' | 'Unknown';

/** Single answer entry used in bulk-submit. */
export interface AnswerEntryDto {
  question_uuid: Guid;
  response: SurveyAnswerResponse;
  comment?: string | null;
}

/** Payload for submitting a single answer to a question. */
export interface SubmitAnswerDto {
  question_uuid: Guid;
  response: SurveyAnswerResponse;
  comment?: string | null;
  rental_uuid?: Guid | null;
}

/** Bulk-submit multiple answers for a rental at once. */
export interface SubmitAnswersBulkDto {
  rental_uuid: Guid;
  answers: AnswerEntryDto[];
}

/** Payload for creating a new survey question. */
export interface CreateQuestionDto {
  question_text: string;
  category?: string | null;
  display_order?: number;
  is_active?: boolean;
}

/**
 * Context about a rental event used for AI-based question recommendations.
 * Maps to EventContextDto on the server.
 */
export interface EventContextDto {
  event_name: string;
  description?: string | null;
  start?: string | null;
  end?: string | null;
  location?: string | null;
}

// ------------------- Rental DTOs -------------------

/** Payload for creating a new rental. */
export interface CreateRentalDto {
  request_title?: string | null;
  request_description?: string | null;
  event_name?: string | null;
  customer_notes?: string | null;
  delivery_address?: string | null;
  priority?: RentalPriority;
  /** ISO-8601 instant string. */
  planned_pickup_at?: string | null;
  /** ISO-8601 instant string. */
  planned_return_at?: string | null;
}

/** Payload for partially updating a rental. Null fields are left unchanged. */
export interface UpdateRentalDto {
  rental_status_guid?: Guid | null;
  request_title?: string | null;
  request_description?: string | null;
  event_name?: string | null;
  customer_notes?: string | null;
  delivery_address?: string | null;
  priority?: RentalPriority | null;
  /** ISO-8601 instant string. */
  planned_pickup_at?: string | null;
  /** ISO-8601 instant string. */
  planned_return_at?: string | null;
}

// ------------------- Checklist DTOs -------------------

/** Payload for generating a checklist for a rental. */
export interface GenerateChecklistDto {
  checklist_type: ChecklistType;
  source_checklist_guid?: Guid | null;
  notes?: string | null;
}

/** Payload for signing off a checklist. */
export interface SignChecklistDto {
  notes?: string | null;
}

/** Payload for submitting an inspection result for a single checklist item. */
export interface UpdateChecklistItemDto {
  quantity_checked: number;
  condition_ok: boolean;
  condition_notes?: string | null;
  damaged_quantity?: number;
  damage_summary?: string | null;
  damage_description?: string | null;
}

/** Payload for status transitions on an existing rental. */
export interface TransitionRentalStatusDto {
  target_status_guid: Guid;
  reason?: string | null;
}
