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
  totalQuantity: number | null;
  availableQuantity: number | null;
  availabilityStatus: AvailabilityStatus;
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
  totalQuantity: number | null;
  availableQuantity: number | null;
  availabilityStatus: AvailabilityStatus;
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
  name: string; // or enum-ish string depending on your backend
}

export enum AvailabilityStatus {
  Available = "AVAILABLE",
  LowStock = "LOW_STOCK",
  OutOfStock = "OUT_OF_STOCK",
  Maintenance = "MAINTENANCE",
  Unavailable = "UNAVAILABLE",
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
