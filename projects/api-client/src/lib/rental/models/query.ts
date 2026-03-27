import { RentalSortField, RentalStage } from './views';

/** Paging, search, and filter parameters for listing rental processes. */
export interface RentalQueryDto {
  limit?: number;
  offset?: number;
  search?: string | null;
  stages?: RentalStage[];
  sortBy?: RentalSortField;
  ascending?: boolean;
  createdAfter?: string | null;
  createdBefore?: string | null;
  ownerKcId?: string | null;
}

export interface RentalHistoryQueryDto {
  limit?: number;
  offset?: number;
}

/** Flags for including related data when fetching a rental process. */
export type RentalInclude = 'checklists' | 'extensions' | 'damage_reports';
