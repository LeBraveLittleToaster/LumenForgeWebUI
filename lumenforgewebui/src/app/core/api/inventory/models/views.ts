import { Guid, IsoDate, IsoInstant, StockUnitType } from "../common/common";

export interface CategoryView {
  guid: Guid;
  name: string;
  description?: string | null;
  created_at: IsoInstant;
  updated_at: IsoInstant;
}

export interface VendorView {
  guid: Guid;
  name: string;
  created_at: IsoInstant;
  updated_at: IsoInstant;
}

export interface DeviceParameterView {
  key: string;
  value: string;
  created_at: IsoInstant;
  updated_at: IsoInstant;
}

export interface StockView {
  uuid: Guid;
  stock_unit_type: StockUnitType;
  stock_count: number;
  created_at: IsoInstant;
  updated_at: IsoInstant;
}

export interface DeviceView {
  guid: Guid;
  serial_number: string;
  name?: string | null;
  description?: string | null;
  photo_url?: string | null;
  purchase_price: number;
  purchase_date: IsoDate;
  maintenance_status_uuid: Guid;
  maintenance_status_name: string;
  vendor: VendorView;
  stock?: StockView | null;
  parameters: DeviceParameterView[];
  categories: CategoryView[];
  created_at: IsoInstant;
  updated_at: IsoInstant;
}