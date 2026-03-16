import { Guid, IsoInstant } from '../../core/common';

export interface CatalogueListView<T> {
  list: T[];
  total: number;
}

export interface CatalogueItemView {
  guid: Guid;
  device_guid: Guid;
  name: string;
  description: string;
  photo_url?: string | null;
  is_published: boolean;
  sort_order: number;
  created_at?: IsoInstant;
  updated_at?: IsoInstant;
}

export type CatalogueListOrPaginatedList = CatalogueItemView[] | CatalogueListView<CatalogueItemView>;