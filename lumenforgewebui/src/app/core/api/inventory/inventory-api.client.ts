// inventory-api/src/lib/inventory-api.client.ts
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { toHttpParams } from './http-params';

import { CategoryView, DeviceParameterView, DeviceView, StockView, VendorView } from './models/views';
import {
  CreateCategoryDto,
  CreateDeviceDto,
  CreateVendorDto,
  SetDeviceCategoriesDto,
  UpdateCategoryDto,
  UpdateDeviceDto,
  UpdateStockDto,
  UpdateVendorDto,
  UpsertDeviceParameterDto
} from './models/dtos';
import { INVENTORY_API_BASE_URL } from './token';
import { ListQueryDto } from './models/query';
import { Guid } from './common/common';

@Injectable({ providedIn: 'root' })
export class InventoryApiClient {
  constructor(
    private readonly http: HttpClient,
    @Inject(INVENTORY_API_BASE_URL) private readonly baseUrl: string
  ) {}

  private url(path: string): string {
    const b = this.baseUrl?.replace(/\/+$/, '') ?? '';
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${b}${p}`;
  }

  // -------------------------
  // Devices (api/v1/inventory/devices)
  // -------------------------
  listDevices(query: ListQueryDto = {}): Observable<DeviceView[]> {
    return this.http.get<DeviceView[]>(
      this.url('/api/v1/inventory/devices'),
      { params: toHttpParams({ search: query.search ?? undefined, limit: query.limit, offset: query.offset }) }
    );
  }

  getDevice(deviceGuid: Guid): Observable<DeviceView> {
    return this.http.get<DeviceView>(this.url(`/api/v1/inventory/devices/${deviceGuid}`));
  }

  createDevice(dto: CreateDeviceDto): Observable<DeviceView> {
    return this.http.put<DeviceView>(this.url('/api/v1/inventory/devices'), dto);
  }

  updateDevice(deviceGuid: Guid, dto: UpdateDeviceDto): Observable<DeviceView> {
    return this.http.patch<DeviceView>(this.url(`/api/v1/inventory/devices/${deviceGuid}`), dto);
  }

  deleteDevice(deviceGuid: Guid): Observable<void> {
    return this.http.delete<void>(this.url(`/api/v1/inventory/devices/${deviceGuid}`));
  }

  setDeviceCategories(deviceGuid: Guid, dto: SetDeviceCategoriesDto): Observable<DeviceView> {
    return this.http.put<DeviceView>(this.url(`/api/v1/inventory/devices/${deviceGuid}/categories`), dto);
  }

  upsertDeviceParameter(deviceGuid: Guid, dto: UpsertDeviceParameterDto): Observable<DeviceParameterView> {
    return this.http.put<DeviceParameterView>(this.url(`/api/v1/inventory/devices/${deviceGuid}/parameters`), dto);
  }

  removeDeviceParameter(deviceGuid: Guid, parameterKey: string): Observable<void> {
    const key = encodeURIComponent(parameterKey);
    return this.http.delete<void>(this.url(`/api/v1/inventory/devices/${deviceGuid}/parameters/${key}`));
  }

  updateDeviceStock(deviceGuid: Guid, dto: UpdateStockDto): Observable<StockView> {
    return this.http.patch<StockView>(this.url(`/api/v1/inventory/devices/${deviceGuid}/stock`), dto);
  }

  // -------------------------
  // Categories (api/v1/inventory/categories)
  // -------------------------
  listCategories(query: ListQueryDto = {}): Observable<CategoryView[]> {
    return this.http.get<CategoryView[]>(
      this.url('/api/v1/inventory/categories'),
      { params: toHttpParams({ search: query.search ?? undefined, limit: query.limit, offset: query.offset }) }
    );
  }

  getCategory(categoryGuid: Guid): Observable<CategoryView> {
    return this.http.get<CategoryView>(this.url(`/api/v1/inventory/categories/${categoryGuid}`));
  }

  createCategory(dto: CreateCategoryDto): Observable<CategoryView> {
    return this.http.put<CategoryView>(this.url('/api/v1/inventory/categories'), dto);
  }

  updateCategory(categoryGuid: Guid, dto: UpdateCategoryDto): Observable<CategoryView> {
    return this.http.patch<CategoryView>(this.url(`/api/v1/inventory/categories/${categoryGuid}`), dto);
  }

  deleteCategory(categoryGuid: Guid): Observable<void> {
    return this.http.delete<void>(this.url(`/api/v1/inventory/categories/${categoryGuid}`));
  }

  // -------------------------
  // Vendors (api/v1/inventory/vendors)
  // -------------------------
  listVendors(query: ListQueryDto = {}): Observable<VendorView[]> {
    return this.http.get<VendorView[]>(
      this.url('/api/v1/inventory/vendors'),
      { params: toHttpParams({ search: query.search ?? undefined, limit: query.limit, offset: query.offset }) }
    );
  }

  getVendor(vendorGuid: Guid): Observable<VendorView> {
    return this.http.get<VendorView>(this.url(`/api/v1/inventory/vendors/${vendorGuid}`));
  }

  createVendor(dto: CreateVendorDto): Observable<VendorView> {
    return this.http.put<VendorView>(this.url('/api/v1/inventory/vendors'), dto);
  }

  updateVendor(vendorGuid: Guid, dto: UpdateVendorDto): Observable<VendorView> {
    return this.http.patch<VendorView>(this.url(`/api/v1/inventory/vendors/${vendorGuid}`), dto);
  }

  deleteVendor(vendorGuid: Guid): Observable<void> {
    return this.http.delete<void>(this.url(`/api/v1/inventory/vendors/${vendorGuid}`));
  }
}