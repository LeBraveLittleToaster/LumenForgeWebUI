// src/api/types/device.ts
export type UUID = string;

export interface DeviceDTO {
  id: number;
  uuid: UUID;
  serialNumber: string | null;
  name: string;
  description: string | null;
  photoUrl: string | null;
  purchasePrice: number | null;
  purchaseDate: string | null;
  vendor: VendorDTO;
  maintenanceStatus: MaintenanceStatusDTO;
  categories: CategoryDTO[];
}

export interface DeviceAndStockDTO {
  uuid: UUID;
  serialNumber: string | null;
  name: string;
  stockCount:number;
  stockUnitType:string;
  vendorName: string;
}

export interface DeviceRequestDTO {
  serialNumber: string | null;
  name: string;
  description: string | null;
  photoUrl: string | null;
  purchasePrice: number | null;
  purchaseDate: string | null; // ISO date
  vendorId: number;
  maintenanceStatusId: number;
  categoryIds: number[] | null;
}

export interface VendorDTO {
  id: number;
  name: string;
}

export interface MaintenanceStatusDTO {
  id: number;
  name: string;
}

export interface CategoryDTO {
  id: number;
  name: string;
}

export interface SpringPage<T> {
  content: T[];
  pageable?: unknown;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  sort?: unknown;
  empty: boolean;
}
