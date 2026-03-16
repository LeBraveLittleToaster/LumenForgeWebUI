import { Guid } from '../../core/common';

export interface CreateCatalogueItemDto {
  device_guid: Guid;
  name: string;
  description: string;
  photo_url?: string | null;
  is_published?: boolean;
  sort_order?: number;
}

export interface UpdateCatalogueItemDto {
  device_guid?: Guid | null;
  name?: string | null;
  description?: string | null;
  photo_url?: string | null;
  is_published?: boolean | null;
  sort_order?: number | null;
}