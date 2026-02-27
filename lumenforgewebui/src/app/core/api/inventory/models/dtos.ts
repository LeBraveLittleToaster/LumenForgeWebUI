import { Guid, IsoDate, StockUnitType } from './../common/common';

export interface CreateDeviceParameterDto {
  key: string;
  value: string;
}

export interface CreateStockDto {
  stockUnitType: StockUnitType;
  stockCount: number;
}

export interface CreateDeviceDto {
  serialNumber: string;
  name?: string | null;
  description?: string | null;
  photoUrl?: string | null;
  vendorGuid: Guid;
  maintenanceStatusUuid?: Guid | null;
  purchasePrice: number;
  purchaseDate: IsoDate;
  stock: CreateStockDto;
  parameters?: CreateDeviceParameterDto[];
  categoryGuids?: Guid[];
}

export interface UpdateDeviceDto {
  serialNumber?: string | null;
  name?: string | null;
  description?: string | null;
  photoUrl?: string | null;
  vendorGuid?: Guid | null;
  maintenanceStatusUuid?: Guid | null;
  purchasePrice?: number | null;
  purchaseDate?: IsoDate | null;
}

export interface UpdateStockDto {
  stockUnitType?: StockUnitType | null;
  stockCount?: number | null;
}

export interface SetDeviceCategoriesDto {
  categoryGuids: Guid[];
}

export interface UpsertDeviceParameterDto {
  key: string;
  value: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryDto {
  name?: string | null;
  description?: string | null;
}

export interface CreateVendorDto {
  name: string;
}

export interface UpdateVendorDto {
  name: string;
}