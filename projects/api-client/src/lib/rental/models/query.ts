import { BindingType, RentalPriority } from './views';

/** Common paging + search parameters for listing survey questions. */
export interface RentalQuestionsQueryDto {
  search?: string | null;
  limit?: number;
  offset?: number;
}

/** Paging, search, and filter parameters for listing rentals. */
export interface RentalQueryDto {
  limit?: number;
  offset?: number;
  search?: string | null;
  customer_user_id?: string | null;
  priority?: RentalPriority | null;
}

/** Query parameters for the stock-binding conflict check endpoint. */
export interface RentalConflictQueryDto {
  device_guid: string;
  start: string;
  end: string;
  binding_type?: BindingType;
  limit?: number;
  offset?: number;
}

/** Flags for including related data when fetching a rental. */
export type RentalInclude = 'Items' | 'Checklists' | 'Invoices' | 'Events' | 'Extensions' | 'Report';
