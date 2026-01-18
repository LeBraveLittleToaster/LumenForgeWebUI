// src/api/types/device.ts
export type UUID = string;

export interface Device {
  id: number;
  uuid: UUID;
  serialNumber: string | null;
  name: string;
  description: string | null;
  photoUrl: string | null;
  purchasePrice: number | null;
  purchaseDate: string | null; // ISO date (yyyy-mm-dd)
  vendor: Vendor;
  maintenanceStatus: MaintenanceStatus;
  categories: Category[];
  // add additional fields if your backend returns them
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

export interface Vendor {
  id: number;
  name: string;
}

export interface MaintenanceStatus {
  id: number;
  name: string; // or enum-ish string depending on your backend
}

export interface Category {
  id: number;
  name: string;
}

/**
 * Spring Data Page<T> common shape.
 * If your backend uses a different paging wrapper, adjust this.
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
