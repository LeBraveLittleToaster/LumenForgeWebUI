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
  purchaseDate: string | null; // ISO date (yyyy-mm-dd)
  vendor: VendorDTO;
  maintenanceStatus: MaintenanceStatusDTO;
  categories: CategoryDTO[];
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

/**
 * Spring Data Page<T>
 */
export interface Page<T> {
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
