// src/api/devices/devicesApi.ts
import type { AxiosInstance } from "axios";

import type { Device, DeviceRequestDTO, Page, UUID } from "../types/device";
import { getAxiosWithAuthInterceptor } from "../axios";

export interface GetDevicesPageParams {
  page?: number; // 0-based
  size?: number;
  sort?: string | string[]; // e.g. "name,asc" or ["name,asc","id,desc"]
}

/**
 * Devices API client.
 *
 * Assumed endpoints (typical Spring REST controller):
 * - GET    /devices                -> Page<Device>
 * - GET    /devices/all            -> Device[]
 * - GET    /devices/{id}           -> Device
 * - GET    /devices/uuid/{uuid}    -> Device
 * - POST   /devices                -> Device
 * - PUT    /devices/{id}           -> Device
 * - DELETE /devices/{id}           -> void
 *
 * If your controller differs (e.g. /api/devices), adjust `basePath`.
 */
export class DevicesApi {
  private readonly http: AxiosInstance;
  private readonly basePath: string;

  constructor(opts: { baseUrl: string; basePath?: string }) {
    this.http = getAxiosWithAuthInterceptor(opts.baseUrl);
    this.basePath = opts.basePath ?? "/devices";
  }

  async getPage(params: GetDevicesPageParams = {}): Promise<Page<Device>> {
    const { data } = await this.http.get<Page<Device>>(this.basePath, {
      params,
      paramsSerializer: {
        // Handles sort as repeated query params: sort=a&sort=b
        serialize: (p) => {
          const usp = new URLSearchParams();
          for (const [k, v] of Object.entries(p ?? {})) {
            if (v === undefined || v === null) continue;
            if (Array.isArray(v)) v.forEach((vv) => usp.append(k, String(vv)));
            else usp.append(k, String(v));
          }
          return usp.toString();
        },
      },
    });
    return data;
  }

  async getAll(): Promise<Device[]> {
    const { data } = await this.http.get<Device[]>(`${this.basePath}`);
    return data;
  }

  async getById(id: number): Promise<Device> {
    const { data } = await this.http.get<Device>(`${this.basePath}/${id}`);
    return data;
  }

  async getByUuid(uuid: UUID): Promise<Device> {
    const { data } = await this.http.get<Device>(`${this.basePath}/uuid/${uuid}`);
    return data;
  }

  async create(payload: DeviceRequestDTO): Promise<Device> {
    const { data } = await this.http.post<Device>(this.basePath, payload);
    return data;
  }

  async update(id: number, payload: DeviceRequestDTO): Promise<Device> {
    const { data } = await this.http.put<Device>(`${this.basePath}/${id}`, payload);
    return data;
  }

  async remove(id: number): Promise<void> {
    await this.http.delete(`${this.basePath}/${id}`);
  }
}
