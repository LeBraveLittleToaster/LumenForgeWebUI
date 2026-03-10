import { Guid, IsoInstant } from '../../core/common';

export interface ListView<T> {
  list: T[];
  total: number;
}

export interface MaintenanceStatusView {
  uuid: Guid;
  name: string;
  description?: string | null;
  created_at: IsoInstant;
  updated_at: IsoInstant;
}

export interface MaintenanceBacklogView {
  uuid: Guid;
  issue_summary: string;
  issue_description?: string | null;
  quantity_affected: number;
  status: MaintenanceStatusView;
  device_uuid?: Guid | null;
  rental_item_uuid?: Guid | null;
  checklist_item_uuid?: Guid | null;
  reported_at: IsoInstant;
  resolved_at?: IsoInstant | null;
  created_at: IsoInstant;
  updated_at: IsoInstant;
}
