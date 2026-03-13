import { Guid } from '../../core/common';

export interface CreateMaintenanceStatusDto {
  name: string;
  description?: string | null;
}

export interface UpdateMaintenanceStatusDto {
  name?: string | null;
  description?: string | null;
}

export interface CreateMaintenanceTaskDto {
  description: string;
  status?: number | null;
  assigned_to_user_kc_id?: string | null;
  affected_device_guids?: Guid[] | null;
}

export interface CreateMaintenanceJobDto {
  name: string;
  description: string;
  device_guids: Guid[];
  related_rental_uuid?: Guid | null;
  related_job_guids?: Guid[] | null;
  tasks?: CreateMaintenanceTaskDto[] | null;
}

export interface UpdateMaintenanceJobDto {
  name?: string | null;
  description?: string | null;
  status?: number | null;
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
