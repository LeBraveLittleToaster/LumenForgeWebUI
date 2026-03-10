import { Guid } from '../../core/common';

export interface CreateMaintenanceStatusDto {
  name: string;
  description?: string | null;
}

export interface UpdateMaintenanceStatusDto {
  name?: string | null;
  description?: string | null;
}

export interface CreateMaintenanceBacklogDto {
  statusUuid: Guid;
  issueSummary: string;
  issueDescription?: string | null;
  quantityAffected: number;
  deviceUuid?: Guid | null;
  rentalItemUuid?: Guid | null;
}

export interface UpdateMaintenanceBacklogDto {
  statusUuid?: Guid | null;
  issueSummary?: string | null;
  issueDescription?: string | null;
  quantityAffected?: number | null;
  resolve?: boolean | null;
}
